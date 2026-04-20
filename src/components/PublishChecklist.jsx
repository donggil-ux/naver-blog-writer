import { useState } from "react";

/**
 * 발행 전 체크리스트 — 결과 카드 상단에 표시.
 * report: seoChecklist() 반환값
 * theme: 현재 테마
 */
export default function PublishChecklist({ report, theme }) {
  const [open, setOpen] = useState(true);
  const textColor = theme?.pageText || "#111827";
  const mutedColor = theme?.pageMuted || "#6B7280";
  const borderColor = theme?.pageBorder || "#E5E7EB";
  const cardBg = theme?.toggleBg || "#F9FAFB";

  const { rules, passed, total, score, ready } = report;
  const badgeColor = ready ? "#0F9960" : score >= 50 ? "#FF922B" : "#FA5252";
  const emoji = ready ? "✅" : score >= 50 ? "💡" : "⚠️";

  return (
    <div style={{
      background: cardBg,
      borderRadius: 12,
      padding: "14px 16px",
      marginBottom: 20,
      border: `1px solid ${borderColor}`,
    }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10,
          background: "transparent", border: "none", padding: 0, cursor: "pointer",
          color: textColor, textAlign: "left",
        }}
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>{emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em" }}>
              발행 전 체크리스트
            </span>
            <span style={{ fontSize: 12, color: badgeColor, fontWeight: 500 }}>
              {passed}/{total} 통과
            </span>
            <span style={{ fontSize: 11, color: mutedColor, marginLeft: "auto" }}>
              {open ? "접기 ▴" : "펼치기 ▾"}
            </span>
          </div>
        </div>
      </button>

      {open && (
        <div style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: `1px solid ${borderColor}`,
          display: "flex", flexDirection: "column", gap: 8,
        }}>
          {rules.map(r => {
            const icon = r.ok === true ? "✓" : r.ok === false ? "✗" : "○";
            const color = r.ok === true ? "#0F9960" : r.ok === false ? "#FA5252" : mutedColor;
            return (
              <div key={r.key} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 12 }}>
                <span style={{ color, fontWeight: 700, lineHeight: "18px", width: 14, textAlign: "center" }}>{icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: textColor, fontWeight: 500 }}>
                    {r.label}
                    {r.detail && (
                      <span style={{ color: mutedColor, fontWeight: 400, marginLeft: 6 }}>
                        · {r.detail}
                      </span>
                    )}
                  </div>
                  {r.ok === false && r.hint && (
                    <div style={{ color: mutedColor, fontSize: 11, marginTop: 2 }}>
                      {r.hint}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
