import { NextRequest, NextResponse } from "next/server";
import { getStockInfo } from "@/lib/stock-universe";
import { searchAllSources, stripHtml, NaverSearchItem } from "@/lib/naver-search";

export interface CommunityPost {
  title: string;
  description: string;
  link: string;
  source: "cafe" | "blog" | "news";
  author?: string;
  date?: string;
  sentiment: "positive" | "negative" | "neutral";
}

// 간단한 키워드 기반 감성 분석
function analyzeSentiment(text: string): "positive" | "negative" | "neutral" {
  const positive = [
    "상승", "급등", "호재", "긍정", "실적호조", "성장", "목표가", "매수",
    "반등", "돈", "수익", "기대", "대박", "최고", "강세",
  ];
  const negative = [
    "하락", "급락", "악재", "부정", "실적부진", "침체", "목표가하향", "매도",
    "폭락", "손실", "우려", "리스크", "쇼크", "약세", "하회",
  ];

  const lower = text.toLowerCase();
  const posCount = positive.filter((w) => lower.includes(w)).length;
  const negCount = negative.filter((w) => lower.includes(w)).length;

  if (posCount > negCount) return "positive";
  if (negCount > posCount) return "negative";
  return "neutral";
}

function toCommunityPost(
  item: NaverSearchItem,
  source: CommunityPost["source"]
): CommunityPost {
  const cleanDesc = stripHtml(item.description);
  return {
    title: stripHtml(item.title),
    description: cleanDesc.length > 200 ? cleanDesc.slice(0, 200) + "..." : cleanDesc,
    link: item.link,
    source,
    author: item.cafename || item.bloggername || undefined,
    date: item.postdate || item.pubDate || undefined,
    sentiment: analyzeSentiment(item.title + " " + item.description),
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol")?.toUpperCase();

  if (!symbol) {
    return NextResponse.json(
      { error: "symbol parameter is required" },
      { status: 400 }
    );
  }

  const stockInfo = getStockInfo(symbol);
  const companyName = stockInfo?.name ?? symbol;

  const perSource = parseInt(searchParams.get("perSource") || "5");

  try {
    const { cafe, blog, news } = await searchAllSources(symbol, companyName, perSource);

    const posts: CommunityPost[] = [
      ...cafe.map((item) => toCommunityPost(item, "cafe")),
      ...blog.map((item) => toCommunityPost(item, "blog")),
      ...news.map((item) => toCommunityPost(item, "news")),
    ];

    // 감성 통계
    const total = posts.length;
    const positive = posts.filter((p) => p.sentiment === "positive").length;
    const negative = posts.filter((p) => p.sentiment === "negative").length;
    const neutral = posts.filter((p) => p.sentiment === "neutral").length;

    const sentimentScore = total > 0
      ? Math.round(((positive - negative) / total) * 100)
      : 0;

    return NextResponse.json({
      symbol,
      companyName,
      sentimentScore, // -100 ~ +100
      stats: { total, positive, negative, neutral },
      posts,
    });
  } catch (error) {
    // API 키 미설정 시 친절한 에러 메시지
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("credentials not configured")) {
      return NextResponse.json(
        {
          error: "Naver Search API credentials not configured",
          detail: "Set NAVER_CLIENT_ID and NAVER_CLIENT_SECRET in .env.local",
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch community sentiment", detail: message },
      { status: 500 }
    );
  }
}
