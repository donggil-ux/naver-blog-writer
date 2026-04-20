// 발행 전 체크리스트 — 순수 함수
// 목적: 결과물(result)이 네이버 SEO/C-Rank 최소 기준을 충족하는지 자동 점검.
//
// 각 rule은 { key, label, hint, ok, detail } 반환.
// - ok: 자동 판정 가능한 rule은 true/false, 수동 확인은 null
// - detail: 왜 그렇게 판정했는지 짧은 설명 (UI에서 보조 노출)

function stripHeader(text) {
  // "[확정 제목]\n<title>\n\n<body>" 에서 body만 추출
  if (!text) return { title: "", body: "" };
  const m = text.match(/^\[확정 제목\]\s*\n(.+?)\n\n([\s\S]*)$/);
  if (m) return { title: m[1].trim(), body: m[2] };
  // fallback: 첫 줄 = 제목 후보
  const lines = text.split("\n");
  return { title: (lines[0] || "").trim(), body: lines.slice(1).join("\n") };
}

export function seoChecklist({ form = {}, result = "", plan = {} }) {
  const { title, body } = stripHeader(result);
  const mk = (form.mainKeyword || "").trim();
  const photos = Array.isArray(form.photos) ? form.photos : [];

  const rules = [];

  // 1. 제목에 메인 키워드 포함
  rules.push({
    key: "title-kw",
    label: "제목에 메인 키워드 포함",
    hint: "메인 키워드가 제목에 들어가야 검색 노출이 유리해요.",
    ok: mk ? title.includes(mk) : null,
    detail: !mk ? "메인 키워드가 비어 있어요" : title.includes(mk) ? `"${mk}" 포함 확인` : `"${mk}" 누락`,
  });

  // 2. 제목 길이 20~40자 (공백 포함)
  const tLen = title.length;
  rules.push({
    key: "title-length",
    label: "제목 길이 20~40자",
    hint: "너무 짧으면 정보가 부족하고, 너무 길면 잘려요.",
    ok: tLen >= 20 && tLen <= 40,
    detail: `현재 ${tLen}자`,
  });

  // 3. 첫 문장에 주제 명시 (메인 키워드 or 확정 첫 문장 길이 체크)
  const firstParagraph = (body.split(/\n\s*\n/)[0] || "").slice(0, 200);
  const firstHasKw = mk ? firstParagraph.includes(mk) : true;
  rules.push({
    key: "first-topic",
    label: "첫 문장에 주제 명시",
    hint: "첫 문장/첫 문단에 메인 키워드가 등장해야 C-Rank에 유리해요.",
    ok: firstHasKw,
    detail: firstHasKw ? "첫 문단에서 주제 확인" : `첫 문단에 "${mk}" 미포함`,
  });

  // 4. 메뉴/가격 본문 포함 (숫자+원 패턴)
  const hasPrice = /\d{1,3}(,\d{3})*\s*원/.test(body) || /\d+원/.test(body);
  rules.push({
    key: "menu-price",
    label: "메뉴·가격 본문 포함",
    hint: "구체적 가격 정보는 검색 의도를 충족시켜요.",
    ok: hasPrice,
    detail: hasPrice ? "숫자+원 패턴 확인" : "가격 정보 미발견",
  });

  // 5. 소제목 2개 이상
  const subheadings = body.match(/^#{2,3}\s.+$/gm) || [];
  rules.push({
    key: "subheadings",
    label: "소제목 2개 이상",
    hint: "중간 소제목(##)이 있으면 가독성과 체류시간이 상승해요.",
    ok: subheadings.length >= 2,
    detail: `${subheadings.length}개 발견`,
  });

  // 6. 사진 3장 이상
  rules.push({
    key: "photo-flow",
    label: "사진 3장 이상",
    hint: "사진이 많을수록 블로그 체류시간이 길어져요.",
    ok: photos.length >= 3,
    detail: `${photos.length}장 첨부`,
  });

  // 7. 본문 분량 800자 이상
  const bodyLen = body.replace(/\s/g, "").length;
  rules.push({
    key: "body-length",
    label: "본문 800자 이상",
    hint: "너무 짧으면 정보 부족으로 판단될 수 있어요.",
    ok: bodyLen >= 800,
    detail: `${bodyLen}자 (공백 제외)`,
  });

  // 8. 검색 허용 설정 (수동 확인)
  rules.push({
    key: "search-allow",
    label: "검색 허용 설정 (수동 확인)",
    hint: "네이버 에디터 발행 옵션에서 '검색 허용'을 꼭 체크하세요.",
    ok: null,
    detail: "발행 시 수동 체크",
  });

  const autoRules = rules.filter(r => r.ok !== null);
  const passed = autoRules.filter(r => r.ok).length;
  const total = autoRules.length;
  const score = Math.round((passed / total) * 100);

  return {
    rules,
    passed,
    total,
    score,
    ready: score >= 80,
  };
}
