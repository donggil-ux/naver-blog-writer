import { useEffect, useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  DEFAULT_GOAL, GOAL_KEY,
  loadGoal, nextTargetDay, dDay,
  publishedByDate, dateKey, weeklyPublishedCount,
} from "../lib/goal.js";

const DOW = ["일", "월", "화", "수", "목", "금", "토"];

/**
 * 발행 스케줄 뷰 — 2차 기능 4.
 */
export default function ScheduleView({ history = [], theme }) {
  const textColor = theme?.pageText || "#111827";
  const mutedColor = theme?.pageMuted || "#6B7280";
  const cardBg = theme?.cardBg || "#FFFFFF";
  const border = theme?.cardBorder || "#E5E7EB";
  const toggleBg = theme?.toggleBg || "#F3F4F6";

  const [goal, setGoal] = useState(() => loadGoal());
  useEffect(() => {
    localStorage.setItem(GOAL_KEY, JSON.stringify(goal));
  }, [goal]);

  const today = useMemo(() => new Date(), []);
  const dateMap = useMemo(() => publishedByDate(history), [history]);
  const weekDone = useMemo(() => weeklyPublishedCount(history, today), [history, today]);
  const target = useMemo(() => nextTargetDay(goal, history, today), [goal, history, today]);
  const dd = dDay(target.date, today);

  const toggleDow = (d) => {
    setGoal(prev => {
      const has = prev.days.includes(d);
      return { ...prev, days: has ? prev.days.filter(x => x !== d) : [...prev.days, d].sort() };
    });
  };

  const handleTargetChange = (e) => {
    const v = Math.max(1, Math.min(14, Number(e.target.value) || 1));
    setGoal(prev => ({ ...prev, weeklyTarget: v }));
  };

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;
    const key = dateKey(date);
    const count = dateMap.get(key) || 0;
    if (count === 0) return null;
    return (
      <div style={{ display: "flex", justifyContent: "center", gap: 2, marginTop: 2 }}>
        {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
          <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#FFD43B" }} />
        ))}
        {count > 3 && <span style={{ fontSize: 9, color: mutedColor }}>+{count - 3}</span>}
      </div>
    );
  };

  const tileClassName = ({ date, view }) => {
    if (view !== "month") return null;
    const isAfterToday = date.getTime() > today.getTime();
    const isScheduled = goal.days.includes(date.getDay());
    if (isAfterToday && isScheduled) return "nb-scheduled";
    return null;
  };

  return (
    <div style={{ padding: "20px 16px 40px", maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`
        .nb-cal { width: 100%; background: transparent; border: none; font-family: inherit; color: ${textColor}; }
        .nb-cal .react-calendar__navigation { margin-bottom: 8px; }
        .nb-cal .react-calendar__navigation button { background: transparent; color: ${textColor}; font-weight: 600; font-size: 14px; border-radius: 8px; }
        .nb-cal .react-calendar__navigation button:enabled:hover, .nb-cal .react-calendar__navigation button:enabled:focus { background: ${toggleBg}; }
        .nb-cal .react-calendar__month-view__weekdays { font-size: 11px; color: ${mutedColor}; font-weight: 500; text-transform: uppercase; }
        .nb-cal .react-calendar__month-view__weekdays abbr { text-decoration: none; }
        .nb-cal .react-calendar__tile { color: ${textColor}; background: transparent; padding: 10px 4px; border-radius: 8px; }
        .nb-cal .react-calendar__tile:enabled:hover { background: ${toggleBg}; }
        .nb-cal .react-calendar__tile--now { background: ${toggleBg}; font-weight: 700; }
        .nb-cal .react-calendar__tile--active { background: #FFD43B !important; color: #1F1F1F !important; }
        .nb-cal .react-calendar__tile.nb-scheduled { background: repeating-linear-gradient(45deg, ${toggleBg}, ${toggleBg} 4px, transparent 4px, transparent 8px); }
        .nb-cal .react-calendar__month-view__days__day--neighboringMonth { color: ${mutedColor}; opacity: 0.5; }
      `}</style>

      {/* D-day 배너 */}
      <div style={{
        background: "linear-gradient(135deg, #FFD43B 0%, #FFB800 100%)",
        color: "#1F1F1F",
        borderRadius: 16,
        padding: "16px 20px",
        display: "flex", alignItems: "center", gap: 14,
      }}>
        <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>
          {dd == null ? "—" : dd === 0 ? "D-Day" : dd > 0 ? `D-${dd}` : `D+${-dd}`}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>
            {target.date
              ? `${target.date.getMonth() + 1}월 ${target.date.getDate()}일 (${DOW[target.date.getDay()]}) 발행 예정`
              : "이번 주 목표를 달성했어요! 🎉"}
          </div>
          <div style={{ fontSize: 12, marginTop: 2, opacity: 0.75 }}>
            이번 주 {weekDone}/{goal.weeklyTarget}회 발행
          </div>
        </div>
      </div>

      {/* 목표 설정 */}
      <div style={{
        background: cardBg, border: `1px solid ${border}`, borderRadius: 16,
        padding: "18px 20px",
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: textColor, marginBottom: 12 }}>
          🎯 발행 목표
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 13, color: textColor }}>주</span>
          <input
            type="number"
            min={1} max={14}
            value={goal.weeklyTarget}
            onChange={handleTargetChange}
            style={{
              width: 60, padding: "6px 10px",
              background: toggleBg, color: textColor,
              border: `1px solid ${border}`, borderRadius: 8,
              fontSize: 14, fontWeight: 600, textAlign: "center",
            }}
          />
          <span style={{ fontSize: 13, color: textColor }}>회 발행</span>
        </div>

        <div style={{ fontSize: 12, color: mutedColor, marginBottom: 8 }}>
          선호 요일 (선택)
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {DOW.map((d, i) => {
            const active = goal.days.includes(i);
            return (
              <button
                key={i}
                type="button"
                onClick={() => toggleDow(i)}
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: active ? "#FFD43B" : toggleBg,
                  color: active ? "#1F1F1F" : textColor,
                  border: "none", cursor: "pointer",
                  fontSize: 12, fontWeight: 600,
                }}
              >{d}</button>
            );
          })}
        </div>
      </div>

      {/* 달력 */}
      <div style={{
        background: cardBg, border: `1px solid ${border}`, borderRadius: 16,
        padding: "16px 16px 20px",
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: textColor, marginBottom: 12 }}>
          📅 발행 달력
          <span style={{ fontSize: 11, fontWeight: 400, color: mutedColor, marginLeft: 8 }}>
            · 노란 점: 발행 완료 · 빗금: 예정 요일
          </span>
        </div>
        <Calendar
          className="nb-cal"
          tileContent={tileContent}
          tileClassName={tileClassName}
          locale="ko-KR"
          formatDay={(_, date) => String(date.getDate())}
        />
      </div>
    </div>
  );
}
