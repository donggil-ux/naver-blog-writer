import { useState, useRef, useEffect } from "react";

const DEFAULT_MY_STYLE = `앞으로 내 블로그 포스팅 초안을 작성하거나 다듬을 때는 아래의 '새밍이 블로그 글 스타일'을 반드시 지켜서 작성해 줘.

[내용]
1. 인사말 및 오프닝
- 항상 "안녕하세요 새밍이입니다!!" 또는 "안녕하세요 새밍이 입니닷!!"과 같이 밝은 인사로 시작할 것.
- 바로 본론으로 들어가지 말고, 방문하게 된 계기나 일상 에피소드(예: 가족/동생과의 나들이, 날씨 이야기, 평소 입맛 취향 등)를 가볍게 풀면서 자연스럽게 주제를 소개할 것.

2. 어조 및 문체 (Tone & Manner)
- 딱딱한 문장 대신 '~입니당', '~입니닷', '~더라구요', '~했어요', '~아시죠~?' 등 귀엽고 친밀감 있는 대화체를 사용할 것.
- 느낌표(!!, !)와 물결표(~)를 넉넉하게 사용하여 블로거 특유의 높은 텐션과 신나는 감정을 표현할 것.
- 'ㅎㅎㅎ', 'ㅋㅋ', '쿠쿠', '룰루랄라', '아차차', '총총' 같은 가벼운 의성어/의태어와 혼잣말을 자연스럽게 섞을 것.

3. 이모지 및 특수기호 활용
- 문장 끝이나 감정이 강조되는 부분에 스마일리 기호 :) 와 감정 이모지(😭, 🥰, 👏, 😎, 😆)를 적절히 활용할 것.
- 감격스럽거나 살짝 아쉬운 감정, 여운을 줄 때는 쉼표나 마침표를 연달아 쓰는 말줄임 표현(,, 또는 ..)을 사용할 것 (예: 눈물이,, 먹고 싶다😭).

4. 정보 전달 및 가독성 (구조화)
- 포스팅 상단에 본문과 관련된 해시태그(#내돈내산, #지역맛집, #메뉴이름 등)를 모아서 작성할 것.
- 영업시간, 라스트오더, 체크인/체크아웃, 위치 등 핵심 정보는 대괄호 [ ]나 꺾쇠 < >를 사용해 눈에 띄게 정리할 것 (예: [영업시간: 화~일 11:00~23:00]).
- 소개할 메뉴나 공간이 많을 경우 [리뷰 순서]를 1, 2, 3 번호로 매겨서 가독성 있게 구조를 잡을 것.

5. 방문자 꿀팁 및 주관적인 찐 후기
- 직접 겪어본 사람만 알 수 있는 꿀팁(예: "주차는 공영주차장에", "본점 옆에 1, 2호점이 붙어있으니 헷갈리지 마세요")이나 추천 대상(데이트 장소 추천, 아이랑 가기 좋은 곳 등)을 꼭 포함할 것.
- "내돈내산이며 제 개인적인 입맛에 맞춰 리뷰합니다"와 같은 솔직하고 진정성 있는 멘트를 곁들일 것.`;

// 다크/라이트 테마 — 카드는 양쪽 모두 흰색 유지, 페이지 chrome만 반전
const THEMES = {
  dark: {
    pageBg: "#000000",
    pageText: "#ffffff",
    pageMuted: "rgba(255,255,255,0.55)",
    pageBorder: "rgba(255,255,255,0.12)",
    tabBorder: "rgba(255,255,255,0.25)",
    tabActiveBg: "#ffffff",
    tabActiveText: "#000000",
    tabInactiveText: "#ffffff",
    genBtnBg: "#ffffff",
    genBtnText: "#000000",
    logoBg: "#ffffff",
    logoText: "#000000",
    focusOutline: "#ffffff",
  },
  light: {
    pageBg: "#ffffff",
    pageText: "#000000",
    pageMuted: "rgba(0,0,0,0.55)",
    pageBorder: "rgba(0,0,0,0.12)",
    tabBorder: "rgba(0,0,0,0.2)",
    tabActiveBg: "#000000",
    tabActiveText: "#ffffff",
    tabInactiveText: "#000000",
    genBtnBg: "#000000",
    genBtnText: "#ffffff",
    logoBg: "#000000",
    logoText: "#ffffff",
    focusOutline: "#000000",
  },
};

const escapeHTML = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const inlineFormat = (text) => {
  let t = escapeHTML(text);
  t = t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/\[이미지 첨부:\s*([^\]]+)\]/g, '<span style="display:inline-block;padding:4px 10px;background:#e8f4ed;color:#2d6a4f;border-radius:6px;font-size:13px;">📷 $1</span>');
  return t;
};

