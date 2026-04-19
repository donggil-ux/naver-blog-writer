export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const key = process.env.GOOGLE_PLACES_API_KEY || process.env.Google_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key) {
    res.status(500).json({ error: "Google API key is not configured" });
    return;
  }

  const { query, address } = req.query;
  if (!query) {
    res.status(400).json({ error: "query parameter is required" });
    return;
  }

  const TIMEOUT_MS = 8000;

  try {
    const textQuery = `${query} ${address || ""}`.trim();
    const searchRes = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress",
      },
      body: JSON.stringify({ textQuery, languageCode: "ko" }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const searchData = await searchRes.json();
    if (!searchRes.ok) {
      res.setHeader("Cache-Control", "no-store");
      res.status(searchRes.status).json({ error: searchData?.error?.message || "Places text search failed" });
      return;
    }
    const place = searchData.places?.[0];
    if (!place) {
      res.setHeader("Cache-Control", "no-store");
      res.status(200).json({ hours: "", closed: "", breakTime: "", matched: false });
      return;
    }

    const detailRes = await fetch(
      `https://places.googleapis.com/v1/places/${place.id}?languageCode=ko`,
      {
        headers: {
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask": "regularOpeningHours,regularSecondaryOpeningHours",
        },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      }
    );
    const detail = await detailRes.json();
    if (!detailRes.ok) {
      res.setHeader("Cache-Control", "no-store");
      res.status(detailRes.status).json({ error: detail?.error?.message || "Places details failed" });
      return;
    }

    const lines = detail.regularOpeningHours?.weekdayDescriptions || [];
    const hours = lines.join("\n");
    const closed = lines.filter((l) => /휴무|closed/i.test(l)).join(", ");
    const breakTime = (detail.regularSecondaryOpeningHours?.[0]?.weekdayDescriptions || []).join("\n");

    res.status(200).json({
      hours,
      closed,
      breakTime,
      matched: true,
      placeId: place.id,
      displayName: place.displayName?.text || "",
      formattedAddress: place.formattedAddress || "",
    });
  } catch (err) {
    res.setHeader("Cache-Control", "no-store");
    if (err?.name === "AbortError" || err?.name === "TimeoutError") {
      res.status(200).json({ hours: "", closed: "", breakTime: "", matched: false });
      return;
    }
    res.status(500).json({ error: "Google Places request failed" });
  }
}
