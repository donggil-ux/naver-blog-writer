const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const FALLBACK_MODEL = "gemini-2.5-flash-lite";

async function callGemini(apiKey, model, payload) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const upstream = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return { status: upstream.status, data: await upstream.json() };
}

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

    // 1차 시도 — 요청된 모델
    const MAX_RETRIES = 2;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) await sleep(2000 * attempt);
      const { status, data } = await callGemini(apiKey, model, payload);
      if (status !== 503 && status !== 429) {
        res.status(status).json(data);
        return;
      }
    }

    // 2차 시도 — 폴백 모델 (요청 모델과 다를 때만)
    if (model !== FALLBACK_MODEL) {
      const { status, data } = await callGemini(apiKey, FALLBACK_MODEL, payload);
      if (status !== 503 && status !== 429) {
        res.status(status).json(data);
        return;
      }
    }

    res.status(503).json({
      error: {
        message: "Gemini API가 일시적으로 사용량이 많습니다. 30초 후에 다시 시도해주세요.",
      },
    });
  } catch (err) {
    res.status(500).json({ error: { message: err?.message || "Proxy request failed" } });
  }
}
