"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, RefreshCw, ChevronDown, ChevronUp, X, AlertCircle } from "lucide-react";
import ScoreBadge from "@/components/ScoreBadge";
import { StockSummary } from "@/types/stock";

type SortField = "valuationScore" | "price" | "name" | "symbol" | "peRatio" | "pbRatio" | "dividendYield";
type SortOrder = "asc" | "desc";

function ScreenerContent() {
  const searchParams = useSearchParams();

  const [stocks, setStocks] = useState<StockSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("valuationScore");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [minScore, setMinScore] = useState("");
  const [sectors, setSectors] = useState<string[]>([]);
  const [allSectors, setAllSectors] = useState<string[]>([]);

  // Read sector from URL param (from dashboard 섹터별 분석 cards)
  useEffect(() => {
    const sectorParam = searchParams.get("sector");
    if (sectorParam) {
      setSectors([sectorParam]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStocks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (minScore) params.set("minScore", minScore);
      if (sectors.length > 0) params.set("sectors", sectors.join(","));
      params.set("sortBy", sortField);
      params.set("sortOrder", sortOrder);
      params.set("pageSize", "100");

      const res = await fetch(`/api/stocks?${params.toString()}`);
      if (!res.ok) throw new Error("데이터를 불러오는데 실패했습니다.");
      const data = await res.json();
      setStocks(data.stocks || []);
      if (data.sectors) setAllSectors(data.sectors);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  }, [search, minScore, sectors, sortField, sortOrder]);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const toggleSector = (sector: string) => {
    setSectors((prev) =>
      prev.includes(sector)
        ? prev.filter((s) => s !== sector)
        : [...prev, sector]
    );
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === "desc" ? (
      <ChevronDown className="w-3 h-3 inline" />
    ) : (
      <ChevronUp className="w-3 h-3 inline" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">주식 스크리너</h1>
          <p className="text-slate-400 text-sm mt-1">
            섹터별로 미국 주식을 검색하고 비교하세요.
          </p>
        </div>
        <button
          onClick={fetchStocks}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          새로고침
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="종목명 또는 티커 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Sector Filter — always visible */}
      {allSectors.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">섹터 카테고리</span>
            {sectors.length > 0 && (
              <button
                onClick={() => setSectors([])}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                전체 보기
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {allSectors.map((sector) => (
              <button
                key={sector}
                onClick={() => toggleSector(sector)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  sectors.includes(sector)
                    ? "bg-blue-600/20 text-blue-400 border-blue-600/30"
                    : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200"
                }`}
              >
                {sector}
                {sectors.includes(sector) && (
                  <X className="w-3 h-3 inline ml-1" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Additional filters row */}
      <div className="flex items-center gap-3">
        <label className="text-xs text-slate-400 whitespace-nowrap">최소 점수</label>
        <input
          type="number"
          min={0}
          max={100}
          value={minScore}
          onChange={(e) => setMinScore(e.target.value)}
          placeholder="0"
          className="w-20 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
        <span className="text-xs text-slate-500">/ 100</span>
        {(sectors.length > 0 || minScore) && (
          <button
            onClick={() => { setSectors([]); setMinScore(""); }}
            className="text-xs text-slate-400 hover:text-white transition-colors ml-auto"
          >
            필터 초기화
          </button>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={fetchStocks} className="ml-auto text-sm text-red-300 hover:text-red-200">
            다시 시도
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">데이터를 불러오는 중...</p>
        </div>
      )}

      {/* Results table */}
      {!loading && !error && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-6 py-3 border-b border-slate-800 text-sm text-slate-400">
            총 {stocks.length}개 종목
            {sectors.length > 0 && (
              <span className="text-blue-400 ml-2">
                · {sectors.join(", ")}
              </span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-slate-800">
                  <th
                    className="px-6 py-3 font-medium cursor-pointer hover:text-white"
                    onClick={() => handleSort("symbol")}
                  >
                    종목 <SortIcon field="symbol" />
                  </th>
                  <th
                    className="px-6 py-3 font-medium cursor-pointer hover:text-white"
                    onClick={() => handleSort("name")}
                  >
                    이름 <SortIcon field="name" />
                  </th>
                  <th className="px-6 py-3 font-medium">섹터</th>
                  <th
                    className="px-6 py-3 font-medium text-right cursor-pointer hover:text-white"
                    onClick={() => handleSort("peRatio")}
                  >
                    PER <SortIcon field="peRatio" />
                  </th>
                  <th
                    className="px-6 py-3 font-medium text-right cursor-pointer hover:text-white"
                    onClick={() => handleSort("pbRatio")}
                  >
                    PBR <SortIcon field="pbRatio" />
                  </th>
                  <th
                    className="px-6 py-3 font-medium text-right cursor-pointer hover:text-white"
                    onClick={() => handleSort("dividendYield")}
                  >
                    배당 <SortIcon field="dividendYield" />
                  </th>
                  <th
                    className="px-6 py-3 font-medium text-right cursor-pointer hover:text-white"
                    onClick={() => handleSort("price")}
                  >
                    가격 <SortIcon field="price" />
                  </th>
                  <th
                    className="px-6 py-3 font-medium text-right cursor-pointer hover:text-white"
                    onClick={() => handleSort("valuationScore")}
                  >
                    점수 <SortIcon field="valuationScore" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {stocks.map((stock) => (
                  <tr
                    key={stock.symbol}
                    className="hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-3.5">
                      <Link
                        href={`/stock/${stock.symbol}`}
                        className="font-semibold text-white hover:text-blue-400 transition-colors"
                      >
                        {stock.symbol}
                      </Link>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-slate-300">
                      <span className="truncate max-w-[180px] block">{stock.name}</span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                        {stock.sector}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right text-sm text-slate-300">
                      {stock.peRatio != null ? stock.peRatio.toFixed(1) : "-"}
                    </td>
                    <td className="px-6 py-3.5 text-right text-sm text-slate-300">
                      {stock.pbRatio != null ? stock.pbRatio.toFixed(2) : "-"}
                    </td>
                    <td className="px-6 py-3.5 text-right text-sm text-slate-300">
                      {stock.dividendYield != null ? `${stock.dividendYield.toFixed(1)}%` : "-"}
                    </td>
                    <td className="px-6 py-3.5 text-right text-sm">
                      ${stock.price?.toFixed(2) ?? "-"}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <ScoreBadge
                        score={stock.valuationScore}
                        grade={stock.scoreGrade}
                        size="sm"
                      />
                    </td>
                  </tr>
                ))}

                {stocks.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                      <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>검색 결과가 없습니다.</p>
                      <p className="text-xs mt-1">검색어를 확인하거나 필터를 초기화해보세요.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ScreenerPage() {
  return (
    <Suspense fallback={
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">로딩 중...</p>
      </div>
    }>
      <ScreenerContent />
    </Suspense>
  );
}
