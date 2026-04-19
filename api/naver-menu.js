const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Referer: "https://map.naver.com/",
  Accept: "text/html,application/xhtml+xml,application/json,*/*",
  "Accept-Language": "ko-KR,ko;q=0.9",
};

function parseMenusFromHtml(html) {
  if (!html) return [];
  const out = [];
  const seen = new Set();
  // Naver pcmap 페이지 내부 JSON: "name":"...","price":"..."
  const re = /"name":"((?:[^"\\]|\\.){1,50})"[^{]{0,500}?"price":"?(\d{1,3}(?:,\d{3})+|\d{3,7})"?/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const rawName = m[1]
      .replace(/\\"/g, '"')
      .replace(/\\u[\da-fA-F]{4}/g, (s) => String.fromCharCode(parseInt(s.slice(2), 16)))
      .replace(/\\n|\\r|\\t/g, " ")
      .trim();
    const price = m[2].replace(/,/g, "");
    if (rawName.length < 2 || rawName.length > 40) continue;
    if (!/^\d{3,7}$/.test(price)) continue;
    const priceNum = Number(price);
    if (priceNum < 500 || priceNum > 500000) continue; // 이상치 필터
    const key = rawName.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(`${rawName} ${priceNum.toLocaleString()}원`);
  }
  return out;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { query, address } = req.query;
  if (!query) {
    res.status(400).json({ error: "query parameter is required" });
    return;
  }

  const TIMEOUT_MS = 8000;

  try {
    // Step 1: 네이버 지도 내부 검색 → placeId
    const q = `${query} ${address || ""}`.trim();
    const searchRes = await fetch(
      `https://map.naver.com/v5/api/search?caller=pcweb&query=${encodeURIComponent(q)}&type=all&page=1&count=1&isPlaceRecommendation=true&lang=ko`,
      { headers: HEADERS, signal: AbortSignal.timeout(TIMEOUT_MS) }
    );
    if (!searchRes.ok) {
      res.setHeader("Cache-Control", "no-store");
      res.status(200).json({ menus: [], matched: false });
      return;
    }
    const searchData = await searchRes.json();
    const place = searchData.result?.place?.list?.[0];
    if (!place?.id) {
      res.setHeader("Cache-Control", "no-store");
      res.status(200).json({ menus: [], matched: false });
      return;
    }

    // Step 2: 카테고리 후보 URL들을 순차 시도하여 메뉴 HTML 확보
    const categorySlugs = ["restaurant", "place", "cafe"];
    let html = "";
    for (const slug of categorySlugs) {
      try {
        const url = `https://pcmap.place.naver.com/${slug}/${place.id}/menu/list`;
        const r = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(TIMEOUT_MS) });
        if (r.ok) {
          const body = await r.text();
          if (body && body.includes('"price"')) {
            html = body;
            break;
          }
        }
      } catch {
        /* try next */
      }
    }

    const menus = parseMenusFromHtml(html).slice(0, 20);
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({
      menus,
      matched: true,
      placeId: place.id,
      displayName: place.name || "",
    });
  } catch (err) {
    res.setHeader("Cache-Control", "no-store");
    if (err?.name === "AbortError" || err?.name === "TimeoutError") {
      res.status(200).json({ menus: [], matched: false });
      return;
    }
    res.status(500).json({ error: "Naver menu request failed" });
  }
}
