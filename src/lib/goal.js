// 발행 목표 · D-day 계산 — 순수 함수
// 2차 기능 4.

const DAY_MS = 24 * 60 * 60 * 1000;

export const GOAL_KEY = "blog_writer_goal";

export const DEFAULT_GOAL = { weeklyTarget: 3, days: [] }; // days: [0~6] 일~토

export function loadGoal() {
  try {
    const raw = localStorage.getItem(GOAL_KEY);
    if (!raw) return { ...DEFAULT_GOAL };
    const parsed = JSON.parse(raw);
    return {
      weeklyTarget: Number.isFinite(parsed.weeklyTarget) ? parsed.weeklyTarget : DEFAULT_GOAL.weeklyTarget,
      days: Array.isArray(parsed.days) ? parsed.days.filter(d => d >= 0 && d <= 6) : [],
    };
  } catch { return { ...DEFAULT_GOAL }; }
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function startOfWeek(d) {
  const x = startOfDay(d);
  x.setDate(x.getDate() - x.getDay()); // 주 시작: 일요일 = 0
  return x;
}

// 이번 주 발행 횟수 (isDraft 제외)
export function weeklyPublishedCount(history, today = new Date()) {
  const weekStart = startOfWeek(today).getTime();
  const weekEnd = weekStart + 7 * DAY_MS;
  return history.filter(e => {
    if (e.isDraft) return false;
    const ts = new Date(e.publishedAt || e.createdAt).getTime();
    return ts >= weekStart && ts < weekEnd;
  }).length;
}

// 다음 발행 예정일 계산
// - goal.days가 있으면 오늘 이후 가장 가까운 요일
// - 없으면 남은 목표 횟수를 주 내 남은 일에 균등 분배해서 다음 날 추정
export function nextTargetDay(goal, history, today = new Date()) {
  const base = startOfDay(today);
  const done = weeklyPublishedCount(history, today);
  const remaining = Math.max(0, (goal.weeklyTarget || 0) - done);

  if (Array.isArray(goal.days) && goal.days.length > 0) {
    for (let i = 0; i <= 7; i++) {
      const cand = new Date(base.getTime() + i * DAY_MS);
      if (goal.days.includes(cand.getDay())) {
        return { date: cand, remaining, done };
      }
    }
  }

  // 균등 분배: 이번 주 남은 일 수 / 남은 횟수
  if (remaining === 0) return { date: null, remaining: 0, done };
  const weekEnd = startOfWeek(today).getTime() + 7 * DAY_MS;
  const daysLeft = Math.ceil((weekEnd - base.getTime()) / DAY_MS);
  if (daysLeft <= 0) return { date: null, remaining, done };
  const gap = Math.max(1, Math.floor(daysLeft / remaining));
  return { date: new Date(base.getTime() + gap * DAY_MS), remaining, done };
}

// D-day 정수 (음수면 지나감)
export function dDay(date, today = new Date()) {
  if (!date) return null;
  const diff = Math.round((startOfDay(date).getTime() - startOfDay(today).getTime()) / DAY_MS);
  return diff;
}

// 달력 타일에 표시할 날짜별 발행 수 맵
export function publishedByDate(history) {
  const map = new Map();
  for (const e of history) {
    if (e.isDraft) continue;
    const d = new Date(e.publishedAt || e.createdAt);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    map.set(key, (map.get(key) || 0) + 1);
  }
  return map;
}

export function dateKey(d) {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
}
