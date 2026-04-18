const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Referer: "https://map.naver.com/",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "ko-KR,ko;q=0.9",
};

const DAY_KO = {
  MON: "월요일",
  TUE: "화요일",
  WED: "수요일",
  THU: "목요일",
  FRI: "금요일",
  SAT: "토요일",
  SUN: "일요일",
};

function fmtTime(t) {
  if (!t) return "";
  const s = String(t).replace(":", "");
  if (s.length === 4) return `${s.slice(0, 2)}:${s.slice(2)}`;
  return String(t);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query, address } = req.query;
  if (!query) {
    return res.status(400).json({ error: "query parameter is required" });
  }

  try {
    // Step 1: Naver Map internal search → get place ID
    const q = `${query} ${address || ""}`.trim();
    const searchRes = await fetch(
      `https://map.naver.com/v5/api/search?caller=pcweb&query=${encodeURIComponent(q)}&type=all&page=1&count=1&isPlaceRecommendation=true&lang=ko`,
      { headers: HEADERS }
    );

    if (!searchRes.ok) {
      return res.status(searchRes.status).json({ error: `Naver search ${searchRes.status}` });
    }

    const searchData = await searchRes.json();
    const place = searchData.result?.place?.list?.[0];

    if (!place?.id) {
      return res.status(200).json({ hours: "", closed: "", breakTime: "", matched: false });
    }

    // Step 2: Place summary → business hours
    const detailRes = await fetch(
      `https://map.naver.com/v5/api/sites/summary/${place.id}?lang=ko`,
      { headers: HEADERS }
    );

    if (!detailRes.ok) {
      return res.status(detailRes.status).json({ error: `Naver detail ${detailRes.status}` });
    }

    const detail = await detailRes.json();
    const biz = detail.businessHours;

    if (!biz) {
      return res.status(200).json({
        hours: "",
        closed: "",
        breakTime: "",
        matched: true,
        placeId: place.id,
        displayName: place.name || "",
        formattedAddress: place.roadAddress || "",
      });
    }

    const bizHours = biz.businessHours || [];

    const hoursLines = bizHours.map((h) => {
      const day = DAY_KO[h.day] || h.day;
      const start = fmtTime(h.startTime);
      const end = fmtTime(h.endTime);
      return `${day}: ${start} ~ ${end}`;
    });

    const hours = hoursLines.join("\n");
    const closed = biz.regularHolidayInfo || "";

    const breakLines = [];
    for (const h of bizHours) {
      if (h.breakTimes?.length) {
        for (const bt of h.breakTimes) {
          const day = DAY_KO[h.day] || h.day;
          breakLines.push(`${day} ${fmtTime(bt.startTime)}~${fmtTime(bt.endTime)}`);
        }
      }
    }
    const breakTime = breakLines.join(", ");

    return res.status(200).json({
      hours,
      closed,
      breakTime,
      matched: true,
      placeId: place.id,
      displayName: place.name || "",
      formattedAddress: place.roadAddress || "",
    });
  } catch (err) {
    return res.status(500).json({ error: err?.message || "Naver hours request failed" });
  }
}
