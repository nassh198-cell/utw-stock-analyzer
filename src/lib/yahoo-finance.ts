import { ValuationMetrics } from "@/types/stock";
import { getCached, setCache } from "./cache";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function parseNum(val: unknown): number | null {
  if (typeof val === "number" && !isNaN(val) && isFinite(val)) return val;
  return null;
}

async function chartFetch(
  symbol: string,
  range: string
): Promise<Record<string, unknown> | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=1d`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json: Record<string, unknown> = await res.json();
    const chart = json["chart"] as Record<string, unknown> | undefined;
    const results = chart?.["result"] as Record<string, unknown>[] | undefined;
    const result = results?.[0] ?? null;
    return result;
  } catch {
    return null;
  }
}

function estimateBeta(closes: (number | null)[]): number | null {
  const prices = closes.filter((c): c is number => c !== null && c > 0);
  if (prices.length < 20) return null;
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  if (returns.length < 10) return null;
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + (r - avgReturn) ** 2, 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  const estBeta = stdDev / 0.01;
  return parseNum(Math.max(0.1, Math.min(5, estBeta)));
}

export async function fetchStockMetrics(
  symbol: string
): Promise<ValuationMetrics | null> {
  const cacheKey = `metrics:${symbol.toUpperCase()}`;
  const cached = getCached<ValuationMetrics>(cacheKey);
  if (cached) return cached;

  try {
    const chart = await chartFetch(symbol, "1y");
    if (!chart) return null;
    const meta = chart["meta"] as Record<string, unknown> | undefined;
    const price = parseNum(meta?.["regularMarketPrice"]);
    if (!price) return null;

    const indicators = chart["indicators"] as Record<string, unknown> | undefined;
    const quotes = (indicators?.["quote"] as Record<string, unknown>[] | undefined)?.[0];
    const closes = (quotes?.["close"] as (number | null)[]) ?? [];

    const beta = estimateBeta(closes);

    const validCloses = closes.filter((c): c is number => c !== null && c > 0);
    const yearAgoPrice = validCloses.length > 0 ? validCloses[0] : null;
    const fiftyTwoWeekChange = yearAgoPrice && yearAgoPrice > 0
      ? parseNum((price - yearAgoPrice) / yearAgoPrice)
      : null;

    const result: ValuationMetrics = {
      price,
      peRatio: null,
      pbRatio: null,
      psRatio: null,
      pegRatio: null,
      dividendYield: null,
      debtToEquity: null,
      roe: null,
      fcfYield: null,
      evToEbitda: null,
      currentRatio: null,
      eps: null,
      revenueGrowth: null,
      earningsGrowth: null,
      beta,
      fiftyTwoWeekChange,
      priceToBook: null,
    };

    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    return null;
  }
}

export async function fetchStockPrice(symbol: string): Promise<number | null> {
  try {
    const chart = await chartFetch(symbol, "1d");
    const meta = chart?.["meta"] as Record<string, unknown> | undefined;
    return parseNum(meta?.["regularMarketPrice"]);
  } catch {
    return null;
  }
}

export async function fetchHistoricalPrices(
  symbol: string,
  range: "1mo" | "3mo" | "6mo" | "1y" | "2y" = "1y"
): Promise<{ date: string; close: number }[]> {
  try {
    const chart = await chartFetch(symbol, range);
    if (!chart) return [];
    const timestamps = (chart["timestamp"] as number[]) ?? [];
    const indicators = chart["indicators"] as Record<string, unknown> | undefined;
    const quotes = (indicators?.["quote"] as Record<string, unknown>[] | undefined)?.[0];
    const closes = (quotes?.["close"] as (number | null)[]) ?? [];

    return timestamps
      .map((t, i) => ({
        date: new Date(t * 1000).toISOString().split("T")[0],
        close: closes[i] ?? 0,
      }))
      .filter((d) => d.close > 0);
  } catch {
    return [];
  }
}


