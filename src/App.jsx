import { useState, useRef, useEffect, useCallback } from "react";

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

// Apple-inspired 디자인 시스템
const COLORS = {
  bg: "#ffffff",
  card: "#ffffff",
  accent: "#007AFF",
  accentLight: "rgba(0,122,255,0.08)",
  accentMid: "rgba(0,122,255,0.40)",
  text: "#1d1d1f",
  muted: "#86868b",
  border: "#d2d2d7",
  surfaceLight: "#f5f5f7",
  surfaceDark: "#1c1c1e",
  cardDark: "#2c2c2e",
};
const GRADIENT = "linear-gradient(135deg,#00e599 0%,#34d399 50%,#10b981 100%)";
const FF_SANS = "-apple-system,BlinkMacSystemFont,'SF Pro Display','Pretendard Variable','Pretendard',system-ui,sans-serif";
const FF_MONO = "'SF Mono','Menlo','Consolas',monospace";

const SHADOW_SM = "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)";
const SHADOW_MD = "0 4px 14px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)";
const SHADOW_LG = "0 8px 30px rgba(0,0,0,0.10), 0 4px 10px rgba(0,0,0,0.04)";

// 라이트/다크 테마 — 모든 색상 명시적 지정
const THEMES = {
  light: {
    pageBg: "#F3F4F6",
    pageText: "#111827",
    pageMuted: "#6B7280",
    pageBorder: "#E5E7EB",
    headerBg: "rgba(243,244,246,0.80)",
    headerBlur: "saturate(180%) blur(20px)",
    tabActiveBg: "#FFFFFF",
    tabActiveText: "#111827",
    tabBorder: "#E5E7EB",
    tabInactiveText: "#6B7280",
    cardBg: "#FFFFFF",
    cardBorder: "#E5E7EB",
    cardShadow: SHADOW_SM,
    inputBg: "#FFFFFF",
    inputText: "#111827",
    labelColor: "#374151",
    searchBtnBg: "#111827",
    searchBtnText: "#FFFFFF",
    receiptBg: "transparent",
    receiptBorder: "#9CA3AF",
    receiptText: "#374151",
    toggleBg: "#E5E7EB",
    logoBg: COLORS.accent,
    logoText: "#ffffff",
    focusOutline: COLORS.accent,
  },
  dark: {
    pageBg: "#111827",
    pageText: "#F9FAFB",
    pageMuted: "#9CA3AF",
    pageBorder: "#374151",
    headerBg: "rgba(17,24,39,0.85)",
    headerBlur: "saturate(180%) blur(20px)",
    tabActiveBg: "#374151",
    tabActiveText: "#F9FAFB",
    tabBorder: "#374151",
    tabInactiveText: "#9CA3AF",
    cardBg: "#1F2937",
    cardBorder: "#374151",
    cardShadow: "0 2px 10px rgba(0,0,0,0.3)",
    inputBg: "#1F2937",
    inputText: "#F3F4F6",
    labelColor: "#D1D5DB",
    searchBtnBg: "#4B5563",
    searchBtnText: "#F9FAFB",
    receiptBg: "#1F2937",
    receiptBorder: "#4B5563",
    receiptText: "#F9FAFB",
    toggleBg: "#374151",
    logoBg: COLORS.accent,
    logoText: "#ffffff",
    focusOutline: COLORS.accent,
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
  app: { minHeight: "100vh", background: COLORS.surfaceLight, fontFamily: FF_SANS, color: COLORS.text, WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale", letterSpacing: "-0.01em" },
  header: { background: "rgba(255,255,255,0.72)", backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)", borderBottom: `0.5px solid ${COLORS.border}`, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 },
  headerLeft: { display: "flex", alignItems: "center", gap: 12 },
  logo: { width: 34, height: 34, background: COLORS.accent, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: 15, fontWeight: 700, letterSpacing: "-0.5px", fontFamily: FF_SANS },
  body: { maxWidth: 680, margin: "0 auto", padding: "36px 20px 120px" },
  card: { background: COLORS.bg, borderRadius: 16, padding: 24, marginBottom: 12, border: "none", boxShadow: SHADOW_SM },
  secTitle: { fontFamily: FF_SANS, fontSize: 20, fontWeight: 700, color: COLORS.text, marginBottom: 20, display: "flex", alignItems: "center", gap: 8, letterSpacing: "-0.02em", lineHeight: 1.3 },
  label: { fontFamily: FF_SANS, fontSize: 13, color: COLORS.muted, marginBottom: 6, display: "block", letterSpacing: "-0.01em", fontWeight: 500 },
  input: { width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${COLORS.border}`, fontSize: 16, color: COLORS.text, background: COLORS.surfaceLight, outline: "none", boxSizing: "border-box", fontFamily: FF_SANS, fontWeight: 400, letterSpacing: "-0.01em", transition: "border-color 0.2s, box-shadow 0.2s" },
  textarea: { width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${COLORS.border}`, fontSize: 16, color: COLORS.text, background: COLORS.surfaceLight, outline: "none", resize: "vertical", minHeight: 100, boxSizing: "border-box", lineHeight: 1.55, fontFamily: FF_SANS, fontWeight: 400, letterSpacing: "-0.01em", transition: "border-color 0.2s, box-shadow 0.2s" },
  row: { display: "flex", gap: 12, marginBottom: 14 },
  col: { flex: 1 },
  genBtn: { width: "100%", padding: "16px 28px", borderRadius: 9999, background: "#00e599", color: "#000000", fontSize: 17, fontWeight: 600, border: "none", cursor: "pointer", marginTop: 16, fontFamily: FF_SANS, letterSpacing: "-0.02em", boxShadow: "0 2px 8px rgba(0,229,153,0.25)", transition: "transform 0.15s, box-shadow 0.15s" },
  copyBtn: { padding: "8px 16px", borderRadius: 20, background: COLORS.surfaceLight, color: COLORS.text, fontSize: 13, fontWeight: 500, border: `1px solid ${COLORS.border}`, cursor: "pointer", fontFamily: FF_SANS, letterSpacing: "-0.01em", transition: "background 0.15s" },
  copyBtnDark: { padding: "8px 16px", borderRadius: 20, background: COLORS.accent, color: "#ffffff", fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer", fontFamily: FF_SANS, letterSpacing: "-0.01em" },
  kwTag: { padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 500, fontFamily: FF_SANS, letterSpacing: "-0.01em" },
  photoThumb: { width: 80, height: 80, borderRadius: 12, objectFit: "cover", border: "none", boxShadow: SHADOW_SM },
  addPhoto: { width: 80, height: 80, borderRadius: 12, border: `1.5px dashed ${COLORS.border}`, background: COLORS.surfaceLight, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", color: COLORS.muted, fontSize: 11, gap: 3, fontFamily: FF_SANS, fontWeight: 500, transition: "background 0.15s" },
};

function Spinner({ step, theme }) {
  const pt = theme?.pageText || "#f5f5f7";
  const pm = theme?.pageMuted || "#86868b";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0", gap: 14, color: pm, fontSize: 14, fontFamily: FF_SANS }}>
      <div style={{ width: 28, height: 28, border: `3px solid rgba(0,122,255,0.2)`, borderTop: `3px solid #007AFF`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: pt, marginBottom: 4, letterSpacing: "-0.01em" }}>{step}</div>
        <div style={{ fontWeight: 400 }}>잠시만 기다려주세요</div>
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
  const receiptRef = useRef();
  const dragIdx = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [dragOver, setDragOver] = useState(null);

  // ── 임시저장 ──
  const [draftStatus, setDraftStatus] = useState("");
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const draftTimer = useRef(null);
  const draftSavedData = useRef(null);

  const saveDraft = useCallback(() => {
    const draft = { category, name, location, date, menus, target, memo, myStyle, savedAt: new Date().toISOString() };
    localStorage.setItem("blog_writer_draft", JSON.stringify(draft));
    const now = new Date();
    setDraftStatus(`임시저장 완료 · ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`);
  }, [category, name, location, date, menus, target, memo, myStyle]);

  // 디바운스 자동 저장
  useEffect(() => {
    if (!name && !memo && !menus) return; // 빈 폼이면 저장 안 함
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => saveDraft(), 1500);
    return () => { if (draftTimer.current) clearTimeout(draftTimer.current); };
  }, [category, name, location, date, menus, target, memo, saveDraft]);

  // 페이지 진입 시 저장된 draft 확인
  useEffect(() => {
    try {
      const raw = localStorage.getItem("blog_writer_draft");
      if (raw) {
        const d = JSON.parse(raw);
        if (d.name || d.memo || d.menus) {
          draftSavedData.current = d;
          setShowDraftBanner(true);
        }
      }
    } catch {}
  }, []);

  const restoreDraft = () => {
    const d = draftSavedData.current;
    if (!d) return;
    setCategory(d.category || "food");
    setName(d.name || ""); setLocation(d.location || ""); setDate(d.date || "");
    setMenus(d.menus || ""); setTarget(d.target || ""); setMemo(d.memo || "");
    if (d.myStyle !== undefined) setMyStyle(d.myStyle);
    setShowDraftBanner(false);
  };
  const dismissDraft = () => { setShowDraftBanner(false); localStorage.removeItem("blog_writer_draft"); };
  const clearDraft = () => { localStorage.removeItem("blog_writer_draft"); setDraftStatus(""); };

  // ── 생성 내역 ──
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("blog_writer_history") || "[]"); } catch { return []; }
  });
  const [showHistory, setShowHistory] = useState(false);
  const [historyDetail, setHistoryDetail] = useState(null);
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2000); };

  const saveHistory = (content) => {
    const entry = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      category,
      title: name,
      content,
      formData: { category, name, location, date, menus, target, memo, myStyle },
    };
    const updated = [entry, ...history].slice(0, 50);
    setHistory(updated);
    localStorage.setItem("blog_writer_history", JSON.stringify(updated));
  };

  const deleteHistory = (id) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem("blog_writer_history", JSON.stringify(updated));
    setHistoryDetail(null);
    showToast("삭제됨");
  };

  // ESC 키로 패널/모달 닫기
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (historyDetail) setHistoryDetail(null);
        else if (showHistory) setShowHistory(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showHistory, historyDetail]);

  const restoreFromHistory = (entry) => {
    const d = entry.formData;
    setCategory(d.category || "food");
    setName(d.name || ""); setLocation(d.location || ""); setDate(d.date || "");
    setMenus(d.menus || ""); setTarget(d.target || ""); setMemo(d.memo || "");
    if (d.myStyle !== undefined) setMyStyle(d.myStyle);
    setResult(null); setKeywords([]); setStoreInfo(null);
    setHistoryDetail(null); setShowHistory(false);
    showToast("폼 불러오기 완료");
  };

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

  // 영수증 사진 → Gemini Vision → 메뉴/가격 자동 추출
  const scanReceipt = (file) => {
    if (!file) return;
    setScanning(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result.split(",")[1];
        const mimeType = file.type || "image/jpeg";
        const text = await callGemini({
          model: "gemini-2.5-flash",
          contents: [{
            role: "user",
            parts: [
              { text: '이 영수증/메뉴판 사진에서 메뉴명과 가격을 추출해서 "메뉴명 가격원, 메뉴명 가격원" 형식의 한 줄 텍스트로만 반환해. 마크다운이나 설명 없이 결과만.' },
              { inlineData: { mimeType, data: base64 } },
            ],
          }],
          generationConfig: { maxOutputTokens: 500, temperature: 0.2 },
        });
        if (text.trim()) {
          setMenus(text.trim());
        } else {
          alert("메뉴/가격을 인식하지 못했어요. 직접 입력해주세요.");
        }
      } catch (e) {
        alert(`영수증 인식 실패: ${e.message}`);
      } finally {
        setScanning(false);
        if (receiptRef.current) receiptRef.current.value = "";
      }
    };
    reader.readAsDataURL(file);
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
      saveHistory(text);
      clearDraft();
    } catch (e) { console.error(e); alert(`오류: ${e.message}`); }
    finally { setLoading(false); setLoadingStep(""); }
  };

  const fc = FIELD_CONFIG[category];
  const cat = CATEGORIES.find(c => c.id === category);

  return (
    <div style={{ ...s.app, background: t.pageBg, color: t.pageText }} className={`nb-root theme-${theme}`} data-theme={theme}>
      <style>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.min.css');
        *{box-sizing:border-box;margin:0;padding:0}
        html,body{margin:0;padding:0}
        input,textarea,button,select{font-family:inherit}
        button{-webkit-tap-highlight-color:transparent;cursor:pointer;transition:transform 0.12s,opacity 0.12s}
        button:active{transform:scale(0.97)}
        /* Apple-style focus ring */
        input:focus,textarea:focus{outline:none;border-color:#007AFF!important;box-shadow:0 0 0 3px rgba(0,122,255,0.25)!important}
        button:focus-visible{outline:none;box-shadow:0 0 0 3px rgba(0,122,255,0.35)}
        input[type="date"]{min-height:46px;appearance:none;-webkit-appearance:none}
        input[type="date"]::-webkit-calendar-picker-indicator{cursor:pointer;opacity:0.5;padding:0}
        input[type="date"]::-webkit-calendar-picker-indicator:hover{opacity:1}
        input[type="date"]::-webkit-date-and-time-value{text-align:left}
        input[type="date"]::-webkit-datetime-edit{padding:0}
        input,textarea{font-size:16px;transition:border-color 0.2s,box-shadow 0.2s}
        @keyframes spin{to{transform:rotate(360deg)}}

        /* 모바일 (≤480px) */
        @media (max-width:480px){
          .nb-header{padding:12px 16px!important}
          .nb-header-sub{display:none!important}
          .nb-body{padding:24px 16px 90px!important}
          .nb-card{padding:18px!important;border-radius:14px!important}
          .nb-tab{padding:9px 16px!important;font-size:14px!important}
          .nb-gen{padding:15px 20px!important;font-size:16px!important;border-radius:12px!important}
          .nb-photo,.nb-addphoto{width:72px!important;height:72px!important}
          .nb-hero-title{font-size:28px!important}
          .nb-result-head{flex-wrap:wrap!important;gap:8px!important}
          .nb-sec-title{font-size:18px!important}
        }
        /* 태블릿 / 아이패드 (481~900px) */
        @media (min-width:481px) and (max-width:900px){
          .nb-body{max-width:640px!important;padding:40px 24px 120px!important}
          .nb-card{padding:28px!important}
          .nb-photo,.nb-addphoto{width:88px!important;height:88px!important}
        }
        /* 데스크톱 (≥901px) */
        @media (min-width:901px){
          .nb-body{max-width:720px!important;padding:48px 28px 140px!important}
          .nb-photo,.nb-addphoto{width:96px!important;height:96px!important}
        }
        /* FAB: 모바일/태블릿 표시, 데스크톱만 숨김 */
        .nb-fab{display:flex!important;align-items:center;justify-content:center}
        @media (min-width:901px){
          .nb-fab{display:none!important}
        }
        @media (max-width:900px){
          .nb-history-btn{display:none!important}
          /* 사이드 패널 → bottom sheet */
          .nb-history-panel{top:auto!important;right:0!important;left:0!important;bottom:0!important;width:100%!important;height:min(70vh,calc(100vh - 60px))!important;border-radius:20px 20px 0 0!important}
          .nb-toast{bottom:100px!important}
        }
        /* 라이트 모드 — 카드/인풋 */
        .theme-light .nb-card{background:#FFFFFF!important;border:1px solid #E5E7EB!important}
        .theme-light ::placeholder{color:#9CA3AF!important}
        .theme-light .nb-sec-title{color:#111827!important}
        .theme-light label{color:#374151!important}
        .theme-dark label{color:#D1D5DB!important}
        /* 다크 모드 — 카드/인풋 */
        .theme-dark .nb-card{background:#1F2937!important;border:1px solid #374151!important;box-shadow:0 2px 10px rgba(0,0,0,0.3)!important}
        .theme-dark input,.theme-dark textarea{background:#1F2937!important;border-color:#374151!important;color:#F3F4F6!important}
        .theme-dark input:focus,.theme-dark textarea:focus{border-color:#007AFF!important;box-shadow:0 0 0 3px rgba(0,122,255,0.3)!important}
        .theme-dark ::placeholder{color:#6B7280!important}
        .theme-dark .nb-sec-title{color:#F9FAFB!important}
        .theme-dark .nb-card-result{background:#1F2937!important;border-color:#374151!important}
      `}</style>

      <div style={{ ...s.header, background: t.headerBg, backdropFilter: t.headerBlur, WebkitBackdropFilter: t.headerBlur, borderBottom: `0.5px solid ${t.pageBorder}` }} className="nb-header">
        <div style={s.headerLeft}>
          <div style={s.logo}>N</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.15, color: t.pageText }}>블로그 AI 작성기</div>
            <div className="nb-header-sub" style={{ fontSize: 12, color: t.pageMuted, marginTop: 2, fontWeight: 400 }}>네이버 블로그 포스팅 자동 생성</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {draftStatus && <span className="nb-header-sub" style={{ fontSize: 11, color: t.pageMuted, fontWeight: 400 }}>{draftStatus}</span>}
          <button className="nb-history-btn" onClick={() => setShowHistory(true)} aria-label="내역" title="생성 내역" style={{
            width: 34, height: 34, borderRadius: 10,
            background: t.toggleBg, border: "none", color: t.pageText, cursor: "pointer",
            fontSize: 15, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative",
          }}>
            📋
            {history.length > 0 && <span style={{ position: "absolute", top: -2, right: -2, width: 16, height: 16, borderRadius: "50%", background: COLORS.accent, color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{history.length}</span>}
          </button>
          <button onClick={toggleTheme} aria-label="Toggle theme" title={theme === "dark" ? "라이트 모드" : "다크 모드"} style={{
            width: 34, height: 34, borderRadius: 10,
            background: t.toggleBg, border: "none", color: t.pageText, cursor: "pointer",
            fontSize: 16, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center",
          }}>{theme === "dark" ? "☀️" : "🌙"}</button>
        </div>
      </div>

      <div style={s.body} className="nb-body">

        {/* 임시저장 복원 배너 */}
        {showDraftBanner && (
          <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 14, padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, boxShadow: SHADOW_SM }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: t.pageText }}>작성 중이던 내용이 있어요. 이어서 작성할까요?</div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button onClick={restoreDraft} style={{ padding: "8px 16px", borderRadius: 10, background: COLORS.accent, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>불러오기</button>
              <button onClick={dismissDraft} style={{ padding: "8px 16px", borderRadius: 10, background: t.toggleBg, color: t.pageText, border: `1px solid ${t.pageBorder}`, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>새로 작성</button>
            </div>
          </div>
        )}

        {/* Hero 타이틀 */}
        <div style={{ marginBottom: 28 }}>
          <div className="nb-hero-title" style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.03em", fontFamily: FF_SANS, color: t.pageText }}>
            어떤 글을 작성할까요?
          </div>
        </div>

        {/* 카테고리 탭 — Apple Segmented Control 스타일 */}
        <div style={{ display: "flex", gap: 0, marginBottom: 28, background: theme === "dark" ? "#1F2937" : "#E5E7EB", borderRadius: 12, padding: 3 }}>
          {CATEGORIES.map(c => {
            const active = category === c.id;
            return (
              <button key={c.id} onClick={() => resetForm(c.id)} className="nb-tab" style={{
                flex: 1, padding: "10px 8px", borderRadius: 10,
                border: "none",
                background: active ? t.tabActiveBg : "transparent",
                color: active ? t.tabActiveText : t.tabInactiveText,
                boxShadow: active ? "0 1px 4px rgba(0,0,0,0.15)" : "none",
                fontWeight: active ? 600 : 400, fontSize: 14, fontFamily: FF_SANS, letterSpacing: "-0.01em",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                transition: "all 0.2s ease",
              }}>
                <span style={{ fontSize: 14 }}>{c.emoji}</span>
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
                background: searching || !name.trim() ? t.pageBorder : t.searchBtnBg,
                color: searching || !name.trim() ? t.pageMuted : t.searchBtnText,
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
            <div style={{ padding: "16px 18px", background: t.toggleBg, borderRadius: 8, marginBottom: 14, fontSize: 13, lineHeight: 1.75, color: t.pageText, fontWeight: 400, letterSpacing: "-0.01em" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: t.pageMuted, marginBottom: 8 }}>✓ 검색 결과 (자동 입력됨)</div>
              {storeInfo.location && <div>📍 {storeInfo.location}</div>}
              {storeInfo.phone && <div>📞 {storeInfo.phone}</div>}
              {storeInfo.summary && <div style={{ color: t.pageMuted }}>📂 {storeInfo.summary}</div>}
              {storeInfo.menus?.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: t.pageMuted, marginBottom: 8 }}>💡 블로그 추천 메뉴 (클릭 시 자동 입력)</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {storeInfo.menus.map((m, i) => (
                      <button key={i} onClick={() => setMenus(m)} style={{
                        padding: "6px 14px 8px", borderRadius: 50,
                        background: t.cardBg, border: `1px solid ${t.pageBorder}`,
                        color: t.pageText, fontSize: 12, fontWeight: 480,
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
            <button onClick={() => receiptRef.current?.click()} disabled={scanning} style={{
              marginTop: 16, padding: "12px 24px 14px", borderRadius: 50, border: `2px solid ${t.receiptBorder}`,
              background: t.receiptBg, color: t.receiptText, width: "100%",
              fontSize: 14, fontWeight: 480, cursor: scanning ? "not-allowed" : "pointer",
              fontFamily: FF_SANS, letterSpacing: "-0.14px",
              opacity: scanning ? 0.6 : 1,
            }}>{scanning ? "📷 영수증 스캔중..." : "📷 영수증 촬영으로 메뉴 자동 입력"}</button>
            <input ref={receiptRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }}
              onChange={e => { if (e.target.files?.[0]) scanReceipt(e.target.files[0]); }} />
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
          <div style={{ textAlign: "right", fontFamily: FF_MONO, fontSize: 10, letterSpacing: "0.5px", color: memo.length > 0 ? t.pageText : t.pageMuted, marginTop: 8, textTransform: "uppercase" }}>
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
            <button onClick={() => setShowStyle(!showStyle)} style={{
              padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500,
              background: t.toggleBg, color: t.pageText,
              border: `1px solid ${t.pageBorder}`, cursor: "pointer",
              fontFamily: FF_SANS, letterSpacing: "-0.01em",
            }}>
              {showStyle ? "접기" : "펼치기"}
            </button>
          </div>
          {showStyle && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 12 }}>
                <div style={{ fontSize: 13, color: t.pageMuted, fontWeight: 400, letterSpacing: "-0.01em" }}>포스팅 작성 시 이 스타일을 자동 반영해요 · 자유롭게 수정 가능</div>
                {myStyle !== DEFAULT_MY_STYLE && (
                  <button onClick={() => setMyStyle(DEFAULT_MY_STYLE)} style={{
                    padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500,
                    background: t.toggleBg, color: t.pageText,
                    border: `1px solid ${t.pageBorder}`, cursor: "pointer",
                    fontFamily: FF_SANS, whiteSpace: "nowrap",
                  }}>초기화</button>
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
              {keywords.map((kw, i) => <span key={i} style={{ ...s.kwTag, background: t.toggleBg, color: t.pageText }}>#{kw}</span>)}
            </div>
          </div>
        )}

        {result && !loading && (
          <div style={{ background: t.cardBg, borderRadius: 16, border: `1px solid ${t.cardBorder}`, marginTop: 20, overflow: "hidden", boxShadow: t.cardShadow }} className="nb-card nb-card-result">
            <div style={{ height: 4, background: GRADIENT }} />
            <div style={{ padding: 24 }}>
              <div className="nb-result-head" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, gap: 12 }}>
                <div style={{ fontFamily: FF_SANS, fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.35, color: t.pageText }}>✅ 완성된 포스팅</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: FF_MONO, fontSize: 10, fontWeight: 500, color: t.pageMuted, background: t.toggleBg, padding: "5px 12px 6px", borderRadius: 50, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                    {result.length.toLocaleString()} CHAR
                  </span>
                  <button style={{ padding: "8px 16px", borderRadius: 20, background: t.toggleBg, color: t.pageText, fontSize: 13, fontWeight: 500, border: `1px solid ${t.pageBorder}`, cursor: "pointer", fontFamily: FF_SANS }} onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                    {copied ? "✓ 복사됨" : "텍스트 복사"}
                  </button>
                  <button style={{ padding: "8px 16px", borderRadius: 20, background: COLORS.accent, color: "#ffffff", fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer", fontFamily: FF_SANS }} onClick={copyHTML}>
                    {htmlCopied ? "✓ 복사됨" : "HTML 복사"}
                  </button>
                </div>
              </div>
              <div style={{ fontSize: 15, lineHeight: 1.9, whiteSpace: "pre-wrap", wordBreak: "break-word", fontWeight: 400, letterSpacing: "-0.01em", color: t.pageText }}>{result}</div>
            </div>
          </div>
        )}

      </div>

      {/* ── 생성 내역 사이드 패널 ── */}
      {showHistory && (
        <>
          <div onClick={() => { setShowHistory(false); setHistoryDetail(null); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, transition: "opacity 0.2s" }} />
          <div className="nb-history-panel" style={{
            position: "fixed", top: 0, right: 0, bottom: 0, width: "min(360px, 85vw)",
            background: t.cardBg, zIndex: 101, overflowY: "auto",
            boxShadow: "-8px 0 30px rgba(0,0,0,0.15)", padding: "20px 16px",
            display: "flex", flexDirection: "column",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: t.pageText }}>생성 내역</div>
              <button onClick={() => { setShowHistory(false); setHistoryDetail(null); }} style={{
                width: 32, height: 32, borderRadius: 8, background: t.toggleBg, border: "none",
                color: t.pageText, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}>✕</button>
            </div>
            {history.length === 0 ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: t.pageMuted }}>
                <span style={{ fontSize: 40 }}>📝</span>
                <span style={{ fontSize: 14, fontWeight: 500 }}>아직 생성한 포스팅이 없어요</span>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {history.map(h => {
                  const catObj = CATEGORIES.find(c => c.id === h.category);
                  const dt = new Date(h.createdAt);
                  const dateStr = `${dt.getFullYear()}.${String(dt.getMonth()+1).padStart(2,"0")}.${String(dt.getDate()).padStart(2,"0")} ${String(dt.getHours()).padStart(2,"0")}:${String(dt.getMinutes()).padStart(2,"0")}`;
                  const preview = (h.content || "").replace(/\n/g, " ").slice(0, 80);
                  return (
                    <button key={h.id} onClick={() => setHistoryDetail(h)} style={{
                      background: t.toggleBg, border: `1px solid ${t.pageBorder}`, borderRadius: 12,
                      padding: "14px 16px", textAlign: "left", cursor: "pointer",
                      display: "flex", flexDirection: "column", gap: 6, width: "100%",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, background: COLORS.accent, color: "#fff", padding: "2px 8px", borderRadius: 6 }}>{catObj?.emoji} {catObj?.label || h.category}</span>
                        <span style={{ fontSize: 11, color: t.pageMuted }}>{dateStr}</span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: t.pageText, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.title}</div>
                      <div style={{ fontSize: 12, color: t.pageMuted, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: 1.4 }}>{preview}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── 내역 상세 모달 ── */}
      {historyDetail && (
        <>
          <div onClick={() => setHistoryDetail(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200 }} />
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            width: "min(560px, 90vw)", maxHeight: "85vh", overflowY: "auto",
            background: t.cardBg, borderRadius: 20, padding: 28, zIndex: 201,
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: t.pageText, marginBottom: 4 }}>{historyDetail.title}</div>
                <div style={{ fontSize: 12, color: t.pageMuted }}>
                  {(() => { const dt = new Date(historyDetail.createdAt); return `${dt.getFullYear()}.${String(dt.getMonth()+1).padStart(2,"0")}.${String(dt.getDate()).padStart(2,"0")} ${String(dt.getHours()).padStart(2,"0")}:${String(dt.getMinutes()).padStart(2,"0")}`; })()}
                </div>
              </div>
              <button onClick={() => setHistoryDetail(null)} style={{
                width: 32, height: 32, borderRadius: 8, background: t.toggleBg, border: "none",
                color: t.pageText, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}>✕</button>
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.8, whiteSpace: "pre-wrap", wordBreak: "break-word", color: t.pageText, marginBottom: 24, maxHeight: "50vh", overflowY: "auto", padding: 16, background: t.toggleBg, borderRadius: 12 }}>
              {historyDetail.content}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={() => { navigator.clipboard.writeText(historyDetail.content); showToast("복사됨!"); }} style={{
                flex: 1, padding: "12px 16px", borderRadius: 12, background: COLORS.accent, color: "#fff",
                border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}>복사하기</button>
              <button onClick={() => restoreFromHistory(historyDetail)} style={{
                flex: 1, padding: "12px 16px", borderRadius: 12, background: t.toggleBg, color: t.pageText,
                border: `1px solid ${t.pageBorder}`, fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}>폼 불러오기</button>
              <button onClick={() => deleteHistory(historyDetail.id)} style={{
                padding: "12px 16px", borderRadius: 12, background: "transparent", color: "#EF4444",
                border: "1px solid #EF4444", fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}>삭제</button>
            </div>
          </div>
        </>
      )}

      {/* ── FAB (모바일 전용) ── */}
      <button className="nb-fab" onClick={() => setShowHistory(true)} aria-label="생성 내역" style={{
        position: "fixed", bottom: 24, right: 20, width: 52, height: 52, borderRadius: 16,
        background: COLORS.accent, color: "#fff", border: "none", cursor: "pointer",
        fontSize: 20, zIndex: 90,
        boxShadow: "0 4px 16px rgba(0,122,255,0.35)",
      }}>
        📋
        {history.length > 0 && <span style={{ position: "absolute", top: -4, right: -4, width: 20, height: 20, borderRadius: "50%", background: "#EF4444", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{history.length}</span>}
      </button>

      {/* ── 토스트 ── */}
      {toast && (
        <div className="nb-toast" style={{
          position: "fixed", bottom: 40, left: "50%", transform: "translateX(-50%)",
          background: t.pageText, color: t.pageBg, padding: "12px 24px", borderRadius: 12,
          fontSize: 14, fontWeight: 600, zIndex: 300, boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        }}>{toast}</div>
      )}
    </div>
  );
}
