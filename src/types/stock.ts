export interface StockInfo {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  marketCap: number;
}

export interface ValuationMetrics {
  price: number;
  peRatio: number | null;
  pbRatio: number | null;
  psRatio: number | null;
  pegRatio: number | null;
  dividendYield: number | null;
  debtToEquity: number | null;
  roe: number | null;
  fcfYield: number | null;
  evToEbitda: number | null;
  currentRatio: number | null;
  eps: number | null;
  revenueGrowth: number | null;
  earningsGrowth: number | null;
  beta: number | null;
  fiftyTwoWeekChange: number | null;
  priceToBook: number | null;
}

export interface MetricScore {
  metricName: string;
  value: number | null;
  score: number;
  weight: number;
  interpretation: "저평가" | "적정" | "고평가";
}

export interface ValuationScore {
  overall: number;
  grade: "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "F";
  metrics: MetricScore[];
  summary: string;
}

export interface StockDetail {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  marketCap: number;
  description: string;
  country: string;
  website: string;
  valuationScore: ValuationScore;
  metrics: ValuationMetrics;
  historicalPrices?: { date: string; close: number }[];
}

export interface StockScreenerQuery {
  sectors?: string[];
  minScore?: number;
  maxScore?: number;
  minMarketCap?: number;
  maxMarketCap?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface StockScreenerResult {
  stocks: StockSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export interface StockSummary {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  marketCap: number;
  peRatio: number | null;
  pbRatio: number | null;
  psRatio: number | null;
  pegRatio: number | null;
  dividendYield: number | null;
  valuationScore: number;
  scoreGrade: string;
  roe: number | null;
}
