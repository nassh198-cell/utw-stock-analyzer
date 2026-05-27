"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, TrendingDown, BarChart3, Search, RefreshCw, AlertCircle } from "lucide-react";
import ScoreBadge from "@/components/ScoreBadge";
import { StockSummary } from "@/types/stock";

export default function Home() {
  const [topStocks, setTopStocks] = useState<StockSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stocks?pageSize=30&sortBy=valuationScore&sortOrder=desc");
      if (!res.ok) throw new Error("데이터를 불러오는데 실패했습니다.");
      const data = await res.json();
      setTopStocks(data.stocks || []);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatMarketCap = (cap: number) => {
    if (cap >= 1e12) return `${(cap / 1e12).toFixed(1)}T`;
    if (cap >= 1e9) return `${(cap / 1e9).toFixed(1)}B`;
    if (cap >= 1e6) return `${(cap / 1e6).toFixed(1)}M`;
    return `${cap.toLocaleString()}`;
  };

  const top10 = topStocks.slice(0, 10);

  const sectorStats = useMemo(() => {
    if (topStocks.length === 0) return [];
    const map = new Map<string, { count: number; totalScore: number }>();
    topStocks.forEach((s) => {
      const curr = map.get(s.sector) || { count: 0, totalScore: 0 };
      curr.count++;
      curr.totalScore += s.valuationScore;
      map.set(s.sector, curr);
    });
    return Array.from(map.entries())
      .map(([sector, { count, totalScore }]) => ({
        sector,
        count,
        avgScore: Math.round(totalScore / count),
      }))
      .sort((a, b) => b.count - a.count);
  }, [topStocks]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">해외 주식 저평가 판독기</h1>
          <p className="text-slate-400 mt-1">
            미국 상장 주식의 종합 가치 평가 점수 기반 분석
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-slate-500">
              마지막 업데이트: {lastUpdated.toLocaleTimeString("ko-KR")}
            </span>
          )}
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            새로고침
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <BarChart3 className="w-4 h-4" />
            분석 대상 종목
          </div>
          <p className="text-2xl font-bold text-white">{topStocks.length > 0 ? topStocks.length : "..."}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-emerald-400 text-sm mb-1">
            <TrendingUp className="w-4 h-4" />
            저평가 (A / A+)
          </div>
          <p className="text-2xl font-bold text-white">
            {topStocks.filter((s) => s.scoreGrade === "A" || s.scoreGrade === "A+").length}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-blue-400 text-sm mb-1">
            <TrendingUp className="w-4 h-4" />
            적정 (B / B+)
          </div>
          <p className="text-2xl font-bold text-white">
            {topStocks.filter((s) => s.scoreGrade === "B" || s.scoreGrade === "B+").length}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-orange-400 text-sm mb-1">
            <TrendingDown className="w-4 h-4" />
            고평가 (C 이하)
          </div>
          <p className="text-2xl font-bold text-white">
            {topStocks.filter((s) => !["A", "A+", "B", "B+"].includes(s.scoreGrade)).length}
          </p>
        </div>
      </div>

      {/* Sector Analysis */}
      {!loading && !error && sectorStats.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">📋 섹터별 분석</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {sectorStats.map(({ sector, count, avgScore }) => (
              <Link
                key={sector}
                href={`/screener?sector=${encodeURIComponent(sector)}`}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-blue-600/30 hover:bg-slate-800/80 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                    {sector}
                  </span>
                  <span className="text-xs text-slate-500">{count}종목</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white">{avgScore}</span>
                  <span className="text-xs text-slate-400">평균 점수</span>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-blue-500 transition-all"
                      style={{ width: `${Math.min(100, avgScore)}%` }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2" />

      {/* Error state */}
      {error && (
        <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <div>
            <p className="text-red-400 font-medium">데이터 로딩 오류</p>
            <p className="text-red-300/70 text-sm">{error}</p>
          </div>
          <button onClick={fetchData} className="ml-auto px-4 py-2 bg-red-800/30 hover:bg-red-800/50 rounded-lg text-sm text-red-300">
            다시 시도
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Yahoo Finance에서 주식 데이터를 불러오는 중...</p>
          <p className="text-slate-600 text-sm mt-1">종목 수에 따라 최대 1-2분 소요될 수 있습니다.</p>
        </div>
      )}

      {/* Top Undervalued Stocks */}
      {!loading && !error && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-6 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">🏆 저평가 Top 10</h2>
              <p className="text-slate-400 text-sm mt-1">
                종합 점수가 가장 높은 저평가 종목
              </p>
            </div>
            <Link
              href="/screener"
              className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              모두 보기
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-t border-slate-800 text-left text-xs text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3 font-medium">#</th>
                  <th className="px-6 py-3 font-medium">종목</th>
                  <th className="px-6 py-3 font-medium">섹터</th>
                  <th className="px-6 py-3 font-medium text-right">PER</th>
                  <th className="px-6 py-3 font-medium text-right">배당</th>
                  <th className="px-6 py-3 font-medium text-right">가격</th>
                  <th className="px-6 py-3 font-medium text-right">점수</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {top10.map((stock, idx) => (
                  <tr
                    key={stock.symbol}
                    className="hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-slate-500">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/stock/${stock.symbol}`}
                        className="flex flex-col hover:text-blue-400 transition-colors"
                      >
                        <span className="font-semibold text-white">{stock.symbol}</span>
                        <span className="text-xs text-slate-400 truncate max-w-[200px]">
                          {stock.name}
                        </span>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">
                        {stock.sector}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-slate-300">
                      {stock.peRatio != null ? stock.peRatio.toFixed(1) : "-"}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-slate-300">
                      {stock.dividendYield != null ? `${stock.dividendYield.toFixed(1)}%` : "-"}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      ${stock.price?.toFixed(2) ?? "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ScoreBadge
                        score={stock.valuationScore}
                        grade={stock.scoreGrade}
                        size="sm"
                      />
                    </td>
                  </tr>
                ))}

                {top10.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      표시할 데이터가 없습니다. 새로고침을 눌러주세요.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">📊 평가 방식</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <Search className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-semibold text-white">1. 데이터 수집</h3>
            <p className="text-sm text-slate-400">
              Yahoo Finance API를 통해 미국 상장 종목의 재무 데이터를 실시간으로 수집합니다.
            </p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 bg-emerald-600/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-white">2. 종합 평가</h3>
            <p className="text-sm text-slate-400">
              9가지 핵심 가치 지표(PER, PBR, PSR, PEG, EV/EBITDA, FCF Yield, 배당수익률, Debt/Equity, ROE)를 가중치로 종합 점수화합니다.
            </p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="font-semibold text-white">3. 발굴</h3>
            <p className="text-sm text-slate-400">
              A+ ~ F 등급으로 저평가 종목을 즉시 식별하고, 상세 분석을 제공합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
