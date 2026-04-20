// 입력 정보 완성도 평가 — 순수 함수
// 목적: 글 생성 전에 '얼마나 풍부한 입력인지' 점수화해서 사용자에게 보조 가이드 제공.
//
// 가중치 설계 원칙
// - 메인 키워드·가게명 = SEO 핵심 → 높은 가중치
// - 메모/사진 = C-Rank Content(정보 품질) 핵심 → 중간 가중치
// - 위치/방문일/동행/서브 키워드 = 디테일 → 낮은 가중치
// 총합 100점.

const DEFAULT_WEIGHTS = [
  { key: "name",        weight: 15, label: "가게/장소 이름",    hint: "SEO 제목의 핵심 앵커" },
  { key: "mainKeyword", weight: 20, label: "메인 키워드",        hint: "제목·첫 문장·본문에 반복 배치" },
  { key: "menus",       weight: 15, label: "메뉴·가격",          hint: "검색 의도 충족의 핵심 정보" },
  { key: "memo",        weight: 15, label: "방문 경험 메모",      hint: "30자 이상이면 인정" },
  { key: "photos",      weight: 10, label: "사진 3장 이상",       hint: "블로그 체류시간 상승" },
  { key: "location",    weight: 10, label: "위치",                hint: "지역 키워드 노출" },
  { key: "date",        weight:  5, label: "방문일",              hint: "" },
  { key: "companion",   weight:  5, label: "누구랑",              hint: "" },
  { key: "subKeywords", weight:  5, label: "서브 키워드 2개+",     hint: "" },
];

function evalCheck(key, form) {
  switch (key) {
    case "name":        return !!(form.name && form.name.trim());
    case "mainKeyword": return !!(form.mainKeyword && form.mainKeyword.trim());
    case "menus":       return !!(form.menus && form.menus.trim());
    case "memo":        return !!(form.memo && form.memo.trim().length >= 30);
    case "photos":      return Array.isArray(form.photos) && form.photos.length >= 3;
    case "location":    return !!(form.location && form.location.trim());
    case "date":        return !!(form.date && form.date.trim());
    case "companion":   return !!(form.companion && form.companion.trim());
    case "subKeywords": return Array.isArray(form.subKeywords) && form.subKeywords.length >= 2;
    default:            return false;
  }
}

// 카테고리별 미세 조정 — culture/daily는 메뉴 대신 '가격/티켓'도 menus 필드로 받으므로 동일 처리.
// 필요 시 향후 { food: [...], culture: [...] } 형태로 분기.
export function completeness(form) {
  const checks = DEFAULT_WEIGHTS.map(w => ({
    ...w,
    ok: evalCheck(w.key, form),
  }));
  const score = checks.reduce((s, c) => s + (c.ok ? c.weight : 0), 0);
  const missing = checks.filter(c => !c.ok);
  return {
    score,
    checks,
    missing,
    canProceed: score >= 70,          // 70점 미만이면 경고 (오버라이드 가능)
    level: score >= 90 ? "excellent"
         : score >= 70 ? "good"
         : score >= 50 ? "fair"
         : "poor",
  };
}

// 배지 색상 매핑 (테마 변수 대신 고정 값 — 테마 독립)
export const COMPLETENESS_BADGE = {
  excellent: { color: "#0F9960", emoji: "🌟", label: "완벽" },
  good:      { color: "#FFD43B", emoji: "👍", label: "충분" },
  fair:      { color: "#FF922B", emoji: "💡", label: "보완 권장" },
  poor:      { color: "#FA5252", emoji: "⚠️",  label: "정보 부족" },
};