const renderTable = (lines) => {
  const rows = lines.filter(l => !/^\|[\s\-:|]+\|$/.test(l));
  const parsed = rows.map(r => {
    const parts = r.split("|");
    return parts.slice(1, parts.length - 1).map(c => c.trim());
  });
  if (!parsed.length) return "";
  const [head, ...body] = parsed;
  const th = head.map(c => `<td style="padding:10px;background:#f5f5f5;font-weight:700;border:1px solid #ddd;">${escapeHTML(c)}</td>`).join("");
  const tb = body.map(r => `<tr>${r.map(c => `<td style="padding:10px;border:1px solid #ddd;">${escapeHTML(c)}</td>`).join("")}</tr>`).join("");
  return `<table style="border-collapse:collapse;width:100%;margin:14px 0;font-size:14px;"><tbody><tr>${th}</tr>${tb}</tbody></table>`;
};

const toNaverHTML = (text) => {
  if (!text) return "";
  const lines = text.split("\n");
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const trimmed = lines[i].trim();
    if (!trimmed) { i++; continue; }
    if (/^\[.+\]$/.test(trimmed)) {
      out.push(`<h3 style="font-size:16px;font-weight:800;color:#2d6a4f;margin:22px 0 10px;">${escapeHTML(trimmed.replace(/^\[|\]$/g, ""))}</h3>`);
      i++; continue;
    }
    if (trimmed.startsWith("|")) {
      const tbl = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) { tbl.push(lines[i].trim()); i++; }
      out.push(renderTable(tbl));
      continue;
    }
    if (/^\d+\.\s/.test(trimmed)) {
      out.push(`<p style="line-height:1.85;margin:0 0 6px;">${inlineFormat(trimmed)}</p>`);
      i++; continue;
    }
    if (trimmed.startsWith("#")) {
      out.push(`<p style="line-height:1.85;margin:10px 0;color:#2d6a4f;font-weight:600;">${escapeHTML(trimmed)}</p>`);
      i++; continue;
    }
    const para = [];
    while (i < lines.length) {
      const t = lines[i].trim();
      if (!t || /^\[.+\]$/.test(t) || t.startsWith("|") || t.startsWith("#") || /^\d+\.\s/.test(t)) break;
      para.push(t); i++;
    }
    if (para.length) {
      out.push(`<p style="line-height:1.95;margin:0 0 16px;font-size:15px;">${inlineFormat(para.join("<br/>"))}</p>`);
    }
  }
  return `<div style="font-family:'Pretendard','Apple SD Gothic Neo',sans-serif;color:#1a1a1a;max-width:720px;">${out.join("\n")}</div>`;
};

