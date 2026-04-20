const STEPS = [
  { id: 1, label: "주제" },
  { id: 2, label: "후기" },
  { id: 3, label: "점검" },
  { id: 4, label: "설계" },
  { id: 5, label: "완성" },
];

/**
 * 5단계 진행 바 (horizontal).
 * current: 1~5
 * theme: 현재 테마 객체
 */
export default function Stepper({ current, theme }) {
  const barBg = theme?.pageBorder || "#E5E7EB";
  const activeColor = "#FFD43B";
  const mutedColor = theme?.pageMuted || "#6B7280";
  const textColor = theme?.pageText || "#111827";

  return (
    <div aria-label="진행 단계" style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "10px 2px 18px",
      width: "100%", overflow: "hidden",
    }}>
      {STEPS.map((s, idx) => {
        const done = s.id < current;
        const active = s.id === current;
        const dotColor = done ? activeColor : active ? activeColor : barBg;
        const dotText = active || done ? "#1F1F1F" : mutedColor;
        return (
          <div key={s.id} style={{ display: "flex", alignItems: "center", flex: idx === STEPS.length - 1 ? 0 : 1, minWidth: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 0 }}>
              <div
                aria-current={active ? "step" : undefined}
                style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: dotColor,
                  color: dotText,
                  fontSize: 11, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: active ? `2px solid ${activeColor}` : "none",
                  boxShadow: active ? "0 0 0 3px rgba(255,212,59,0.25)" : "none",
                  transition: "all 0.2s ease",
                }}
              >
                {done ? "✓" : s.id}
              </div>
              <div className="nb-stepper-label" style={{
                fontSize: 10, fontWeight: active ? 600 : 400,
                color: active || done ? textColor : mutedColor,
                letterSpacing: "-0.01em", whiteSpace: "nowrap",
              }}>{s.label}</div>
            </div>
            {idx < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 2, background: s.id < current ? activeColor : barBg,
                margin: "0 6px", marginTop: -14,
                transition: "background 0.3s ease",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
