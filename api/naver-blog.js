export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    res.status(500).json({ error: "NAVER_CLIENT_ID or NAVER_CLIENT_SECRET is not configured" });
    return;
  }

  const query = req.query.query;
  if (!query) {
    res.status(400).json({ error: "query parameter is required" });
    return;
  }

  try {
    const url = `https://openapi.naver.com/v1/search/blog.json?query=${encodeURIComponent(query)}&display=10&sort=sim`;
    const upstream = await fetch(url, {
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err?.message || "Naver blog search failed" });
  }
}