// Figma 디자인 시스템 — 흑백 only (컬러는 결과물 섹션 gradient로만)
const COLORS = {
  bg: "#ffffff",
  card: "#ffffff",
  accent: "#000000",
  accentLight: "rgba(0,0,0,0.05)",
  accentMid: "rgba(0,0,0,0.40)",
  text: "#000000",
  muted: "rgba(0,0,0,0.55)",
  border: "rgba(0,0,0,0.12)",
};
const GRADIENT = "linear-gradient(135deg,#00e599 0%,#ffeb3b 30%,#ab47bc 65%,#ec407a 100%)";
const FF_SANS = "'Pretendard Variable','Pretendard','SF Pro Display',system-ui,helvetica,sans-serif";
const FF_MONO = "'SF Mono','Menlo','Consolas',monospace";

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
  app: { minHeight: "100vh", background: "#000000", fontFamily: FF_SANS, color: "#ffffff", fontFeatureSettings: '"kern"', WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale", letterSpacing: "-0.14px" },
  header: { background: "#000000", borderBottom: "1px solid rgba(255,255,255,0.12)", padding: "22px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 },
  headerLeft: { display: "flex", alignItems: "center", gap: 14 },
  logo: { width: 36, height: 36, background: "#ffffff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#000000", fontSize: 15, fontWeight: 700, letterSpacing: "-0.5px", fontFamily: FF_SANS },
  monoLabel: { fontFamily: FF_MONO, fontSize: 11, fontWeight: 400, letterSpacing: "0.6px", textTransform: "uppercase", color: COLORS.text },
  monoLabelMuted: { fontFamily: FF_MONO, fontSize: 11, fontWeight: 400, letterSpacing: "0.6px", textTransform: "uppercase", color: COLORS.muted },
  monoLabelLight: { fontFamily: FF_MONO, fontSize: 11, fontWeight: 400, letterSpacing: "0.6px", textTransform: "uppercase", color: "#ffffff" },
  monoLabelLightMuted: { fontFamily: FF_MONO, fontSize: 11, fontWeight: 400, letterSpacing: "0.6px", textTransform: "uppercase", color: "rgba(255,255,255,0.55)" },
  body: { maxWidth: 780, margin: "0 auto", padding: "48px 24px 120px" },
  card: { background: COLORS.bg, borderRadius: 8, padding: 32, marginBottom: 14, border: `1px solid ${COLORS.border}` },
  secTitle: { fontFamily: FF_SANS, fontSize: 24, fontWeight: 700, color: COLORS.text, marginBottom: 22, display: "flex", alignItems: "center", gap: 8, letterSpacing: "-0.26px", lineHeight: 1.35 },
  label: { fontFamily: FF_MONO, fontSize: 10, color: COLORS.muted, marginBottom: 8, display: "block", letterSpacing: "0.6px", textTransform: "uppercase", fontWeight: 400 },
  input: { width: "100%", padding: "14px 16px", borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 15, color: COLORS.text, background: COLORS.bg, outline: "none", boxSizing: "border-box", fontFamily: FF_SANS, fontWeight: 400, letterSpacing: "-0.14px" },
  textarea: { width: "100%", padding: "14px 16px", borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 15, color: COLORS.text, background: COLORS.bg, outline: "none", resize: "vertical", minHeight: 100, boxSizing: "border-box", lineHeight: 1.55, fontFamily: FF_SANS, fontWeight: 340, letterSpacing: "-0.14px" },
  row: { display: "flex", gap: 12, marginBottom: 14 },
  col: { flex: 1 },
  genBtn: { width: "100%", padding: "18px 32px 20px", borderRadius: 50, background: "#ffffff", color: "#000000", fontSize: 16, fontWeight: 480, border: "none", cursor: "pointer", marginTop: 16, fontFamily: FF_SANS, letterSpacing: "-0.14px" },
  copyBtn: { padding: "8px 18px 10px", borderRadius: 50, background: COLORS.bg, color: COLORS.text, fontSize: 13, fontWeight: 480, border: `1px solid ${COLORS.border}`, cursor: "pointer", fontFamily: FF_SANS, letterSpacing: "-0.14px" },
  copyBtnDark: { padding: "8px 18px 10px", borderRadius: 50, background: COLORS.text, color: COLORS.bg, fontSize: 13, fontWeight: 480, border: "none", cursor: "pointer", fontFamily: FF_SANS, letterSpacing: "-0.14px" },
  kwTag: { padding: "6px 14px 8px", borderRadius: 50, background: COLORS.accentLight, color: COLORS.text, fontSize: 12, fontWeight: 400, fontFamily: FF_SANS, letterSpacing: "-0.1px" },
  photoThumb: { width: 88, height: 88, borderRadius: 8, objectFit: "cover", border: `1px solid ${COLORS.border}` },
  addPhoto: { width: 88, height: 88, borderRadius: 8, border: `1px dashed ${COLORS.muted}`, background: COLORS.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", color: COLORS.muted, fontSize: 10, gap: 3, fontFamily: FF_MONO, letterSpacing: "0.5px", textTransform: "uppercase" },
};

function Spinner({ step, theme }) {
  const pt = theme?.pageText || "#ffffff";
  const pm = theme?.pageMuted || "rgba(255,255,255,0.55)";
  const pb = theme?.pageBorder || "rgba(255,255,255,0.2)";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0", gap: 16, color: pm, fontSize: 13, fontFamily: FF_SANS }}>
      <div style={{ width: 34, height: 34, border: `2px solid ${pb}`, borderTop: `2px solid ${pt}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: FF_MONO, fontSize: 11, fontWeight: 400, letterSpacing: "0.6px", textTransform: "uppercase", color: pt, marginBottom: 6 }}>{step}</div>
        <div style={{ fontWeight: 340, letterSpacing: "-0.14px" }}>잠시만 기다려주세요...</div>
      </div>
    </div>
  );
}

export default function NaverBlogApp() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("nb-theme") || "dark";
    }
    return "dark";
  });
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("nb-theme", theme);
    }
  }, [theme]);
  const t = THEMES[theme];
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const [category, setCategory] = useState("food");
  const [name, setName]         = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate]         = useState("");
  const [menus, setMenus]       = useState("");
  const [target, setTarget]     = useState("");
  const [memo, setMemo]         = useState("");
  const [myStyle, setMyStyle]   = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nb-my-style");
      return saved !== null ? saved : DEFAULT_MY_STYLE;
    }
    return DEFAULT_MY_STYLE;
  });
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("nb-my-style", myStyle);
    }
  }, [myStyle]);
  const [showStyle, setShowStyle] = useState(true);
  const [photos, setPhotos]     = useState([]);
  const [loading, setLoading]   = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [result, setResult]     = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [copied, setCopied]     = useState(false);
  const [htmlCopied, setHtmlCopied] = useState(false);
  const [searching, setSearching] = useState(false);
  const [storeInfo, setStoreInfo] = useState(null);
  const [searchError, setSearchError] = useState("");
  const fileRef = useRef();
  const dragIdx = useRef(null);
  const [dragOver, setDragOver] = useState(null);

  const reorderPhotos = (from, to) => {
    if (from === to || from == null || to == null) return;
    setPhotos(prev => {
      const arr = [...prev];
      const [m] = arr.splice(from, 1);
      arr.splice(to, 0, m);
      return arr;
    });
  };

  const copyHTML = async () => {
    const html = toNaverHTML(result);
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([html], { type: "text/html" }),
            "text/plain": new Blob([result], { type: "text/plain" }),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(html);
      }
      setHtmlCopied(true);
      setTimeout(() => setHtmlCopied(false), 2000);
    } catch {
      await navigator.clipboard.writeText(html);
      setHtmlCopied(true);
      setTimeout(() => setHtmlCopied(false), 2000);
    }
  };

  const resetForm = (cat) => {
    setCategory(cat); setName(""); setLocation(""); setDate(""); setMenus(""); setTarget(""); setMemo("");
    setPhotos([]); setStoreInfo(null); setSearchError(""); setResult(null); setKeywords([]);
  };

  // Vercel 서버리스 프록시 경유 (Google Gemini API)
  const callGemini = async (payload) => {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
    // Gemini 응답에서 모든 text part를 합쳐서 반환
    const text = data.candidates?.[0]?.content?.parts?.map(p => p.text).filter(Boolean).join("") || "";
    return text;
  };

  // Google Search grounding으로 웹검색 + LLM 응답을 한 번에
  const searchWithWeb = async (userMsg, system, maxTokens = 1200) => {
    return await callGemini({
      model: "gemini-2.5-flash",
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: userMsg }] }],
      generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 },
      tools: [{ google_search: {} }],
    });
  };

  // 쿼리 정규화 — 대소문자/공백 관계없이 검색
  const normalizeQuery = (q) => q.trim().replace(/\s+/g, " ");
  const queryVariants = (q) => {
    const base = normalizeQuery(q);
    const noSpace = base.replace(/\s/g, "");
    // 영문↔한글 경계에 공백 삽입 (예: THE나은버거 → THE 나은버거)
    const withGap = noSpace.replace(/([a-zA-Z])([가-힣])/g, "$1 $2").replace(/([가-힣])([a-zA-Z])/g, "$1 $2");
    const variants = [base];
    if (noSpace !== base) variants.push(noSpace);
    if (withGap !== base && withGap !== noSpace) variants.push(withGap);
    return variants;
  };

  const searchNaver = async (query) => {
    const res = await fetch(`/api/naver-local?query=${encodeURIComponent(query)}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.items || [];
  };

  // 네이버 지역 검색 API — 정확한 가게 정보 직접 조회
  const fetchStoreInfo = async () => {
    const label = FIELD_CONFIG[category].nameLabel.replace(" *", "");
    if (!name.trim()) return alert(`${label}을 입력해주세요!`);
    setSearching(true); setStoreInfo(null); setSearchError("");
    try {
      // 여러 변형으로 시도 — 첫 번째 결과가 나오면 즉시 사용
      let items = [];
      for (const q of queryVariants(name)) {
        items = await searchNaver(q);
        if (items.length > 0) break;
      }
      if (items.length === 0) {
        setSearchError("정보를 찾지 못했어요. 이름을 더 구체적으로 입력해보세요.");
        return;
      }
      const top = items[0];
      const cleanTitle = top.title.replace(/<[^>]*>/g, "");

      // 네이버 블로그에서 메뉴/가격 패턴 추출
      let blogMenus = [];
      try {
        const blogRes = await fetch(`/api/naver-blog?query=${encodeURIComponent(`${cleanTitle} 메뉴 가격`)}`);
        const blogData = await blogRes.json();
        const blogText = (blogData.items || []).map(b => `${b.title} ${b.description}`.replace(/<[^>]*>/g, "")).join(" ");
        // "메뉴명 N,NNN원" 또는 "메뉴명 N원" 패턴 추출
        const priceMatches = blogText.match(/[가-힣a-zA-Z\s]{2,15}\s?\d{1,3}[,.]?\d{3}원/g) || [];
        const seen = new Set();
        blogMenus = priceMatches
          .map(m => m.trim())
          .filter(m => {
            const key = m.replace(/\s/g, "").toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .slice(0, 8);
      } catch { /* 블로그 검색 실패해도 가게 정보는 보여줌 */ }

      const info = {
        name: cleanTitle,
        location: top.roadAddress || top.address || "",
        hours: "",
        closed: "",
        menus: blogMenus,
        parking: "",
        phone: top.telephone || "",
        summary: top.category || "",
      };
      setStoreInfo(info);
      if (info.location) setLocation(info.location);
      if (blogMenus.length > 0) setMenus(blogMenus.join(", "));
    } catch (e) {
      setSearchError(`검색 오류: ${e.message}`);
    } finally { setSearching(false); }
  };

  const handleGenerate = async () => {
    const label = FIELD_CONFIG[category].nameLabel.replace(" *", "");
    if (!name.trim()) return alert(`${label}을 입력해주세요!`);
    setLoading(true); setResult(null); setKeywords([]);
    try {
      // 네이버 블로그 검색 → 인기 글 제목에서 키워드 추출 (Gemini 호출 없음)
      setLoadingStep("🔍 네이버 트렌드 키워드 수집 중...");
      const kwCat = category === "food" ? "맛집" : category === "culture" ? "전시공연" : "리뷰";
      const kwRes = await fetch(`/api/naver-blog?query=${encodeURIComponent(`${name} ${kwCat}`)}`);
      const kwData = await kwRes.json();
      const blogItems = kwData.items || [];
      // 블로그 제목+설명에서 키워드 추출 (HTML 태그 제거 → 2글자 이상 한글 단어 → 빈도 상위)
      const allText = blogItems.map(b => `${b.title} ${b.description}`.replace(/<[^>]*>/g, "")).join(" ");
      const words = allText.match(/[가-힣]{2,}/g) || [];
      const stopWords = new Set(["그리고","하지만","그래서","근데","진짜","정말","너무","아주","매우","이번","오늘","여기","거기","우리","저희","하는","있는","없는","같은","이런","그런","되는","했는","합니다","입니다","이에요","해요","있어요","없어요","했어요","됩니다","블로그","리뷰","후기","포스팅","방문"]);
      const freq = {};
      words.forEach(w => { if (!stopWords.has(w) && w !== name) freq[w] = (freq[w] || 0) + 1; });
      const kws = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([w]) => w);
      setKeywords(kws);

      setLoadingStep("✍️ 포스팅 작성 중...");
      const styleGuide = myStyle.trim() ? `\n\n[중요] 아래 글의 말투·문체·리듬을 그대로 따라줘:\n---\n${myStyle}\n---` : "";
      const photoInfo = photos.length > 0 ? photos.map((p, i) => `사진${i+1}(${p.name})`).join(", ") : "사진 없음";

      const userMsg = {
        food:    `가게명: ${name}\n위치: ${location||"미입력"}\n방문일: ${date||"최근"}\n메뉴: ${menus||"미입력"}\n메모: ${memo||"없음"}\n사진: ${photoInfo}\n키워드: ${kws.length?kws.join(", "):"SEO에 맞게 자유롭게"}`,
        culture: `전시/공연명: ${name}\n장소: ${location||"미입력"}\n관람일: ${date||"최근"}\n티켓가격: ${menus||"미입력"}\n추천대상: ${target||"미입력"}\n메모: ${memo||"없음"}\n사진: ${photoInfo}\n키워드: ${kws.length?kws.join(", "):"SEO에 맞게 자유롭게"}`,
        daily:   `주제: ${name}\n구매처/장소: ${location||"미입력"}\n날짜: ${date||"최근"}\n가격: ${menus||"미입력"}\n추천대상: ${target||"미입력"}\n메모: ${memo||"없음"}\n사진: ${photoInfo}\n키워드: ${kws.length?kws.join(", "):"SEO에 맞게 자유롭게"}`,
      }[category];

      const text = await callGemini({
        model: "gemini-2.5-flash",
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT[category](styleGuide) }] },
        contents: [{ role: "user", parts: [{ text: `아래 정보로 네이버 블로그 포스팅 작성해줘.\n${userMsg}` }] }],
        generationConfig: { maxOutputTokens: 8000, temperature: 0.85 },
      });
      setResult(text);
    } catch (e) { console.error(e); alert(`오류: ${e.message}`); }
    finally { setLoading(false); setLoadingStep(""); }
  };

  const fc = FIELD_CONFIG[category];
  const cat = CATEGORIES.find(c => c.id === category);

  return (
    <div style={{ ...s.app, background: t.pageBg, color: t.pageText }} className={`nb-root theme-${theme}`}>
      <style>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.min.css');
        *{box-sizing:border-box;font-feature-settings:"kern"}
        html,body{margin:0;padding:0}
        input,textarea,button,select{font-family:inherit;font-feature-settings:"kern"}
        button{-webkit-tap-highlight-color:transparent;cursor:pointer}
        button:active{transform:scale(0.98)}
        /* Figma 디자인 시스템: dashed 2px focus — 에디터 셀렉션 핸들 호응 */
        /* 카드(흰 배경)는 항상 검정 dashed, 페이지 버튼은 테마에 따라 흰/검정 */
        input:focus,textarea:focus{outline:2px dashed #000;outline-offset:3px;border-color:#000!important}
        .theme-dark button:focus-visible{outline:2px dashed #ffffff;outline-offset:3px}
        .theme-light button:focus-visible{outline:2px dashed #000;outline-offset:3px}
        .nb-card button:focus-visible{outline-color:#000!important}
        input[type="date"]{min-height:48px;appearance:none;-webkit-appearance:none}
        input[type="date"]::-webkit-calendar-picker-indicator{cursor:pointer;opacity:0.6;padding:0}
        input[type="date"]::-webkit-calendar-picker-indicator:hover{opacity:1}
        input[type="date"]::-webkit-date-and-time-value{text-align:left}
        input[type="date"]::-webkit-datetime-edit{padding:0}
        input,textarea{font-size:16px}  /* iOS 줌 방지 */
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes gshift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}

        /* 모바일 (≤480px) */
        @media (max-width:480px){
          .nb-header{padding:16px 18px!important}
          .nb-header-sub{display:none!important}
          .nb-body{padding:32px 18px 90px!important}
          .nb-card{padding:22px!important}
          .nb-tab{padding:11px 18px 13px!important;font-size:13px!important}
          .nb-gen{padding:16px 24px 18px!important;font-size:15px!important}
          .nb-photo,.nb-addphoto{width:76px!important;height:76px!important}
          .nb-hero-label{font-size:10px!important}
          .nb-hero-title{font-size:32px!important;letter-spacing:-0.96px!important}
          .nb-result-head{flex-wrap:wrap!important;gap:10px!important}
          .nb-sec-title{font-size:20px!important}
        }
        /* 태블릿 / 아이패드 (481~900px) */
        @media (min-width:481px) and (max-width:900px){
          .nb-body{max-width:720px!important;padding:44px 28px 120px!important}
          .nb-card{padding:30px!important}
          .nb-photo,.nb-addphoto{width:96px!important;height:96px!important}
        }
        /* 데스크톱 (≥901px) */
        @media (min-width:901px){
          .nb-body{max-width:800px!important;padding:56px 32px 140px!important}
          .nb-photo,.nb-addphoto{width:100px!important;height:100px!important}
        }
      `}</style>

      <div style={{ ...s.header, background: t.pageBg, borderBottom: `1px solid ${t.pageBorder}` }} className="nb-header">
        <div style={s.headerLeft}>
          <div style={{ ...s.logo, background: t.logoBg, color: t.logoText }}>N</div>
          <div>
            <div style={{ fontSize: 19, fontWeight: 540, letterSpacing: "-0.38px", lineHeight: 1.1, color: t.pageText }}>블로그 AI 작성기</div>
            <div className="nb-header-sub" style={{ fontFamily: FF_MONO, fontSize: 11, fontWeight: 400, letterSpacing: "0.6px", textTransform: "uppercase", color: t.pageMuted, marginTop: 4 }}>NAVER BLOG POST GENERATOR</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="nb-header-sub" style={{ fontFamily: FF_MONO, fontSize: 10, fontWeight: 400, letterSpacing: "0.6px", textTransform: "uppercase", color: t.pageMuted }}>V 2.0</div>
          <button onClick={toggleTheme} aria-label="Toggle theme" title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "transparent", border: `1px solid ${t.pageBorder}`,
            color: t.pageText, cursor: "pointer",
            fontSize: 15, lineHeight: 1,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: FF_SANS,
          }}>{theme === "dark" ? "☀" : "☾"}</button>
        </div>
      </div>

      <div style={s.body} className="nb-body">

        {/* Hero 타이틀 */}
        <div style={{ marginBottom: 36 }}>
          <div className="nb-hero-title" style={{ fontSize: 38, fontWeight: 700, lineHeight: 1.2, letterSpacing: "-1.14px", fontFamily: FF_SANS, color: t.pageText }}>
            어떤 글을 작성할까요?
          </div>
        </div>

        {/* 카테고리 탭 — Pill 50px 라디우스 */}
        <div style={{ display: "flex", gap: 8, marginBottom: 40, flexWrap: "wrap" }}>
          {CATEGORIES.map(c => {
            const active = category === c.id;
            return (
              <button key={c.id} onClick={() => resetForm(c.id)} className="nb-tab" style={{
                padding: "12px 22px 14px", borderRadius: 50,
                border: active ? `1px solid ${t.tabActiveBg}` : `1px solid ${t.tabBorder}`,
                background: active ? t.tabActiveBg : "transparent",
                color: active ? t.tabActiveText : t.tabInactiveText,
                fontWeight: 480, fontSize: 14, fontFamily: FF_SANS, letterSpacing: "-0.14px",
                display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s",
              }}>
                <span style={{ fontSize: 15 }}>{c.emoji}</span>
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>

        {/* 기본 정보 */}
        <div style={s.card} className="nb-card">
          <div className="nb-sec-title" style={s.secTitle}>{cat.emoji} {cat.label} 정보</div>

          <div style={{ marginBottom: 12 }}>
            <label style={s.label}>{fc.nameLabel}</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input style={{ ...s.input, flex: 1 }} placeholder={fc.namePH} value={name}
                onChange={e => setName(e.target.value)} />
              <button onClick={fetchStoreInfo} disabled={searching || !name.trim()} style={{
                padding: "0 22px 2px", borderRadius: 50, border: "none",
                background: searching || !name.trim() ? COLORS.accentLight : COLORS.text,
                color: searching || !name.trim() ? COLORS.muted : COLORS.bg,
                fontSize: 13, fontWeight: 480, cursor: searching || !name.trim() ? "not-allowed" : "pointer",
                whiteSpace: "nowrap", minWidth: 80, fontFamily: FF_SANS, letterSpacing: "-0.14px",
              }}>{searching ? "검색중" : "검색"}</button>
            </div>
          </div>

          {searching && (
            <div style={{ padding: "14px 16px", background: COLORS.accentLight, borderRadius: 8, marginBottom: 14, fontSize: 13, color: COLORS.text, display: "flex", alignItems: "center", gap: 10, fontWeight: 340, letterSpacing: "-0.14px" }}>
              <div style={{ width: 14, height: 14, border: `2px solid ${COLORS.text}`, borderTop: `2px solid transparent`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              {SEARCH_LABEL[category]}
            </div>
          )}
          {searchError && !searching && (
            <div style={{ padding: "12px 16px", background: COLORS.bg, border: `1px solid ${COLORS.text}`, borderRadius: 8, marginBottom: 14, fontSize: 12, color: COLORS.text, fontWeight: 340, letterSpacing: "-0.14px" }}>
              <span style={{ ...s.monoLabel, fontSize: 10, marginRight: 6 }}>ERROR</span>{searchError}
            </div>
          )}
          {storeInfo && !searching && (
            <div style={{ padding: "16px 18px", background: COLORS.accentLight, borderRadius: 8, marginBottom: 14, fontSize: 13, lineHeight: 1.75, color: COLORS.text, fontWeight: 340, letterSpacing: "-0.14px" }}>
              <div style={{ ...s.monoLabel, fontSize: 10, marginBottom: 8 }}>✓ 검색 결과 (자동 입력됨)</div>
              {storeInfo.location && <div>📍 {storeInfo.location}</div>}
              {storeInfo.phone && <div>📞 {storeInfo.phone}</div>}
              {storeInfo.summary && <div style={{ color: COLORS.muted }}>📂 {storeInfo.summary}</div>}
              {storeInfo.menus?.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ ...s.monoLabel, fontSize: 10, marginBottom: 8 }}>💡 블로그 추천 메뉴 (클릭 시 자동 입력)</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {storeInfo.menus.map((m, i) => (
                      <button key={i} onClick={() => setMenus(m)} style={{
                        padding: "6px 14px 8px", borderRadius: 50,
                        background: COLORS.bg, border: `1px solid ${COLORS.border}`,
                        color: COLORS.text, fontSize: 12, fontWeight: 480,
                        cursor: "pointer", fontFamily: FF_SANS, letterSpacing: "-0.1px",
                      }}>{m}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}


          <div style={s.row}>
            <div style={s.col}>
              <label style={s.label}>{fc.locLabel}</label>
              <input style={s.input} placeholder="자동 입력 또는 직접 입력" value={location} onChange={e => setLocation(e.target.value)} />
            </div>
            <div style={s.col}>
              <label style={s.label}>{fc.dateLabel}</label>
              <div style={{ position: "relative" }}>
                <input type="date" style={{ ...s.input, color: date ? COLORS.text : "transparent", WebkitTextFillColor: date ? COLORS.text : "transparent" }} value={date} onChange={e => setDate(e.target.value)} />
                {!date && (
                  <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: COLORS.muted, pointerEvents: "none", fontSize: 15, fontWeight: 400, letterSpacing: "-0.14px", fontFamily: FF_SANS }}>
                    📅 날짜 선택
                  </div>
                )}
              </div>
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
        <div style={s.card} className="nb-card">
          <div className="nb-sec-title" style={s.secTitle}>📝 메모</div>
          <textarea style={s.textarea} placeholder={fc.memoPH} value={memo} onChange={e => setMemo(e.target.value)} />
          <div style={{ textAlign: "right", fontFamily: FF_MONO, fontSize: 10, letterSpacing: "0.5px", color: memo.length > 0 ? COLORS.text : COLORS.muted, marginTop: 8, textTransform: "uppercase" }}>
            {memo.length.toLocaleString()} CHAR
          </div>
        </div>

        {/* 사진 */}
        <div style={s.card} className="nb-card">
          <div className="nb-sec-title" style={s.secTitle}>📸 사진 첨부</div>
          <div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 16, fontWeight: 340, letterSpacing: "-0.14px" }}>사진을 올리면 AI가 내용을 파악해 글에 반영해요 · 드래그로 순서 변경 가능</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {photos.map((p, i) => (
              <div
                key={p.url + i}
                draggable
                onDragStart={() => { dragIdx.current = i; }}
                onDragOver={e => { e.preventDefault(); if (dragOver !== i) setDragOver(i); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={e => { e.preventDefault(); reorderPhotos(dragIdx.current, i); dragIdx.current = null; setDragOver(null); }}
                onDragEnd={() => { dragIdx.current = null; setDragOver(null); }}
                style={{
                  position: "relative",
                  cursor: "grab",
                  transform: dragOver === i ? "scale(1.06)" : "scale(1)",
                  transition: "transform 0.15s",
                  outline: dragOver === i ? `2px solid ${COLORS.accent}` : "none",
                  outlineOffset: 2,
                  borderRadius: 10,
                }}
              >
                <img src={p.url} alt={p.name} style={s.photoThumb} draggable={false} />
                <div style={{ position: "absolute", bottom: 6, left: 6, background: COLORS.text, color: COLORS.bg, fontSize: 10, fontWeight: 540, padding: "2px 8px", borderRadius: 50, fontFamily: FF_MONO, letterSpacing: "0.4px" }}>{i + 1}</div>
                <button onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))}
                  style={{ position: "absolute", top: -7, right: -7, width: 22, height: 22, borderRadius: "50%", background: COLORS.text, color: COLORS.bg, border: `2px solid ${COLORS.bg}`, fontSize: 11, cursor: "pointer", lineHeight: "18px", textAlign: "center", padding: 0, fontWeight: 540 }}>✕</button>
              </div>
            ))}
            <div style={s.addPhoto} onClick={() => fileRef.current.click()}>
              <span style={{ fontSize: 22, fontFamily: FF_SANS, fontWeight: 320 }}>+</span><span>ADD</span>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }}
            onChange={e => {
              Promise.all(Array.from(e.target.files).map(f => new Promise(res => { const r = new FileReader(); r.onload = () => res({ url: r.result, name: f.name }); r.readAsDataURL(f); })))
                .then(imgs => setPhotos(prev => [...prev, ...imgs]));
            }} />
        </div>

        {/* 내 글 스타일 */}
        <div style={s.card} className="nb-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showStyle ? 18 : 0 }}>
            <div className="nb-sec-title" style={{ ...s.secTitle, marginBottom: 0 }}>✨ 내 글 스타일 <span style={{ opacity: 0.45, marginLeft: 4, fontSize: 14, fontWeight: 400 }}>(선택)</span></div>
            <button onClick={() => setShowStyle(!showStyle)} style={{ ...s.monoLabelMuted, fontSize: 10, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>
              {showStyle ? "CLOSE" : "EXPAND"}
            </button>
          </div>
          {showStyle && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 12 }}>
                <div style={{ fontSize: 13, color: COLORS.muted, fontWeight: 340, letterSpacing: "-0.14px" }}>포스팅 작성 시 이 스타일을 자동 반영해요 · 자유롭게 수정 가능</div>
                {myStyle !== DEFAULT_MY_STYLE && (
                  <button onClick={() => setMyStyle(DEFAULT_MY_STYLE)} style={{ ...s.monoLabelMuted, fontSize: 10, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3, whiteSpace: "nowrap" }}>RESET</button>
                )}
              </div>
              <textarea style={{ ...s.textarea, minHeight: 260 }} placeholder="기존 블로그 글 붙여넣기..." value={myStyle} onChange={e => setMyStyle(e.target.value)} />
            </>
          )}
        </div>

        {/* 생성 버튼 — CTA 초록색 (gradient 팔레트의 electric green) */}
        <button className="nb-gen" style={{ ...s.genBtn, background: "#00e599", color: "#000000", opacity: loading ? 0.6 : 1 }} onClick={handleGenerate} disabled={loading}>
          {loading ? "작성 중..." : `${cat.label} 포스팅 생성하기`}
        </button>

        {loading && <Spinner step={loadingStep} theme={t} />}

        {keywords.length > 0 && !loading && (
          <div style={{ ...s.card, marginTop: 20 }} className="nb-card">
            <div className="nb-sec-title" style={s.secTitle}>🔑 트렌드 키워드</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {keywords.map((kw, i) => <span key={i} style={s.kwTag}>#{kw}</span>)}
            </div>
          </div>
        )}

        {result && !loading && (
          <div style={{ background: COLORS.bg, borderRadius: 8, border: `1px solid ${COLORS.text}`, marginTop: 20, overflow: "hidden" }} className="nb-card-result">
            {/* Figma 디자인 시스템의 vibrant gradient — 유일한 컬러 요소 */}
            <div style={{ height: 8, background: GRADIENT }} />
            <div style={{ padding: 32 }}>
              <div className="nb-result-head" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, gap: 12 }}>
                <div style={{ fontFamily: FF_SANS, fontSize: 24, fontWeight: 700, letterSpacing: "-0.26px", lineHeight: 1.35, color: COLORS.text }}>✅ 완성된 포스팅</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: FF_MONO, fontSize: 10, fontWeight: 400, color: COLORS.text, background: COLORS.accentLight, padding: "5px 12px 6px", borderRadius: 50, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                    {result.length.toLocaleString()} CHAR
                  </span>
                  <button style={s.copyBtn} onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                    {copied ? "✓ COPIED" : "COPY TEXT"}
                  </button>
                  <button style={s.copyBtnDark} onClick={copyHTML}>
                    {htmlCopied ? "✓ COPIED" : "COPY HTML"}
                  </button>
                </div>
              </div>
              <div style={{ fontSize: 15, lineHeight: 1.9, whiteSpace: "pre-wrap", wordBreak: "break-word", fontWeight: 340, letterSpacing: "-0.14px", color: COLORS.text }}>{result}</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
