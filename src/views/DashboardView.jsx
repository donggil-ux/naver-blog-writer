import { useEffect, useMemo, useState } from "react";
import TopicDonut from "../components/TopicDonut.jsx";
import TagCloud from "../components/TagCloud.jsx";
import { aggregateCategories, aggregateTags } from "../lib/history.js";

const CATEGORY_META = {
  food:    { label: "맛집",   color: "#FFD43B" },
  culture: { label: "문화",   color: "#A78BFA" },
  daily:   { label: "일상",   color: "#60D394" },
};

const FOCUS_KEY = "blog_writer_focus";

function loadFocus() {
  try {
    const raw = localStorage.getItem(FOCUS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

/**
 * 주제 집중도 대시보드 — 2차 기능 1.
 * props:
 *   history: 전체 history 배열 (normalizeEntry 처리된 상태)
 *   theme
 */
export default function DashboardView({ history = [], theme }) {
  const textColor = theme?.pageText || "#111827";
  const mutedColor = theme?.pageMuted || "#6B7280";
  const cardBg = theme?.cardBg || "#FFFFFF";
  const border = theme?.cardBorder || "#E5E7EB";

  const [focus, setFocus] = useState(() => loadFocus() || { category: null, tags: [] });
  useEffect(() => {
    localStorage.setItem(FOCUS_KEY, JSON.stringify(focus));
  }, [focus]);

  const published = history.filter(h => !h.isDraft);

  const categoryData = useMemo(() => {
    const freq = aggregateCategories(history);
    return [
      { id: "food",    label: CATEGORY_META.food.label,    count: freq.food,    color: CATEGORY_META.food.color },
      { id: "culture", label: CATEGORY_META.culture.label, count: freq.culture, color: CATEGORY_META.culture.color },
      { id: "daily",   label: CATEGORY_META.daily.label,   count: freq.daily,   color: CATEGORY_META.daily.color },
    ];
  }, [history]);

  const tagData = useMemo(() => aggregateTags(history), [history]);

  const topCategory = [...categoryData].sort((a, b) => b.count - a.count)[0];
  const topTag = tagData[0];

  const togglePickTag = (tag) => {
    setFocus(prev => {
      const has = prev.tags.includes(tag);
      const tags = has ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag].slice(0, 5);
      return { ...prev, tags };
    });
  };

  const pickCategory = (id) => {
    setFocus(prev => ({ ...prev, category: prev.category === id ? null : id }));
  };

  return (
    <div style={{ padding: "20px 16px 40px", maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 요약 카드 */}
      <div style={{
        background: cardBg, border: `1px solid ${border}`, borderRadius: 16,
        padding: "18px 20px",
      }}>
        <div style={{ fontSize: 13, color: mutedColor, marginBottom: 6 }}>주제 집중도</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: textColor, letterSpacing: "-0.01em" }}>
          지금까지 <span style={{ color: "#FFD43B" }}>{published.length}개</span> 작성
          {topCategory && topCategory.count > 0 && (
            <> · 가장 자주 쓴 주제: <span style={{ color: topCategory.color }}>{topCategory.label}</span></>
          )}
          {topTag && (
            <> · 대표 태그 <span style={{ fontWeight: 700 }}>#{topTag.tag}</span></>
          )}
        </div>
      </div>

      {/* 카테고리 도넛 */}
      <div style={{
        background: cardBg, border: `1px solid ${border}`, borderRadius: 16,
        padding: "20px 20px 24px",
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: textColor, marginBottom: 16 }}>
          📊 카테고리 분포
        </div>
        <TopicDonut data={categoryData} theme={theme} />
      </div>

      {/* 태그 클라우드 */}
      <div style={{
        background: cardBg, border: `1px solid ${border}`, borderRadius: 16,
        padding: "20px 20px 22px",
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: textColor, marginBottom: 12 }}>
          🏷️ 태그 클라우드
          <span style={{ fontSize: 11, fontWeight: 400, color: mutedColor, marginLeft: 8 }}>
            상위 20개 · 클릭 시 집중 주제에 추가
          </span>
        </div>
        <TagCloud tags={tagData} theme={theme} onPickTag={togglePickTag} />
      </div>

      {/* 집중 주제 설정 */}
      <div style={{
        background: cardBg, border: `1px solid ${border}`, borderRadius: 16,
        padding: "20px",
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: textColor, marginBottom: 8 }}>
          🎯 집중 주제 설정
        </div>
        <div style={{ fontSize: 12, color: mutedColor, marginBottom: 14, lineHeight: 1.6 }}>
          지정해 두면 다음 글 작성 시 롱테일 추천에 반영돼요. (카테고리 1개 + 태그 최대 5개)
        </div>

        {/* 카테고리 선택 */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {categoryData.map(c => {
            const active = focus.category === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => pickCategory(c.id)}
                style={{
                  padding: "6px 14px", borderRadius: 9999,
                  background: active ? c.color : "transparent",
                  color: active ? "#1F1F1F" : textColor,
                  border: `1px solid ${active ? c.color : border}`,
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  letterSpacing: "-0.01em",
                }}
              >{c.label}</button>
            );
          })}
        </div>

        {/* 선택된 태그 */}
        {focus.tags.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {focus.tags.map(t => (
              <span key={t} style={{
                padding: "4px 10px", borderRadius: 9999,
                background: "#FFD43B", color: "#1F1F1F",
                fontSize: 12, fontWeight: 600,
                display: "inline-flex", alignItems: "center", gap: 6,
              }}>
                #{t}
                <button
                  type="button"
                  onClick={() => togglePickTag(t)}
                  aria-label={`${t} 제거`}
                  style={{
                    width: 16, height: 16, borderRadius: "50%",
                    border: "none", background: "rgba(0,0,0,0.12)", color: "#1F1F1F",
                    fontSize: 10, lineHeight: "16px", padding: 0, cursor: "pointer",
                  }}
                >×</button>
              </span>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: mutedColor }}>
            위 태그 클라우드에서 태그를 눌러 추가해 보세요.
          </div>
        )}
      </div>
    </div>
  );
}
