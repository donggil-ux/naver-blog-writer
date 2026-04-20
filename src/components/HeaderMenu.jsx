import { useEffect, useRef, useState } from "react";

/**
 * 우측 상단 햄버거 메뉴 — 뷰 전환 (작성하기 / 대시보드 / 스케줄).
 * props:
 *   view: 현재 뷰 id
 *   onChange: (next) => void
 *   theme: 테마 객체
 */
const ITEMS = [
  { id: "writer",    icon: "✏️", label: "작성하기" },
  { id: "dashboard", icon: "📊", label: "주제 집중도" },
  { id: "schedule",  icon: "📅", label: "발행 스케줄" },
];

export default function HeaderMenu({ view, onChange, theme }) {
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

  const handlePick = (id) => {
    setOpen(false);
    if (id !== view) onChange(id);
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
            minWidth: 180, background: cardBg, border: `1px solid ${border}`,
            borderRadius: 12, padding: 6,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          }}
        >
          {ITEMS.map(item => {
            const active = item.id === view;
            return (
              <button
                key={item.id}
                role="menuitem"
                type="button"
                onClick={() => handlePick(item.id)}
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
        </div>
      )}
    </div>
  );
}
