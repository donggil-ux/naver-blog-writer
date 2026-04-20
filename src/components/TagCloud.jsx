/**
 * 태그 클라우드 — 빈도 기반 폰트 크기 조절.
 * props:
 *   tags: [{ tag, count }]
 *   max (default 20)
 *   theme
 *   onPickTag?: (tag) => void  (클릭 시 콜백; 대시보드에서 집중 주제 등록에 사용)
 */
export default function TagCloud({ tags = [], max = 20, theme, onPickTag }) {
  const textColor = theme?.pageText || "#111827";
  const mutedColor = theme?.pageMuted || "#6B7280";
  const toggleBg = theme?.toggleBg || "#F3F4F6";

  const top = tags.slice(0, max);
  if (top.length === 0) {
    return (
      <div style={{ color: mutedColor, fontSize: 13, padding: "20px 0", textAlign: "center" }}>
        아직 태그가 모이지 않았어요. 글을 몇 편 더 작성해 보세요.
      </div>
    );
  }

  const maxCount = top[0].count || 1;

  return (
    <div style={{
      display: "flex", flexWrap: "wrap", gap: 8,
      padding: "4px 0",
      lineHeight: 1.3,
    }}>
      {top.map(({ tag, count }) => {
        const scale = Math.min(1, count / maxCount);
        const fontSize = Math.round(12 + scale * 14); // 12~26
        const weight = count >= Math.ceil(maxCount * 0.66) ? 700 : count >= Math.ceil(maxCount * 0.33) ? 600 : 500;
        return (
          <button
            key={tag}
            type="button"
            onClick={() => onPickTag?.(tag)}
            title={`${count}회`}
            style={{
              padding: "4px 10px", borderRadius: 9999,
              background: toggleBg, color: textColor,
              border: "none", cursor: onPickTag ? "pointer" : "default",
              fontSize, fontWeight: weight, letterSpacing: "-0.01em",
            }}
          >
            #{tag}
            <span style={{ marginLeft: 4, fontSize: Math.max(10, fontSize - 4), color: mutedColor, fontWeight: 400 }}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
