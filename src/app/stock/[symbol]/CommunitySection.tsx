"use client";

import { useEffect, useState } from "react";
import { ExternalLink, RefreshCw, MessageSquare, Newspaper, FileText } from "lucide-react";

interface CommunityPost {
  title: string;
  description: string;
  link: string;
  source: "cafe" | "blog" | "news";
  author?: string;
  date?: string;
  sentiment: "positive" | "negative" | "neutral";
}

interface CommunityData {
  symbol: string;
  companyName: string;
  sentimentScore: number;
  stats: { total: number; positive: number; negative: number; neutral: number };
  posts: CommunityPost[];
}

function SourceIcon({ source }: { source: string }) {
  switch (source) {
    case "cafe":
      return <MessageSquare className="w-3.5 h-3.5 text-orange-400" />;
    case "blog":
      return <FileText className="w-3.5 h-3.5 text-blue-400" />;
    case "news":
      return <Newspaper className="w-3.5 h-3.5 text-green-400" />;
    default:
      return <MessageSquare className="w-3.5 h-3.5 text-slate-400" />;
  }
}

function SourceLabel({ source }: { source: string }) {
  switch (source) {
    case "cafe": return "카페";
    case "blog": return "블로그";
    case "news": return "뉴스";
    default: return source;
  }
}

function SentimentBadge({ sentiment }: { sentiment: string }) {
  if (sentiment === "positive") {
    return <span className="text-xs text-emerald-400 bg-emerald-600/20 px-1.5 py-0.5 rounded">긍정</span>;
  }
  if (sentiment === "negative") {
    return <span className="text-xs text-red-400 bg-red-600/20 px-1.5 py-0.5 rounded">부정</span>;
  }
  return <span className="text-xs text-slate-400 bg-slate-700 px-1.5 py-0.5 rounded">중립</span>;
}

export default function CommunitySection({
  symbol,
  companyName,
}: {
  symbol: string;
  companyName: string;
}) {
  const [data, setData] = useState<CommunityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommunity = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/community/sentiment?symbol=${symbol}&perSource=5`);
      if (res.status === 503) {
        setError("API 키 미설정");
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
    } catch {
      setError("커뮤니티 데이터를 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunity();
  }, [symbol]);

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <RefreshCw className="w-4 h-4 animate-spin" />
          네이버 커뮤니티 데이터 로딩 중...
        </div>
      </div>
    );
  }

  if (error === "API 키 미설정") {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-3">💬 커뮤니티 동향</h2>
        <div className="bg-slate-800/50 rounded-lg p-4 text-sm text-slate-400">
          <p className="mb-2">
            ⚙️ 네이버 검색 API 키가 설정되지 않았습니다.
          </p>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>
              <a
                href="https://developers.naver.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                developers.naver.com
              </a>
              에서 애플리케이션 등록
            </li>
            <li>Client ID / Client Secret 발급</li>
            <li>
              <code className="bg-slate-700 px-1 rounded">NAVER_CLIENT_ID</code>와{" "}
              <code className="bg-slate-700 px-1 rounded">NAVER_CLIENT_SECRET</code>을
              <code className="bg-slate-700 px-1 rounded">.env.local</code>에 추가
            </li>
          </ol>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return null; // fail silently
  }

  const { sentimentScore, stats, posts } = data;

  const sentimentColor =
    sentimentScore >= 20
      ? "text-emerald-400"
      : sentimentScore <= -20
      ? "text-red-400"
      : "text-slate-300";

  const sentimentBg =
    sentimentScore >= 20
      ? "bg-emerald-600/20"
      : sentimentScore <= -20
      ? "bg-red-600/20"
      : "bg-slate-700";

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">💬 커뮤니티 동향</h2>
        <button
          onClick={fetchCommunity}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          새로고침
        </button>
      </div>

      {/* Sentiment Score + Stats */}
      <div className="flex items-center gap-4 mb-4">
        <div className={`px-3 py-1.5 rounded-lg ${sentimentBg}`}>
          <span className={`text-lg font-bold ${sentimentColor}`}>
            {sentimentScore > 0 ? "+" : ""}{sentimentScore}
          </span>
          <span className="text-xs text-slate-400 ml-1">감성지수</span>
        </div>
        <div className="flex gap-3 text-xs text-slate-400">
          <span>📄 총 {stats.total}건</span>
          <span className="text-emerald-400">긍정 {stats.positive}</span>
          <span className="text-red-400">부정 {stats.negative}</span>
          <span>중립 {stats.neutral}</span>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-2">
        {posts.slice(0, 10).map((post, idx) => (
          <a
            key={idx}
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-slate-800/50 hover:bg-slate-800 rounded-lg p-3 transition-colors group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <SourceIcon source={post.source} />
                  <span className="text-xs text-slate-500">
                    {SourceLabel({ source: post.source })}
                  </span>
                  {post.author && (
                    <span className="text-xs text-slate-600">{post.author}</span>
                  )}
                </div>
                <h4
                  className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors truncate"
                  dangerouslySetInnerHTML={{ __html: post.title }}
                />
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                  {post.description}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <SentimentBadge sentiment={post.sentiment} />
                <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </div>
            </div>
          </a>
        ))}
      </div>

      {posts.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-4">
          최근 커뮤니티 게시글이 없습니다.
        </p>
      )}
    </div>
  );
}
