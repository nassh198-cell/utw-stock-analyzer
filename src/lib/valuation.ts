import { ValuationMetrics, MetricScore, ValuationScore } from "@/types/stock";

interface ScoreConfig {
  name: string;
  weight: number;
  lowerBetter: boolean;
  idealMin?: number;
  idealMax?: number;
  maxReasonable: number;
  metricKey: keyof ValuationMetrics;
}

const SCORE_CONFIGS: ScoreConfig[] = [
  { name: "52주 변화율", weight: 25, lowerBetter: true, idealMin: -0.40, idealMax: -0.05, maxReasonable: 0.50, metricKey: "fiftyTwoWeekChange" },
  { name: "PER (주가수익비율)", weight: 25, lowerBetter: true, idealMin: 5, idealMax: 15, maxReasonable: 40, metricKey: "peRatio" },
  { name: "PBR (주가순자산비율)", weight: 20, lowerBetter: true, idealMin: 0.5, idealMax: 1.5, maxReasonable: 5, metricKey: "pbRatio" },
  { name: "Beta (변동성)", weight: 15, lowerBetter: true, idealMin: 0.3, idealMax: 1.0, maxReasonable: 2.5, metricKey: "beta" },
  { name: "배당수익률", weight: 10, lowerBetter: false, idealMin: 1.0, idealMax: 4.0, maxReasonable: 8, metricKey: "dividendYield" },
  { name: "현재가 안정성", weight: 5, lowerBetter: true, idealMin: 10, idealMax: 200, maxReasonable: 500, metricKey: "price" },
];

function scoreMetric(
  value: number | null,
  config: ScoreConfig
): { value: number | null; score: number; interpretation: "저평가" | "적정" | "고평가" } {
  if (value === null || value === undefined || isNaN(value)) {
    return { value: null, score: 0, interpretation: "적정" };
  }

  let score: number;
  let interpretation: "저평가" | "적정" | "고평가";

  if (config.lowerBetter) {
    if (config.idealMin !== undefined && config.idealMax !== undefined) {
      if (value <= config.idealMin) {
        score = 90;
        interpretation = "저평가";
      } else if (value <= config.idealMax) {
        const ratio = (value - config.idealMin) / (config.idealMax - config.idealMin);
        score = 100 - ratio * 30;
        interpretation = score > 80 ? "저평가" : "적정";
      } else if (value <= config.maxReasonable) {
        const ratio = (value - config.idealMax) / (config.maxReasonable - config.idealMax);
        score = Math.max(20, 70 - ratio * 50);
        interpretation = score >= 50 ? "적정" : "고평가";
      } else {
        score = 10;
        interpretation = "고평가";
      }
    } else if (value <= 0) {
      score = 30;
      interpretation = "적정";
    } else {
      const capped = Math.min(value, config.maxReasonable);
      score = Math.max(10, 100 - (capped / config.maxReasonable) * 90);
      interpretation = score >= 60 ? "적정" : score >= 40 ? "저평가" : "고평가";
    }
  } else {
    // Higher is better (Dividend Yield, FCF Yield, ROE)
    if (value <= 0) {
      score = 20;
      interpretation = "고평가";
    } else if (config.idealMin !== undefined && config.idealMax !== undefined) {
      if (value >= config.idealMax) {
        score = 90;
        interpretation = "저평가";
      } else if (value >= config.idealMin) {
        const ratio = (value - config.idealMin) / (config.idealMax - config.idealMin);
        score = 70 + ratio * 20;
        interpretation = "저평가";
      } else {
        const ratio = value / config.idealMin;
        score = Math.max(20, ratio * 70);
        interpretation = score >= 50 ? "적정" : "고평가";
      }
    } else {
      const capped = Math.min(value, config.maxReasonable);
      score = Math.min(100, (capped / config.maxReasonable) * 100);
      interpretation = score >= 60 ? "저평가" : "적정";
    }
  }

  // Round values
  const finalVal = value !== null ? Math.round(value * 100) / 100 : null;
  return {
    value: finalVal,
    score: Math.round(score),
    interpretation,
  };
}

function getGrade(overall: number): ValuationScore["grade"] {
  if (overall >= 90) return "A+";
  if (overall >= 80) return "A";
  if (overall >= 70) return "B+";
  if (overall >= 60) return "B";
  if (overall >= 50) return "C+";
  if (overall >= 40) return "C";
  if (overall >= 30) return "D";
  return "F";
}

function getSummary(overall: number, grade: string): string {
  if (grade === "A+" || grade === "A") {
    return "강한 저평가 신호 — 여러 지표에서 주가가 내재가치 대비 낮게 평가되고 있습니다.";
  }
  if (grade === "B+" || grade === "B") {
    return "일부 저평가 신호 — 일부 지표에서 저평가 구간이나 적정 구간에 있습니다.";
  }
  if (grade === "C+" || grade === "C") {
    return "보통 수준 — 대부분의 지표가 적정 범위에 있거나 혼조세입니다.";
  }
  if (grade === "D") {
    return "고평가 신호 — 여러 지표에서 주가가 내재가치 대비 높게 평가되고 있습니다.";
  }
  return "강한 고평가 신호 — 대부분의 지표에서 주가가 과대평가되고 있습니다.";
}

export function calculateValuationScore(metrics: ValuationMetrics): ValuationScore {
  const metricScores: MetricScore[] = [];
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const config of SCORE_CONFIGS) {
    const value = metrics[config.metricKey] ?? null;
    const result = scoreMetric(value, config);
    const weightNormalized = config.weight / 100;

    metricScores.push({
      metricName: config.name,
      value: result.value,
      score: result.score,
      weight: config.weight,
      interpretation: result.interpretation,
    });

    if (result.value !== null) {
      totalWeightedScore += result.score * weightNormalized;
      totalWeight += weightNormalized;
    }
  }

  const overall = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 50;
  const grade = getGrade(overall);

  return {
    overall,
    grade,
    metrics: metricScores,
    summary: getSummary(overall, grade),
  };
}
