export interface NewsItem {
  title: string;
  link: string;
  description: string;
  source: string;
  pubDate: string;
}

/**
 * Google News RSS를 통해 주식 관련 뉴스 검색 (무료, API 키 불필요)
 * https://news.google.com/rss/search?q={query}
 */
async function fetchGoogleNewsRSS(ticker: string, companyName: string): Promise<NewsItem[]> {
  const query = encodeURIComponent(`"${ticker}" stock`);
  const url = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`;

  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  if (!res.ok) return [];

  const xml = await res.text();

  // 간단한 RSS XML 파서 (정규식 기반, 의존성 없음)
  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null && items.length < 10) {
    const content = match[1];

    const extract = (tag: string): string => {
      const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
      const m = re.exec(content);
      return m ? m[1].trim() : "";
    };

    const title = extract("title").replace(/<!\[CDATA\[|\]\]>/g, "");
    const link = extract("link");
    const description = extract("description").replace(/<!\[CDATA\[|\]\]>/g, "");
    const pubDate = extract("pubDate");
    const sourceName = extract("source");

    if (title && link) {
      // 관련성 필터: ticker나 회사명이 제목에 포함된 경우만
      const titleLower = title.toLowerCase();
      const tickerLower = ticker.toLowerCase();
      const companyLower = companyName.toLowerCase().split(" ")[0]; // 첫 단어만

      if (titleLower.includes(tickerLower) || titleLower.includes(companyLower)) {
        items.push({
          title,
          link,
          description: description.replace(/<[^>]*>/g, "").slice(0, 300),
          source: sourceName || "Google News",
          pubDate,
        });
      }
    }
  }

  return items;
}

/**
 * Yahoo Finance RSS를 통해 해당 종목 뉴스 검색
 */
async function fetchYahooFinanceRSS(ticker: string): Promise<NewsItem[]> {
  const url = `https://finance.yahoo.com/rss/headline?s=${ticker}`;

  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  if (!res.ok) return [];

  const xml = await res.text();

  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null && items.length < 10) {
    const content = match[1];

    const extract = (tag: string): string => {
      const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
      const m = re.exec(content);
      return m ? m[1].trim() : "";
    };

    const title = extract("title");
    const link = extract("link");
    const description = extract("description");
    const pubDate = extract("pubDate");

    if (title && link) {
      items.push({
        title,
        link,
        description: description.replace(/<[^>]*>/g, "").slice(0, 300),
        source: "Yahoo Finance",
        pubDate,
      });
    }
  }

  return items;
}

/**
 * 해당 종목의 최신 뉴스 가져오기
 * 1) Google News RSS (1차, 영문)
 * 2) Yahoo Finance RSS (2차, 보완)
 */
export async function fetchStockNews(
  ticker: string,
  companyName: string
): Promise<NewsItem[]> {
  const [googleNews, yahooNews] = await Promise.all([
    fetchGoogleNewsRSS(ticker, companyName).catch(() => []),
    fetchYahooFinanceRSS(ticker).catch(() => []),
  ]);

  // 중복 제거 후 최대 10개 반환
  const seen = new Set<string>();
  const all = [...googleNews, ...yahooNews];
  return all.filter((item) => {
    const key = item.link.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 10);
}
