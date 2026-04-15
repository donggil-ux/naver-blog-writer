import { useState, useRef } from "react";

const COLORS = {
  bg: "#faf9f6", card: "#ffffff", accent: "#2d6a4f",
  accentLight: "#e8f4ed", accentMid: "#52b788",
  text: "#1a1a1a", muted: "#7a7a7a", border: "#e8e4df",
};

const CATEGORIES = [
  { id: "food",    emoji: "🍽", label: "음식",     sub: "맛집 · 카페" },
  { id: "culture", emoji: "🎨", label: "문화생활", sub: "전시 · 공연 · 팝업" },
  { id: "daily",   emoji: "📅", label: "일상",     sub: "리뷰 · 데일리" },
];

const FIELD_CONFIG = {
  food:    { nameLabel: "가게 이름 *", namePH: "예: 고씨네 동해막국수 강릉", locLabel: "위치", dateLabel: "방문일", menusLabel: "주문 메뉴 & 가격", menusPH: "예: 비빔막국수 11,000원, 수육 18,000원", memoPH: "분위기, 맛, 서비스 기억나는 것\n예: 면이 쫄깃, 육수 깊음, 웨이팅 30분", showTarget: false },
  culture: { nameLabel: "전시/공연명 *", namePH: "예: 모네: 빛을 그리다", locLabel: "장소", dateLabel: "관람일", menusLabel: "티켓 가격", menusPH: "예: 성인 22,000원", memoPH: "관람 소감, 인상 깊었던 부분\n예: 몰입감 있는 미디어아트, 인생샷 명소", showTarget: true, targetLabel: "추천 대상", targetPH: "예: 데이트, 가족, 혼자" },
  daily:   { nameLabel: "주제 *", namePH: "예: 다이슨 에어랩 3개월 사용 후기", locLabel: "구매처 / 장소", dateLabel: "날짜", menusLabel: "가격", menusPH: "예: 699,000원", memoPH: "사용 경험, 느낀 점\n예: 열 손상 적음, 볼륨 잘 살아남, 조금 무거움", showTarget: true, targetLabel: "추천 대상", targetPH: "예: 직모, 웨이브 원하는 분" },
};

const SEARCH_LABEL = {
  food: "네이버에서 가게 정보 검색 중...",
  culture: "전시/공연 정보 검색 중...",
  daily: "관련 정보 검색 중...",
};

const SYSTEM_PROMPT = {
  food: (style) => `너는 네이버 블로그 맛집/카페 전담 카피라이터 겸 SEO 전문가야.${style}
[규칙] 어투: ~해요 친근한 대화체 / 서론: 독자 공감 TMI 2~3문장으로 시작 / 구조: 서론→본론1(분위기)→본론2(메뉴/맛 솔직후기)→결론 / 단락 3~4문장+빈줄 / 키워드 5~7회 자연 배치 / [이미지 첨부: 설명] 위치 명시 / 최소 1500자
[출력형식]
[추천 제목 3가지]
1.
2.
3.
[본문]
(전체 포스팅)
[방문 정보 요약]
| 항목 | 내용 |
|---|---|
| 위치 | |
| 영업시간 | |
| 정기휴무 | |
| 주차 | |
| 가격대 | |
| 추천메뉴 | |
[추천 태그]
#태그 (7~10개)`,

  culture: (style) => `너는 네이버 블로그 문화생활(전시/공연/팝업) 전담 카피라이터 겸 SEO 전문가야.${style}
[규칙] 어투: ~해요 친근한 대화체 / 서론: 설레는 방문 계기로 시작 / 구조: 서론→본론1(공간/구성 소개)→본론2(관람 포인트/솔직 후기)→결론(추천 대상) / 단락 3~4문장+빈줄 / 키워드 5~7회 자연 배치 / [이미지 첨부: 설명] 위치 명시 / 최소 1500자
[출력형식]
[추천 제목 3가지]
1.
2.
3.
[본문]
(전체 포스팅)
[관람 정보 요약]
| 항목 | 내용 |
|---|---|
| 장소 | |
| 관람 기간 | |
| 운영시간 | |
| 티켓 가격 | |
| 주차 | |
| 추천 대상 | |
| 유의사항 | |
[추천 태그]
#태그 (7~10개)`,

  daily: (style) => `너는 네이버 블로그 일상/리뷰 전담 카피라이터 겸 SEO 전문가야.${style}
[규칙] 어투: ~해요 친근한 대화체 / 서론: 구매/경험 계기 TMI로 시작 / 구조: 서론→본론1(특징 소개)→본론2(직접 써보니/솔직 장단점)→결론(추천 대상) / 단락 3~4문장+빈줄 / 키워드 5~7회 자연 배치 / [이미지 첨부: 설명] 위치 명시 / 최소 1500자
[출력형식]
[추천 제목 3가지]
1.
2.
3.
[본문]
(전체 포스팅)
[정보 요약]
| 항목 | 내용 |
|---|---|
| 제품명/주제 | |
| 구매처 | |
| 가격 | |
| 추천 대상 | |
| 장점 | |
| 아쉬운 점 | |
[추천 태그]
#태그 (7~10개)`,
};

