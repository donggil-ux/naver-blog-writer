import { useState } from "react";
import { COMPLETENESS_BADGE } from "../lib/completeness.js";

/**
 * 완성도 배지 — 카테고리 탭 아래 한 줄 + 펼치면 누락 항목 리스트.
 * report: { score, checks, missing, level, canProceed } from completeness().
 * theme: 현재 테마 객체 (pageText/pageMuted/pageBg 사용).
 */
export default function CompletenessBadge({ report, theme }) {
  const [open, setOpen] = useState(false);
  const badge = COMPLETENESS_BADGE[report.level];
  const barBg = theme?.pageBorder || "#E5E7EB";
  const textColor = theme?.pageText || "#111827";
  const mutedColor = theme?.pageMuted || "#6B7280";
  const cardBg = theme?.cardBg || "#FFFFFF";

  return (
    <div style={{
      background: cardBg,
      borderRadius: 12,
      padding: "12px 14px",
      marginBottom: 12,
      border: `1px solid ${barBg}`,
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
        <span style={{ fontSize: 18, lineHeight: 1 }}>{badge.emoji}</span>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em" }}>
              정보 완성도 {report.score}점
            </span>
            <span style={{ fontSize: 11, color: badge.color, fontWeight: 500 }}>
              · {badge.label}
            </span>
            {report.missing.length > 0 && (
              <span style={{ fontSize: 11, color: mutedColor, marginLeft: "auto" }}>
                {open ? "접기 ▴" : `${report.missing.length}개 보완 가능 ▾`}
              </span>
            )}
          </div>

          {/* 진행 막대 */}
          <div style={{ height: 6, background: barBg, borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              width: `${report.score}%`,
              height: "100%",
              background: badge.color,
              transition: "width 0.3s ease",
            }} />
          </div>
        </div>
      </button>

      {open && report.missing.length > 0 && (
        <div style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: `1px solid ${barBg}`,
          display: "flex", flexDirection: "column", gap: 6,
        }}>
          {report.missing.map(m => (
            <div key={m.key} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12 }}>
              <span style={{ color: mutedColor, lineHeight: "18px" }}>□</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: textColor, fontWeight: 500 }}>
                  {m.label}
                  <span style={{ color: mutedColor, fontWeight: 400, marginLeft: 6 }}>
                    +{m.weight}점
                  </span>
                </div>
                {m.hint && (
                  <div style={{ color: mutedColor, fontSize: 11, marginTop: 2 }}>
                    {m.hint}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {open && report.missing.length === 0 && (
        <div style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: `1px solid ${barBg}`,
          color: mutedColor,
          fontSize: 12,
        }}>
          모든 항목이 채워졌어요 🎉
        </div>
      )}
    </div>
  );
}
