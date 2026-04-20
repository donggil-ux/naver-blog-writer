// history 스키마 확장 + 집계 유틸 — 순수 함수
// 2차 A1: 기존 entry에 tags / publishedAt 이 없을 수 있으므로 lazy 보정.

// 본문에서 "#태그" 또는 "[추천 태그]\n #a #b #c" 블록을 뽑는다.
export function parseTagsFromContent(content) {
  if (!content || typeof content !== "string") return [];
  const tags = new Set();

  // [추천 태그] 블록 우선
  const sec = content.match(/\[추천\s*태그\][^\n]*\n([\s\S]*?)(?=\n\n|\n\[|$)/);
  const area = sec ? sec[1] : content;

  // "#단어" (한글/영문/숫자/_ 1~30자) — # 다음 공백 전까지
  const re = /#([^\s#,./\\()\[\]{}'"!?<>]+)/g;
  let m;
  while ((m = re.exec(area))) {
    const t = m[1].trim();
    if (t.length >= 1 && t.length <= 30) tags.add(t);
    if (tags.size >= 30) break;
  }
  return [...tags];
}

// 기존 entry를 읽을 때 lazy 보정 (파괴적이지 않음, 파생 필드 채움)
export function normalizeEntry(entry) {
  if (!entry || typeof entry !== "object") return entry;
  const tags = Array.isArray(entry.tags) && entry.tags.length
    ? entry.tags
    : parseTagsFromContent(entry.content || "");
  const publishedAt = entry.publishedAt ?? null;
  return { ...entry, tags, publishedAt };
}

// history 전체에서 태그 빈도 집계 (isDraft 제외)
export function aggregateTags(history) {
  const freq = new Map();
  for (const e of history) {
    if (e.isDraft) continue;
    const tags = Array.isArray(e.tags) ? e.tags : parseTagsFromContent(e.content || "");
    for (const t of tags) {
      freq.set(t, (freq.get(t) || 0) + 1);
    }
  }
  return [...freq.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

// 카테고리 빈도 집계 (isDraft 제외)
export function aggregateCategories(history) {
  const freq = { food: 0, culture: 0, daily: 0 };
  for (const e of history) {
    if (e.isDraft) continue;
    if (freq[e.category] !== undefined) freq[e.category] += 1;
  }
  return freq;
}
