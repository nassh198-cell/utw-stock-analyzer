import { NextRequest, NextResponse } from "next/server";
import { fetchStockMetrics } from "@/lib/yahoo-finance";
import { calculateValuationScore } from "@/lib/valuation";

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  const { symbol } = params;
  const upperSymbol = symbol.toUpperCase();

  const metrics = await fetchStockMetrics(upperSymbol);
  if (!metrics) {
    return NextResponse.json(
      { error: "주식 데이터를 불러올 수 없습니다." },
      { status: 404 }
    );
  }

  const valuationScore = calculateValuationScore(metrics);
  return NextResponse.json({
    symbol: upperSymbol,
    ...valuationScore,
  });
}
