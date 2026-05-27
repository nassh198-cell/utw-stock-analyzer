export interface NaverSearchItem {
  title: string;
  link: string;
  description: string;
  /** 카페글 전용 */
  cafename?: string;
  cafeurl?: string;
  /** 블로그 전용 */
  bloggername?: string;
  bloggerlink?: string;
  postdate?: string;
  /** 뉴스 전용 */
  originallink?: string;
  pubDate?: string;
}

interface NaverSearchResponse {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: NaverSearchItem[];
}

type SearchTarget = "cafearticle" | "blog" | "news";

function getCredentials() {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Naver Search API credentials not configured. " +
      "Set NAVER_CLIENT_ID and NAVER_CLIENT_SECRET in .env.local"
    );
  }

  return { clientId, clientSecret };
}

async function search(
  target: SearchTarget,
  query: string,
  display = 10,
  start = 1,
  sort: "sim" | "date" = "sim"
): Promise<NaverSearchResponse> {
  const { clientId, clientSecret } = getCredentials();

  const params = new URLSearchParams({
    query: encodeURIComponent(query),
    display: String(display),
    start: String(start),
    sort,
  });

  const url = `https://openapi.naver.com/v1/search/${target}.json?${params}`;

  const res = await fetch(url, {
    headers: {
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret,
    },
  });

  if (!res.ok) {
    throw new Error(
      `Naver Search API error: ${res.status} ${res.statusText}`
    );
  }

  return res.json();
}

/** 주식 티커 관련 네이버 카페글 검색 */
export async function searchCafeArticles(
  ticker: string,
  companyName: string,
  display = 10
): Promise<NaverSearchItem[]> {
  const query = `${ticker} ${companyName} 주식`;
  const result = await search("cafearticle", query, display, 1, "date");
  return result.items || [];
}

/** 주식 티커 관련 네이버 블로그 검색 */
export async function searchBlogPosts(
  ticker: string,
  companyName: string,
  display = 10
): Promise<NaverSearchItem[]> {
  const query = `${ticker} ${companyName} 주식`;
  const result = await search("blog", query, display, 1, "date");
  return result.items || [];
}

/** 주식 티커 관련 네이버 뉴스 검색 */
export async function searchNews(
  ticker: string,
  companyName: string,
  display = 10
): Promise<NaverSearchItem[]> {
  const query = `${ticker} ${companyName} 주식`;
  const result = await search("news", query, display, 1, "date");
  return result.items || [];
}

/** 세 가지 소스(카페/블로그/뉴스)를 한꺼번에 조회 */
export async function searchAllSources(
  ticker: string,
  companyName: string,
  perSource = 5
): Promise<{
  cafe: NaverSearchItem[];
  blog: NaverSearchItem[];
  news: NaverSearchItem[];
}> {
  const [cafe, blog, news] = await Promise.all([
    searchCafeArticles(ticker, companyName, perSource).catch(() => []),
    searchBlogPosts(ticker, companyName, perSource).catch(() => []),
    searchNews(ticker, companyName, perSource).catch(() => []),
  ]);

  return { cafe, blog, news };
}

/**
 * HTML 태그 제거 + 텍스트 길이 제한
 */
export function stripHtml(text: string): string {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}
