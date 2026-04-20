// 관련 글 찾기 — 순수 함수
// 2차 기능 2: 현재 폼과 기존 history entry 간 유사도 스코어 → Top N.
//
// 규칙:
// - isDraft = true 이면 제외
// - 같은 category: +30
// - mainKeyword 일치 or 현재 mainKeyword가 entry.title 포함: +20
// - tags 교집합: 1개당 +15 (최대 +30)
// - name(가게명) 일치: +15
// - location 첫 단어 일치: +10
// - 최소 컷오프: 30점
// - 상위 3개 반환

function tokenSet(str) {
  if (!str) return new Set();
  return new Set(String(str).toLowerCase().trim().split(/\s+/).filter(Boolean));
}

function jaccardOverlap(a, b) {
  if (!a?.length || !b?.length) return 0;
  const sa = new Set(a.map(t => t.toLowerCase()));
  let count = 0;
  for (const t of b) if (sa.has(t.toLowerCase())) count += 1;
  return count;
}

export function findRelated({ form, history, limit = 3, minScore = 30 }) {
  if (!Array.isArray(history) || history.length === 0) return [];
  const mk = (form.mainKeyword || "").trim().toLowerCase();
  const currentTags = Array.isArray(form.subKeywords) ? form.subKeywords : [];
  const curLocHead = ((form.location || "").trim().split(/\s+/)[0] || "").toLowerCase();
  const curName = (form.name || "").trim().toLowerCase();

  const ranked = history
    .filter(e => !e.isDraft && e.content)
    .map(e => {
      let score = 0;
      const notes = [];

      if (e.category === form.category) { score += 30; notes.push("같은 카테고리"); }

      const eMk = (e.formData?.mainKeyword || "").trim().toLowerCase();
      const eTitle = (e.title || "").toLowerCase();
      if (mk && (mk === eMk || (eTitle && eTitle.includes(mk)))) {
        score += 20;
        notes.push("메인 키워드 연관");
      }

      const eTags = Array.isArray(e.tags) ? e.tags : [];
      const overlap = jaccardOverlap(currentTags, eTags);
      if (overlap > 0) {
        score += Math.min(overlap * 15, 30);
        notes.push(`태그 ${overlap}개 겹침`);
      }

      const eName = (e.formData?.name || "").trim().toLowerCase();
      if (curName && eName && curName === eName) {
        score += 15;
        notes.push("같은 장소");
      }

      const eLocHead = ((e.formData?.location || "").trim().split(/\s+/)[0] || "").toLowerCase();
      if (curLocHead && eLocHead && curLocHead === eLocHead) {
        score += 10;
        notes.push("같은 지역");
      }

      return { entry: e, score, notes };
    })
    .filter(r => r.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return ranked;
}
