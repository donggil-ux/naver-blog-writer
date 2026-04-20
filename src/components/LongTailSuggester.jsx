import { useState } from "react";
import { buildLongTailCandidates } from "../lib/longTail.js";
import { totalToLevel, LEVEL_BADGE, formatTotal } from "../lib/competition.js";

/**
 * 롱테일 키워드 추천 — 2차 기능 3.
 * props:
 *   mainKeyword, category, location, companion (폼 상태)
 *   subKeywords, onReplaceMain(query), onAddSub(query) (핸들러)
 *   theme
 */
export default function LongTailSuggester({
  mainKeyword, category, location, companion,
  subKeywords = [], onReplaceMain, onAddSub,
  theme,
}) {
  const [list, setList] = useState([]);   // [{ query, total, level }]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const textColor = theme?.pageText || "#111827";
  const mutedColor = theme?.pageMuted || "#6B7280";
  const cardBg = theme?.cardBg || "#FFFFFF";
  const border = theme?.pageBorder || "#E5E7EB";
  const toggleBg = theme?.toggleBg || "#F3F4F6";

  const canRun = !!(mainKeyword && mainKeyword.trim());
  const alreadyHasSub = (q) => subKeywords.includes(q);
  const subLimitReached = subKeywords.length >= 4;

  const fetchOne = async (query) => {
    try {
      const res = await fetch(`/api/naver-blog?query=${encodeURIComponent(query)}`);
      if (!res.ok) return { query, total: null, level: "unknown" };
      const data = await res.json();
      const total = typeof data.total === "number" ? data.total : null;
      return { query, total, level: totalToLevel(total) };
    } catch {
      return { query, total: null, level: "unknown" };
    }
  };

  const handleFind = async () => {
    if (!canRun) return;
    setError("");
    const candidates = buildLongTailCandidates({
      mainKeyword, category, location, companion,
    });
    if (candidates.length === 0) {
      setError("변형을 만들 수 없어요.");
      return;
    }
    setLoading(true);
    // 초기 플레이스홀더 (확인중 상태)
    setList(candidates.map(q => ({ query: q, total: null, level: "unknown" })));
    // 앞 3개 먼저, 나머지 점진 로드 (네이버 API rate 보호 + UX)
    const head = candidates.slice(0, 3);
    const tail = candidates.slice(3);
    const headRes = await Promise.all(head.map(fetchOne));
    setList(prev => prev.map(it => headRes.find(r => r.query === it.query) || it));
    for (const q of tail) {
      // eslint-disable-next-line no-await-in-loop
      const r = await fetchOne(q);
      setList(prev => prev.map(it => it.query === r.query ? r : it));
    }
    setLoading(false);
  };

  return (
    <div style={{
      background: cardBg,
      border: `1px solid ${border}`,
      borderRadius: 12,
      padding: "14px 16px",
      marginTop: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: textColor, letterSpacing: "-0.01em" }}>
          🔍 롱테일 키워드 찾기
        </span>
        <button
          type="button"
          onClick={handleFind}
          disabled={!canRun || loading}
          style={{
            marginLeft: "auto",
            padding: "6px 12px", borderRadius: 8,
            background: canRun ? "#FFD43B" : toggleBg,
            color: canRun ? "#1F1F1F" : mutedColor,
            border: "none",
            fontSize: 12, fontWeight: 600, cursor: canRun && !loading ? "pointer" : "not-allowed",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "조회 중..." : list.length > 0 ? "다시 찾기" : "롱테일 찾기"}
        </button>
      </div>

      {!canRun && (
        <div style={{ fontSize: 11, color: mutedColor }}>
          메인 키워드를 먼저 입력해 주세요.
        </div>
      )}

      {error && (
        <div style={{ fontSize: 11, color: "#FA5252" }}>{error}</div>
      )}

      {list.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {list.map(item => {
            const badge = LEVEL_BADGE[item.level];
            const isCurrentMain = item.query === (mainKeyword || "").trim();
            return (
              <div key={item.query} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 10px", borderRadius: 8,
                background: toggleBg,
              }}>
                <span style={{ fontSize: 14, lineHeight: 1 }}>{badge.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: textColor, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.query}
                </span>
                <span style={{ fontSize: 11, color: mutedColor, minWidth: 50, textAlign: "right" }}>
                  {item.total != null ? `${formatTotal(item.total)}건` : "..."}
                </span>
                <button
                  type="button"
                  onClick={() => onReplaceMain?.(item.query)}
                  disabled={isCurrentMain}
                  title="메인 키워드로 교체"
                  style={{
                    padding: "4px 8px", borderRadius: 6,
                    background: isCurrentMain ? toggleBg : "#FFD43B",
                    color: isCurrentMain ? mutedColor : "#1F1F1F",
                    border: "none",
                    fontSize: 10, fontWeight: 600,
                    cursor: isCurrentMain ? "not-allowed" : "pointer",
                    whiteSpace: "nowrap",
                  }}
                >메인 교체</button>
                <button
                  type="button"
                  onClick={() => onAddSub?.(item.query)}
                  disabled={alreadyHasSub(item.query) || subLimitReached}
                  title={subLimitReached ? "서브 키워드 4개 제한" : alreadyHasSub(item.query) ? "이미 추가됨" : "서브 키워드로 추가"}
                  style={{
                    padding: "4px 8px", borderRadius: 6,
                    background: "transparent",
                    color: alreadyHasSub(item.query) || subLimitReached ? mutedColor : textColor,
                    border: `1px solid ${border}`,
                    fontSize: 10, fontWeight: 600,
                    cursor: alreadyHasSub(item.query) || subLimitReached ? "not-allowed" : "pointer",
                    whiteSpace: "nowrap",
                  }}
                >{alreadyHasSub(item.query) ? "추가됨" : "서브 +"}</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
