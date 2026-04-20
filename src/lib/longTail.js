// 롱테일 키워드 후보 생성 — 순수 함수
// 2차 기능 3: 메인 키워드 + 카테고리 + 위치 + 동행자 → 변형 5~8개.

const COMPANION_TAGS = {
  "혼자":       "혼밥",
  "친구":       "친구랑",
  "가족":       "가족나들이",
  "연인":       "데이트",
  "아이":       "아이와",
  "동료":       "회식",
  "부모님":     "부모님모시고",
};

function shortenLocation(loc) {
  if (!loc) return "";
  return loc.trim().split(/\s+/).slice(0, 2).join(" ");
}

export function buildLongTailCandidates({ mainKeyword, category = "food", location = "", companion = "" }) {
  const base = (mainKeyword || "").trim();
  if (!base) return [];

  const loc = shortenLocation(location);
  const companionTag = COMPANION_TAGS[companion] || "";

  const patterns = {
    food: [
      loc && `${loc} ${base}`,
      `${base} 맛집 추천`,
      `${base} 내돈내산`,
      loc && `${loc} ${base} ${companionTag || "데이트"}`,
      `${base} 가볼만한곳`,
      `${base} 주차`,
      `${base} 웨이팅`,
      `${base} 후기`,
    ],
    culture: [
      loc && `${loc} ${base}`,
      `${base} 후기`,
      `${base} 티켓`,
      loc && `${loc} 가볼만한 전시`,
      `${base} 예약`,
      `${base} 소요시간`,
      `${base} ${companionTag || "데이트"}`,
      `${base} 관람 팁`,
    ],
    daily: [
      `${base} 후기`,
      `${base} 단점`,
      `${base} 장단점`,
      `${base} 실사용`,
      `${base} 구매처`,
      `${base} 가격`,
      `${base} ${companionTag || "추천"}`,
      `${base} 비교`,
    ],
  };

  const list = patterns[category] || patterns.food;
  return [...new Set(list.filter(Boolean))].slice(0, 8);
}