const s = {
  app: { minHeight: "100vh", background: COLORS.bg, fontFamily: "'Pretendard','Apple SD Gothic Neo',sans-serif", color: COLORS.text },
  header: { background: COLORS.card, borderBottom: `1px solid ${COLORS.border}`, padding: "18px 24px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 },
  logo: { width: 32, height: 32, background: COLORS.accent, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 16 },
  body: { maxWidth: 600, margin: "0 auto", padding: "20px 16px 80px" },
  card: { background: COLORS.card, borderRadius: 16, padding: "20px", marginBottom: 12, border: `1px solid ${COLORS.border}` },
  secTitle: { fontSize: 13, fontWeight: 700, color: COLORS.accent, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 },
  label: { fontSize: 12, color: COLORS.muted, marginBottom: 6, display: "block" },
  input: { width: "100%", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 14, color: COLORS.text, background: COLORS.bg, outline: "none", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 14, color: COLORS.text, background: COLORS.bg, outline: "none", resize: "vertical", minHeight: 90, boxSizing: "border-box", lineHeight: 1.6, fontFamily: "inherit" },
  row: { display: "flex", gap: 10, marginBottom: 12 },
  col: { flex: 1 },
  genBtn: { width: "100%", padding: 15, borderRadius: 14, background: COLORS.accent, color: "white", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", marginTop: 8 },
  copyBtn: { padding: "6px 12px", borderRadius: 8, background: COLORS.accentLight, color: COLORS.accent, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer" },
  kwTag: { padding: "4px 10px", borderRadius: 20, background: COLORS.accentLight, color: COLORS.accent, fontSize: 12, fontWeight: 600 },
  photoThumb: { width: 72, height: 72, borderRadius: 10, objectFit: "cover", border: `1px solid ${COLORS.border}` },
  addPhoto: { width: 72, height: 72, borderRadius: 10, border: `2px dashed ${COLORS.border}`, background: COLORS.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", color: COLORS.muted, fontSize: 10, gap: 2 },
};

function Spinner({ step }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 0", gap: 12, color: COLORS.muted, fontSize: 14 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 32, height: 32, border: `3px solid ${COLORS.accentLight}`, borderTop: `3px solid ${COLORS.accent}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <div style={{ textAlign: "center" }}>
        <div style={{ fontWeight: 600, color: COLORS.accent, marginBottom: 4 }}>{step}</div>
        <div>잠시만 기다려주세요...</div>
      </div>
    </div>
  );
}

export default function NaverBlogApp() {
  const [category, setCategory] = useState("food");
  const [name, setName]         = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate]         = useState("");
  const [menus, setMenus]       = useState("");
  const [target, setTarget]     = useState("");
  const [memo, setMemo]         = useState("");
  const [myStyle, setMyStyle]   = useState("");
  const [showStyle, setShowStyle] = useState(false);
  const [photos, setPhotos]     = useState([]);
  const [loading, setLoading]   = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [result, setResult]     = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [copied, setCopied]     = useState(false);
  const [searching, setSearching] = useState(false);
  const [storeInfo, setStoreInfo] = useState(null);
  const [searchError, setSearchError] = useState("");
  const fileRef = useRef();

  const resetForm = (cat) => {
    setCategory(cat); setName(""); setLocation(""); setDate(""); setMenus(""); setTarget(""); setMemo("");
    setPhotos([]); setStoreInfo(null); setSearchError(""); setResult(null); setKeywords([]);
  };

  // 단일 API 호출로 웹검색 (web_search_20250305는 서버사이드 툴 — 루프 불필요)
  const searchWithWeb = async (userMsg, system, maxTokens = 800) => {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: {
        "Content-Type": "application/json",
        "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-calls": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: userMsg }],
        tools: [{ type: "web_search_20250305", name: "web_search" }],
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
    // 텍스트 블록만 추출 (tool_use, tool_result 블록 제외)
    return data.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";
  };

  const fetchStoreInfo = async () => {
    const label = FIELD_CONFIG[category].nameLabel.replace(" *", "");
    if (!name.trim()) return alert(`${label}을 입력해주세요!`);
    setSearching(true); setStoreInfo(null); setSearchError("");
    try {
      const system = `너는 한국 장소/가게 정보 수집 전문가야.
반드시 웹 검색을 통해 정보를 찾아서, 아래 JSON 형식으로만 응답해.
마크다운 없이 { 로 시작하는 JSON 한 줄만 출력해.
{"name":"","location":"","hours":"","closed":"","menus":[],"parking":"","phone":"","summary":""}
없는 정보는 빈 값으로 남겨.`;
      const query = `${name} 주소 영업시간 메뉴 전화번호`;
      const text = await searchWithWeb(query, system, 600);
      // JSON 추출 시도
      const match = text.match(/\{[\s\S]*?\}/);
      if (match) {
        try {
          const info = JSON.parse(match[0]);
          setStoreInfo(info);
          if (info.location) setLocation(info.location);
          if (info.menus?.length) setMenus(info.menus.join(", "));
        } catch {
          setSearchError("정보를 파싱하지 못했어요. 직접 입력해주세요.");
        }
      } else {
        // JSON이 아닌 일반 텍스트로 왔을 때 — 그대로 summary에 담기
        if (text.trim()) {
          setStoreInfo({ name, location: "", hours: "", closed: "", menus: [], parking: "", phone: "", summary: text.slice(0, 200) });
        } else {
          setSearchError("정보를 찾지 못했어요. 이름을 더 구체적으로 입력해보세요.");
        }
      }
    } catch (e) {
      setSearchError(`검색 오류: ${e.message}`);
    } finally { setSearching(false); }
  };

  const handleGenerate = async () => {
    const label = FIELD_CONFIG[category].nameLabel.replace(" *", "");
    if (!name.trim()) return alert(`${label}을 입력해주세요!`);
    setLoading(true); setResult(null); setKeywords([]);
    try {
      setLoadingStep("🔍 트렌드 키워드 수집 중...");
      const kwSystem = `너는 네이버 블로그 SEO 전문가야. 웹 검색으로 인기 키워드를 찾아서 JSON 배열로만 반환해. 마크다운 없이 [ 로 시작하는 배열만. 예: ["강릉막국수","강릉맛집"]`;
      const kwCat = category === "food" ? "맛집" : category === "culture" ? "전시공연" : "리뷰";
      const kwText = await searchWithWeb(`"${name}" ${kwCat} 네이버 블로그 상위 노출 인기 키워드`, kwSystem, 400);
      const kwMatch = kwText.match(/\[[\s\S]*?\]/);
      const kws = kwMatch ? (() => { try { return JSON.parse(kwMatch[0]); } catch { return []; } })() : [];
      setKeywords(kws);

      setLoadingStep("✍️ 포스팅 작성 중...");
      const styleGuide = myStyle.trim() ? `\n\n[중요] 아래 글의 말투·문체·리듬을 그대로 따라줘:\n---\n${myStyle}\n---` : "";
      const photoInfo = photos.length > 0 ? photos.map((p, i) => `사진${i+1}(${p.name})`).join(", ") : "사진 없음";

      const userMsg = {
        food:    `가게명: ${name}\n위치: ${location||"미입력"}\n방문일: ${date||"최근"}\n메뉴: ${menus||"미입력"}\n메모: ${memo||"없음"}\n사진: ${photoInfo}\n키워드: ${kws.length?kws.join(", "):"SEO에 맞게 자유롭게"}`,
        culture: `전시/공연명: ${name}\n장소: ${location||"미입력"}\n관람일: ${date||"최근"}\n티켓가격: ${menus||"미입력"}\n추천대상: ${target||"미입력"}\n메모: ${memo||"없음"}\n사진: ${photoInfo}\n키워드: ${kws.length?kws.join(", "):"SEO에 맞게 자유롭게"}`,
        daily:   `주제: ${name}\n구매처/장소: ${location||"미입력"}\n날짜: ${date||"최근"}\n가격: ${menus||"미입력"}\n추천대상: ${target||"미입력"}\n메모: ${memo||"없음"}\n사진: ${photoInfo}\n키워드: ${kws.length?kws.join(", "):"SEO에 맞게 자유롭게"}`,
      }[category];

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: {
        "Content-Type": "application/json",
        "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-calls": "true",
      },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 3000,
          system: SYSTEM_PROMPT[category](styleGuide),
          messages: [{ role: "user", content: `아래 정보로 네이버 블로그 포스팅 작성해줘.\n${userMsg}` }],
        }),
      });
      const d = await res.json();
      setResult(d.content?.filter(b => b.type === "text").map(b => b.text).join("") || "");
    } catch (e) { alert("오류가 발생했어요. 다시 시도해주세요."); }
    finally { setLoading(false); setLoadingStep(""); }
  };

  const fc = FIELD_CONFIG[category];
  const cat = CATEGORIES.find(c => c.id === category);

  return (
    <div style={s.app}>
      <style>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
        *{box-sizing:border-box} input:focus,textarea:focus{border-color:#2d6a4f!important} button:active{transform:scale(0.97)}
        @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
        @keyframes pdot{0%,80%,100%{opacity:.2;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}
        .shimbar{background:linear-gradient(90deg,#c8e6c9 25%,#e8f5e9 50%,#c8e6c9 75%);background-size:400px 100%;animation:shimmer 1.4s infinite;border-radius:6px}
      `}</style>

      <div style={s.header}>
        <div style={s.logo}>🍃</div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700 }}>블로그 AI 작성기</div>
          <div style={{ fontSize: 12, color: COLORS.muted }}>네이버 블로그 포스팅 자동 생성</div>
        </div>
      </div>

      <div style={s.body}>

        {/* 카테고리 탭 */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => resetForm(c.id)} style={{
              flex: 1, padding: "12px 4px", borderRadius: 14, border: "none", cursor: "pointer",
              background: category === c.id ? COLORS.accent : COLORS.card,
              color: category === c.id ? "white" : COLORS.muted,
              fontWeight: category === c.id ? 700 : 400,
              fontSize: 12, transition: "all 0.2s",
              boxShadow: category === c.id ? "0 2px 8px rgba(45,106,79,0.25)" : `0 0 0 1px ${COLORS.border}`,
            }}>
              <div style={{ fontSize: 20, marginBottom: 3 }}>{c.emoji}</div>
              <div>{c.label}</div>
              <div style={{ fontSize: 10, opacity: 0.75, marginTop: 1 }}>{c.sub}</div>
            </button>
          ))}
        </div>

        {/* 기본 정보 */}
        <div style={s.card}>
          <div style={s.secTitle}>{cat.emoji} {cat.label} 정보</div>

          <div style={{ marginBottom: 12 }}>
            <label style={s.label}>{fc.nameLabel}</label>
            <input style={s.input} placeholder={fc.namePH} value={name}
              onChange={e => setName(e.target.value)} />
          </div>


                    <div style={s.row}>
            <div style={s.col}>
              <label style={s.label}>{fc.locLabel}</label>
              <input style={s.input} placeholder="자동 입력 또는 직접 입력" value={location} onChange={e => setLocation(e.target.value)} />
            </div>
            <div style={s.col}>
              <label style={s.label}>{fc.dateLabel}</label>
              <input style={s.input} placeholder="예: 2025.04" value={date} onChange={e => setDate(e.target.value)} />
            </div>
          </div>

          <div style={{ marginBottom: fc.showTarget ? 12 : 0 }}>
            <label style={s.label}>{fc.menusLabel}</label>
            <input style={s.input} placeholder={fc.menusPH} value={menus} onChange={e => setMenus(e.target.value)} />
          </div>

          {fc.showTarget && (
            <div>
              <label style={s.label}>{fc.targetLabel}</label>
              <input style={s.input} placeholder={fc.targetPH} value={target} onChange={e => setTarget(e.target.value)} />
            </div>
          )}
        </div>

        {/* 메모 */}
        <div style={s.card}>
          <div style={s.secTitle}>📝 메모</div>
          <textarea style={s.textarea} placeholder={fc.memoPH} value={memo} onChange={e => setMemo(e.target.value)} />
          <div style={{ textAlign: "right", fontSize: 11, color: memo.length > 0 ? COLORS.accent : COLORS.muted, marginTop: 5 }}>
            {memo.length.toLocaleString()}자
          </div>
        </div>

        {/* 사진 */}
        <div style={s.card}>
          <div style={s.secTitle}>📸 사진 첨부</div>
          <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 10 }}>사진을 올리면 AI가 내용을 파악해 글에 반영해요</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {photos.map((p, i) => (
              <div key={i} style={{ position: "relative" }}>
                <img src={p.url} alt={p.name} style={s.photoThumb} />
                <button onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))}
                  style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", background: "#ff4d4d", color: "white", border: "none", fontSize: 10, cursor: "pointer", lineHeight: "18px", textAlign: "center" }}>✕</button>
              </div>
            ))}
            <div style={s.addPhoto} onClick={() => fileRef.current.click()}>
              <span style={{ fontSize: 20 }}>+</span><span>사진 추가</span>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }}
            onChange={e => {
              Promise.all(Array.from(e.target.files).map(f => new Promise(res => { const r = new FileReader(); r.onload = () => res({ url: r.result, name: f.name }); r.readAsDataURL(f); })))
                .then(imgs => setPhotos(prev => [...prev, ...imgs]));
            }} />
        </div>

        {/* 내 글 스타일 */}
        <div style={s.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showStyle ? 12 : 0 }}>
            <div style={s.secTitle}>✨ 내 글 스타일 (선택)</div>
            <button onClick={() => setShowStyle(!showStyle)} style={{ fontSize: 12, color: COLORS.muted, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
              {showStyle ? "접기" : "펼치기"}
            </button>
          </div>
          {showStyle && (
            <>
              <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 8 }}>기존 블로그 글을 붙여넣으면 똑같은 말투로 써줘요</div>
              <textarea style={{ ...s.textarea, minHeight: 120 }} placeholder="기존 블로그 글 붙여넣기..." value={myStyle} onChange={e => setMyStyle(e.target.value)} />
            </>
          )}
        </div>

        {/* 생성 버튼 */}
        <button style={{ ...s.genBtn, opacity: loading ? 0.7 : 1 }} onClick={handleGenerate} disabled={loading}>
          {loading ? "⏳ 작성 중..." : `🚀 ${cat.label} 포스팅 생성하기`}
        </button>

        {loading && <Spinner step={loadingStep} />}

        {keywords.length > 0 && !loading && (
          <div style={{ ...s.card, marginTop: 16 }}>
            <div style={s.secTitle}>🔑 수집된 트렌드 키워드</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {keywords.map((kw, i) => <span key={i} style={s.kwTag}>#{kw}</span>)}
            </div>
          </div>
        )}

        {result && !loading && (
          <div style={{ background: COLORS.card, borderRadius: 16, padding: "20px", border: `1.5px solid ${COLORS.accentMid}`, marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.accent }}>✅ 완성된 포스팅</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "white", background: result.length >= 1500 ? COLORS.accent : "#f0a500", padding: "3px 10px", borderRadius: 20 }}>
                  {result.length.toLocaleString()}자
                </span>
                <button style={s.copyBtn} onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                  {copied ? "✓ 복사됨!" : "복사하기"}
                </button>
              </div>
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.85, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{result}</div>
          </div>
        )}

      </div>
    </div>
  );
}
