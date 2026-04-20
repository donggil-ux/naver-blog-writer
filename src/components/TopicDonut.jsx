/**
 * 카테고리 도넛 — 외부 라이브러리 없이 SVG 360° 원호로 렌더.
 * props:
 *   data: [{ id, label, count, color }]
 *   size (default 180)
 *   theme
 */
export default function TopicDonut({ data = [], size = 180, theme }) {
  const total = data.reduce((s, d) => s + (d.count || 0), 0);
  const textColor = theme?.pageText || "#111827";
  const mutedColor = theme?.pageMuted || "#6B7280";
  const barBg = theme?.pageBorder || "#E5E7EB";

  const r = size / 2 - 14;
  const cx = size / 2;
  const cy = size / 2;
  const stroke = 18;
  const circumference = 2 * Math.PI * r;

  // 빈 상태
  if (total === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <svg width={size} height={size}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={barBg} strokeWidth={stroke} />
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 11, fill: mutedColor }}>
            데이터 없음
          </text>
        </svg>
      </div>
    );
  }

  let offset = 0;
  const arcs = data.filter(d => d.count > 0).map(d => {
    const frac = d.count / total;
    const len = circumference * frac;
    const dashArray = `${len} ${circumference - len}`;
    const el = (
      <circle
        key={d.id}
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={d.color}
        strokeWidth={stroke}
        strokeDasharray={dashArray}
        strokeDashoffset={-offset}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    );
    offset += len;
    return el;
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
      <svg width={size} height={size} aria-label="카테고리 분포 도넛">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={barBg} strokeWidth={stroke} />
        {arcs}
        <text x={cx} y={cy - 6} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 22, fontWeight: 700, fill: textColor }}>
          {total}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 10, fill: mutedColor, letterSpacing: "0.06em" }}>
          TOTAL
        </text>
      </svg>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 140 }}>
        {data.map(d => {
          const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
          return (
            <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 500, color: textColor, flex: 1 }}>{d.label}</span>
              <span style={{ fontSize: 12, color: mutedColor, fontVariantNumeric: "tabular-nums" }}>
                {d.count}개 · {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
