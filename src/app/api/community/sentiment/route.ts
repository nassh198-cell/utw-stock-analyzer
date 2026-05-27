import { NextRequest, NextResponse } from "next/server";
import { getStockInfo } from "@/lib/stock-universe";
import { fetchStockNews, NewsItem } from "@/lib/news";

export interface CommunityPost {
  title: string;
  description: string;
  link: string;
  source: string;
  date?: string;
  sentiment: "positive" | "negative" | "neutral";
}

const POSITIVE_WORDS = [
  "상승", "급등", "호재", "긍정", "실적호조", "성장", "목표가", "매수",
  "반등", "돈", "수익", "기대", "대박", "최고", "강세", "rally", "surge",
  "upgrade", "bullish", "positive", "growth", "profit", "beat", "outperform",
];

const NEGATIVE_WORDS = [
  "하락", "급락", "악재", "부정", "실적부진", "침체", "목표가하향", "매도",
  "폭락", "손실", "우려", "리스크", "쇼크", "약세", "하회", "decline", "drop",
  "downgrade", "bearish", "negative", "loss", "miss", "underperform", "crash",
];

function analyzeSentiment(text: string): CommunityPost["sentiment"] {
  const lower = text.toLowerCase();
  let posScore = 0;
  let negScore = 0;

  for (const word of POSITIVE_WORDS) {
    const regex = new RegExp(word, "gi");
    const matches = lower.match(regex);
    if (matches) posScore += matches.length;
  }

  for (const word of NEGATIVE_WORDS) {
    const regex = new RegExp(word, "gi");
    const matches = lower.match(regex);
    if (matches) negScore += matches.length;
  }

  if (posScore > negScore) return "positive";
  if (negScore > posScore) return "negative";
  return "neutral";
}

function toCommunityPost(item: NewsItem): CommunityPost {
  return {
    title: item.title,
    description: item.description.length > 200
      ? item.description.slice(0, 200) + "..."
      : item.description,
    link: item.link,
    source: item.source,
    date: item.pubDate,
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

  try {
    const news = await fetchStockNews(symbol, companyName);

    const posts: CommunityPost[] = news.map(toCommunityPost);

    const total = posts.length;
    const positive = posts.filter((p) => p.sentiment === "positive").length;
    const negative = posts.filter((p) => p.sentiment === "negative").length;

    const sentimentScore = total > 0
      ? Math.round(((positive - negative) / total) * 100)
      : 0;

    return NextResponse.json({
      symbol,
      companyName,
      sentimentScore,
      stats: { total, positive, negative, neutral: total - positive - negative },
      posts,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch community sentiment", detail: message },
      { status: 500 }
    );
  }
}
