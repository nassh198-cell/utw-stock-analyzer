import { NextRequest, NextResponse } from "next/server";
import { STOCK_UNIVERSE, SECTORS } from "@/lib/stock-universe";
import { fetchStockMetrics } from "@/lib/yahoo-finance";
import { fetchNaverFundamentals } from "@/lib/naver-finance";
import { calculateValuationScore } from "@/lib/valuation";
import { StockSummary } from "@/types/stock";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sectorsParam = searchParams.get("sectors");
  const minScore = searchParams.get("minScore");
  const maxScore = searchParams.get("maxScore");
  const search = searchParams.get("search");
  const sortBy = searchParams.get("sortBy") || "valuationScore";
  const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = Math.min(parseInt(searchParams.get("pageSize") || "50"), 100);

  let filtered = [...STOCK_UNIVERSE];

  // Filter by sector
  if (sectorsParam) {
    const sectors = sectorsParam.split(",");
    filtered = filtered.filter((s) => sectors.includes(s.sector));
  }

  // Filter by search
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.symbol.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q)
    );
  }

  // Fetch metrics from Yahoo Finance + Naver Finance in parallel
  const batchSize = 20;
  const results: StockSummary[] = [];

  for (let i = 0; i < filtered.length; i += batchSize) {
    const batch = filtered.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (stock) => {
        // Fetch both data sources in parallel
        const [metrics, naver] = await Promise.all([
          fetchStockMetrics(stock.symbol),
          fetchNaverFundamentals(stock.symbol).catch(() => null),
        ]);
        if (!metrics) return null;

        // Merge Naver fundamental data into metrics
        if (naver) {
          if (naver.per !== null) metrics.peRatio = naver.per;
          if (naver.pbr !== null) metrics.pbRatio = naver.pbr;
          if (naver.eps !== null) metrics.eps = naver.eps;
          if (naver.dividendYield !== null) metrics.dividendYield = naver.dividendYield;
        }

        const score = calculateValuationScore(metrics);

        return {
          symbol: stock.symbol,
          name: stock.name,
          sector: stock.sector,
          price: metrics.price,
          marketCap: naver?.marketCap ?? metrics.price * 1,
          peRatio: metrics.peRatio,
          pbRatio: metrics.pbRatio,
          psRatio: metrics.psRatio,
          pegRatio: metrics.pegRatio,
          dividendYield: metrics.dividendYield,
          valuationScore: score?.overall ?? 0,
          scoreGrade: score?.grade ?? "N/A",
          roe: metrics.roe,
        } as StockSummary;
      })
    );

    results.push(...batchResults.filter((r): r is StockSummary => r !== null));
  }

  // Filter by score
  let finalResults = results;
  if (minScore) {
    finalResults = finalResults.filter((r) => r.valuationScore >= parseInt(minScore));
  }
  if (maxScore) {
    finalResults = finalResults.filter((r) => r.valuationScore <= parseInt(maxScore));
  }

  // Sort
  finalResults.sort((a, b) => {
    let cmp = 0;
    switch (sortBy) {
      case "valuationScore":
        cmp = b.valuationScore - a.valuationScore;
        break;
      case "peRatio":
        cmp = (a.peRatio ?? 999) - (b.peRatio ?? 999);
        break;
      case "pbRatio":
        cmp = (a.pbRatio ?? 999) - (b.pbRatio ?? 999);
        break;
      case "dividendYield":
        cmp = (b.dividendYield ?? 0) - (a.dividendYield ?? 0);
        break;
      case "price":
        cmp = b.price - a.price;
        break;
      case "name":
        cmp = a.name.localeCompare(b.name);
        break;
      case "symbol":
        cmp = a.symbol.localeCompare(b.symbol);
        break;
      default:
        cmp = b.valuationScore - a.valuationScore;
    }
    return sortOrder === "asc" ? -cmp : cmp;
  });

  // Paginate
  const total = finalResults.length;
  const paginated = finalResults.slice((page - 1) * pageSize, page * pageSize);

  return NextResponse.json({
    stocks: paginated,
    total,
    page,
    pageSize,
    sectors: SECTORS,
  });
}
