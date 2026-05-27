"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import ScoreBadge from "@/components/ScoreBadge";
import { StockDetail, MetricScore } from "@/types/stock";

function InterpretationIcon({
  interpretation,
}: {
  interpretation: string;
}) {
  if (interpretation === "저평가")
    return <TrendingUp className="w-4 h-4 text-emerald-400" />;
  if (interpretation === "고평가")
    return <TrendingDown className="w-4 h-4 text-red-400" />;
  return <Minus className="w-4 h-4 text-slate-400" />;
}

function GaugeBar({ score, label }: { score: number; label: string }) {
  const getColor = (s: number) => {
    if (s >= 80) return "bg-emerald-500";
    if (s >= 60) return "bg-blue-500";
    if (s >= 40) return "bg-yellow-500";
    if (s >= 20) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-mono font-bold">{score}</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getColor(score)}`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  );
}

function formatLargeNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
  return `$${num.toFixed(2)}`;
}

function formatPercent(num: number | null): string {
  if (num === null) return "-";
  return `${(num * 100).toFixed(2)}%`;
}

export default function StockDetailPage() {
  const params = useParams();
  const symbol = (params.symbol as string).toUpperCase();

  const [detail, setDetail] = useState<StockDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/stock/${symbol}`);
      if (!res.ok) throw new Error("데이터를 불러올 수 없습니다.");
      const data = await res.json();
      setDetail(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [symbol]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <RefreshCw className="w-10 h-10 animate-spin text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">{symbol} 데이터를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
        <p className="text-red-400 font-medium">{error || "데이터를 찾을 수 없습니다."}</p>
        <Link
          href="/screener"
          className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300"
        >
          ← 스크리너로 돌아가기
        </Link>
      </div>
    );
  }

  const { valuationScore, metrics } = detail;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/screener"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        스크리너로 돌아가기
      </Link>

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">{symbol}</h1>
              <ScoreBadge score={valuationScore.overall} grade={valuationScore.grade} size="lg" />
            </div>
            <p className="text-lg text-slate-300 mt-1">{detail.name}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                {detail.sector}
              </span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                {detail.industry}
              </span>
              <span className="text-sm text-slate-400">
                ${metrics.price?.toFixed(2) ?? "-"}
              </span>
            </div>
          </div>
          <button
            onClick={fetchDetail}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            새로고침
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Valuation Score Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-3">📋 종합 평가 요약</h2>
            <p className="text-slate-300">{valuationScore.summary}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              <GaugeBar score={valuationScore.overall} label="종합 점수" />
            </div>
          </div>

          {/* Metric Scores */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">📊 세부 지표별 점수</h2>
            <div className="space-y-4">
              {valuationScore.metrics.map((metric: MetricScore) => (
                <div
                  key={metric.metricName}
                  className="bg-slate-800/50 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <InterpretationIcon interpretation={metric.interpretation} />
                      <span className="font-medium text-sm text-white">
                        {metric.metricName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-400">
                        {metric.value !== null ? metric.value.toLocaleString() : "N/A"}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          metric.interpretation === "저평가"
                            ? "bg-emerald-600/20 text-emerald-400"
                            : metric.interpretation === "고평가"
                            ? "bg-red-600/20 text-red-400"
                            : "bg-slate-700 text-slate-300"
                        }`}
                      >
                        {metric.interpretation}
                      </span>
                      <span className="text-sm font-bold text-blue-400 w-8 text-right">
                        {metric.score}
                      </span>
                      <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            metric.score >= 80
                              ? "bg-emerald-500"
                              : metric.score >= 60
                              ? "bg-blue-500"
                              : metric.score >= 40
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${metric.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Chart */}
          {detail.historicalPrices && detail.historicalPrices.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">📈 1년 가격 추이</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={detail.historicalPrices}>
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#64748b", fontSize: 11 }}
                      tickFormatter={(v) => {
                        const d = new Date(v);
                        return `${d.getMonth() + 1}/${d.getDate()}`;
                      }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      tick={{ fill: "#64748b", fontSize: 11 }}
                      tickFormatter={(v) => `$${v.toFixed(0)}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                        color: "#f1f5f9",
                      }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, "가격"]}
                      labelFormatter={(label) => `날짜: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="close"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Right: Key Metrics Summary */}
        <div className="space-y-6">
          {/* Key Stats */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">핵심 지표</h2>
            <div className="space-y-3">
              <MetricRow label="현재가" value={metrics.price ? `$${metrics.price.toFixed(2)}` : "-"} />
              <MetricRow label="베타" value={metrics.beta?.toFixed(2) ?? "-"} />
              <MetricRow label="52주 변화율" value={formatPercent(metrics.fiftyTwoWeekChange)} />
            </div>
          </div>

          {/* Info */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-3">ℹ️ 종목 정보</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">섹터</span>
                <span className="text-white">{detail.sector}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">산업</span>
                <span className="text-white">{detail.industry}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">국가</span>
                <span className="text-white">{detail.country}</span>
              </div>
            </div>
          </div>

          {/* About Scoring */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-3">📖 평가 기준</h2>
            <div className="space-y-2 text-sm text-slate-400">
              <p>• <strong className="text-slate-300">52주 변화율 (40%)</strong>: 하락 시 높은 점수 (저평가 신호)</p>
              <p>• <strong className="text-slate-300">Beta (30%)</strong>: 낮을수록 안정적</p>
              <p>• <strong className="text-slate-300">가격 안정성 (30%)</strong>: 적정 가격대 점수</p>
              <p className="mt-3 text-xs text-slate-500">
                ※ Yahoo Finance API 정책으로 인해 PER, PBR 등 세부 지표는 현재 제공되지 않습니다.
                차트 데이터 기반으로 저평가 여부를 분석합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="text-white font-mono font-medium">{value}</span>
    </div>
  );
}
