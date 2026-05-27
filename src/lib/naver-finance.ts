import { getCached, setCache } from "./cache";

export interface NaverFundamentals {
  per: number | null;
  pbr: number | null;
  eps: number | null;
  bps: number | null;
  dividendYield: number | null;
  marketCap: number | null;
  high52w: number | null;
  low52w: number | null;
}

/**
 * Determine Naver's reutersCode from a stock symbol.
 *   NASDAQ → SYMBOL.O  (e.g. MSFT.O)
 *   NYSE   → SYMBOL    (e.g. JPM)
 *   Special exceptions (BRK.B → BRKb) handled in the lookup.
 */
function naverCode(symbol: string): string {
  const upper = symbol.toUpperCase();
  // Special mappings
  const special: Record<string, string> = {
    "BRK.B": "BRKb",
    "BF.B": "BFb",
  };
  if (special[upper]) return special[upper];
  return upper;
}

function parseNaverValue(value: unknown): number | null {
  if (value === null || value === undefined || value === "N/A") return null;
  const str = String(value).replace(/[,%]/g, "").replace("배", "").trim();
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

/**
 * Fetch fundamental data for a US stock from Naver Finance API.
 * Tries: raw symbol (NYSE), then symbol + ".O" (NASDAQ).
 */
export async function fetchNaverFundamentals(
  symbol: string
): Promise<NaverFundamentals | null> {
  const cacheKey = `naver:${symbol.toUpperCase()}`;
  const cached = getCached<NaverFundamentals>(cacheKey);
  if (cached) return cached;

  const baseCode = naverCode(symbol);

  // Try suffixes: first bare (NYSE), then .O (NASDAQ)
  const suffixes = ["", ".O"];
  let data: Record<string, unknown> | null = null;

  for (const suffix of suffixes) {
    const code = suffix ? `${baseCode}${suffix}` : baseCode;
    try {
      const res = await fetch(
        `https://api.stock.naver.com/stock/${encodeURIComponent(code)}/basic`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        }
      );
      if (res.ok) {
        const json: Record<string, unknown> = await res.json();
        data = json;
        break;
      }
    } catch {
      continue;
    }
  }

  if (!data) return null;

  const infos = (data["stockItemTotalInfos"] as Record<string, unknown>[]) ?? [];
  const map = new Map<string, string>();
  for (const item of infos) {
    const k = String(item["key"] ?? "");
    const v = String(item["value"] ?? "");
    map.set(k, v);
  }

  const result: NaverFundamentals = {
    per: parseNaverValue(map.get("PER")),
    pbr: parseNaverValue(map.get("PBR")),
    eps: parseNaverValue(map.get("EPS")),
    bps: parseNaverValue(map.get("BPS")),
    dividendYield: parseNaverValue(map.get("배당수익률")),
    marketCap: parseNaverValue(map.get("시가총액")),
    high52w: parseNaverValue(map.get("52주 최고")),
    low52w: parseNaverValue(map.get("52주 최저")),
  };

  setCache(cacheKey, result);
  return result;
}
