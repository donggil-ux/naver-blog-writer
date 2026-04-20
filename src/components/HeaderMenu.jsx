import { useEffect, useRef, useState } from "react";

/**
 * 우측 상단 햄버거 메뉴 — 뷰 전환 + 생성 내역 + 테마 전환.
 * props:
 *   view: 현재 뷰 id
 *   onChange: (next) => void
 *   onOpenHistory: () => void
 *   historyCount: number
 *   theme: 테마 객체
 *   themeMode: "light" | "dark"
 *   onToggleTheme: () => void
 */
const VIEW_ITEMS = [
  { id: "writer",    icon: "✏️", label: "작성하기" },
  { id: "dashboard", icon: "📊", label: "주제 집중도" },
  { id: "schedule",  icon: "📅", label: "발행 스케줄" },
];

export default function HeaderMenu({ view, onChange, onOpenHistory, historyCount = 0, theme, themeMode, onToggleTheme }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const textColor = theme?.pageText || "#111827";
  const mutedColor = theme?.pageMuted || "#6B7280";
  const toggleBg = theme?.toggleBg || "#F3F4F6";
  const cardBg = theme?.cardBg || "#FFFFFF";
  const border = theme?.pageBorder || "#E5E7EB";

  // ESC / 외부 클릭으로 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  const handlePickView = (id) => {
    setOpen(false);
    if (id !== view) onChange(id);
  };

  const handleHistory = () => {
    setOpen(false);
    onOpenHistory?.();
  };

  const handleTheme = () => {
    // 테마는 닫지 않고 바로 토글
    onToggleTheme?.();
  };

  return (
    <div ref={wrapRef} style={{ position: "relative", display: "inline-flex" }}>
      <button
        type="button"
        aria-label="메뉴"
        aria-expanded={open}
        aria-haspopup="menu"
        title="메뉴"
        onClick={() => setOpen(o => !o)}
        style={{
          width: 34, height: 34, borderRadius: 10,
          background: toggleBg, border: "none", color: textColor, cursor: "pointer",
          fontSize: 16, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >☰</button>

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 50,
            minWidth: 190, background: cardBg, border: `1px solid ${border}`,
            borderRadius: 12, padding: 6,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          }}
        >
          {/* 뷰 전환 */}
          {VIEW_ITEMS.map(item => {
            const active = item.id === view;
            return (
              <button
                key={item.id}
                role="menuitem"
                type="button"
                onClick={() => handlePickView(item.id)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: 8,
                  background: active ? toggleBg : "transparent",
                  color: active ? textColor : mutedColor,
                  border: "none", cursor: "pointer", textAlign: "left",
                  fontSize: 13, fontWeight: active ? 600 : 500,
                  letterSpacing: "-0.01em",
                }}
              >
                <span style={{ fontSize: 15, lineHeight: 1 }}>{item.icon}</span>
                <span>{item.label}</span>
                {active && <span style={{ marginLeft: "auto", fontSize: 11, color: "#0F9960" }}>●</span>}
              </button>
            );
          })}

          {/* 구분선 */}
          <div style={{ height: 1, background: border, margin: "4px 6px" }} />

          {/* 생성 내역 */}
          <button
            role="menuitem"
            type="button"
            onClick={handleHistory}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 8,
              background: "transparent", color: mutedColor,
              border: "none", cursor: "pointer", textAlign: "left",
              fontSize: 13, fontWeight: 500, letterSpacing: "-0.01em",
            }}
          >
            <span style={{ fontSize: 15, lineHeight: 1 }}>📋</span>
            <span>생성 내역</span>
            {historyCount > 0 && (
              <span style={{
                marginLeft: "auto",
                minWidth: 18, height: 18, borderRadius: 9,
                background: "#FFD43B", color: "#1F1F1F",
                fontSize: 10, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "0 5px",
              }}>
                {historyCount}
              </span>
            )}
          </button>

          {/* 테마 전환 */}
          <button
            role="menuitem"
            type="button"
            onClick={handleTheme}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 8,
              background: "transparent", color: mutedColor,
              border: "none", cursor: "pointer", textAlign: "left",
              fontSize: 13, fontWeight: 500, letterSpacing: "-0.01em",
            }}
          >
            <span style={{ fontSize: 15, lineHeight: 1 }}>{themeMode === "dark" ? "☀️" : "🌙"}</span>
            <span>{themeMode === "dark" ? "라이트 모드" : "다크 모드"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
