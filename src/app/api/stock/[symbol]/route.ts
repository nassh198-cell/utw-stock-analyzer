import { NextRequest, NextResponse } from "next/server";
import { getStockInfo } from "@/lib/stock-universe";
import { fetchStockMetrics, fetchHistoricalPrices } from "@/lib/yahoo-finance";
import { calculateValuationScore } from "@/lib/valuation";
import { StockDetail } from "@/types/stock";

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  const { symbol } = params;
  const upperSymbol = symbol.toUpperCase();

  const stockInfo = getStockInfo(upperSymbol);
  const metrics = await fetchStockMetrics(upperSymbol);
  if (!metrics) {
    return NextResponse.json(
      { error: "주식 데이터를 불러올 수 없습니다." },
      { status: 404 }
    );
  }

  const valuationScore = calculateValuationScore(metrics);
  const historicalPrices = await fetchHistoricalPrices(upperSymbol, "1y");

  const detail: StockDetail = {
    symbol: upperSymbol,
    name: stockInfo?.name ?? upperSymbol,
    sector: stockInfo?.sector ?? "기타",
    industry: stockInfo?.industry ?? "기타",
    marketCap: 0,
    description: `${upperSymbol} 종목에 대한 상세 분석입니다.`,
    country: "US",
    website: "",
    valuationScore,
    metrics,
    historicalPrices: historicalPrices.slice(0, 252),
  };

  return NextResponse.json(detail);
}
