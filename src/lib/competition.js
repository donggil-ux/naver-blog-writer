// 네이버 블로그 검색 total 구간 → 경쟁도 레벨 매핑
// 2차 기능 3: 총 문서 수만으로 간이 측정 (정밀도는 낮지만 비용 0)
// 카테고리별 튜닝은 향후 개선 여지로 남긴다.

export function totalToLevel(total) {
  if (total == null || typeof total !== "number") return "unknown";
  if (total < 50_000)  return "low";
  if (total < 500_000) return "medium";
  return "high";
}

export const LEVEL_BADGE = {
  low:     { emoji: "🟢", label: "낮음",    color: "#0F9960" },
  medium:  { emoji: "🟡", label: "보통",    color: "#FFD43B" },
  high:    { emoji: "🔴", label: "높음",    color: "#FA5252" },
  unknown: { emoji: "⚪", label: "확인중",  color: "#9CA3AF" },
};

export function formatTotal(total) {
  if (total == null) return "";
  if (total >= 10_000) return `${(total / 10_000).toFixed(1)}만`;
  return total.toLocaleString();
}
