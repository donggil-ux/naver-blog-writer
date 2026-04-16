const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: { message: "Method not allowed" } });
    return;
  }

  const apiKey = process.env.Google_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: { message: "Google_API_KEY is not configured on the server" } });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { model = "gemini-2.5-flash", ...payload } = body || {};
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    // 503/429 발생 시 최대 3회 재시도 (2초 → 4초 → 8초 대기)
    const MAX_RETRIES = 3;
    let lastData = null;
    let lastStatus = 500;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        await sleep(2000 * Math.pow(2, attempt - 1)); // 2s, 4s, 8s
      }

      const upstream = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      lastStatus = upstream.status;
      lastData = await upstream.json();

      // 성공 또는 재시도 불필요한 에러 → 즉시 반환
      if (lastStatus !== 503 && lastStatus !== 429) {
        res.status(lastStatus).json(lastData);
        return;
      }
      // 503/429 → 재시도 (마지막 시도가 아니면)
    }

    // 재시도 모두 소진 → 마지막 응답 반환 + 사용자 힌트
    res.status(lastStatus).json({
      error: {
        message: `Gemini API가 일시적으로 사용량이 많습니다 (${lastStatus}). 30초 후에 다시 시도해주세요.`,
        details: lastData?.error || null,
      },
    });
  } catch (err) {
    res.status(500).json({ error: { message: err?.message || "Proxy request failed" } });
  }
}
