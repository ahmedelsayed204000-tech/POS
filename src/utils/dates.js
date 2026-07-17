import { useEffect, useMemo, useState } from 'react';

export const fmt = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const startOfIsoWeek = (date) => {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = result.getDay() || 7;
  result.setDate(result.getDate() - day + 1);
  return result;
};

export const getIsoWeekLabel = (date = new Date()) => {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utc - yearStart) / 86_400_000 + 1) / 7);
  return `W${String(week).padStart(2, '0')}-${utc.getUTCFullYear()}`;
};

export const getDateContext = (date = new Date()) => {
  const now = new Date(date);
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = fmt(now);
  const weekStart = startOfIsoWeek(now);
  return {
    now,
    year,
    month,
    daysInMonth: new Date(year, month + 1, 0).getDate(),
    monthLabel: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
    today,
    monthPrefix: today.slice(0, 7),
    weekStart,
    weekEnd: new Date(weekStart.getTime() + 7 * 86_400_000),
    weekLabel: getIsoWeekLabel(now),
  };
};

export const useDateContext = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const scheduleNextDay = () => {
      const current = new Date();
      const next = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1, 0, 0, 1);
      return window.setTimeout(() => {
        setNow(new Date());
        timer = scheduleNextDay();
      }, next.getTime() - current.getTime());
    };
    let timer = scheduleNextDay();
    return () => window.clearTimeout(timer);
  }, []);

  return useMemo(() => getDateContext(now), [now]);
};

// Compatibility exports for the starter data. Application components should use
// getDateContext() or useDateContext() so an open tab rolls over at midnight.
const initial = getDateContext();
export const NOW = initial.now;
export const YR = initial.year;
export const MO = initial.month;
export const MDAYS = initial.daysInMonth;
export const MLABEL = initial.monthLabel;
export const TODAY = initial.today;
export const MOPFX = initial.monthPrefix;
export const WS = initial.weekStart;
export const WE = initial.weekEnd;
export const WEEK_LABEL = initial.weekLabel;
export const daysInMonth = (context = initial) => Array.from({ length: context.daysInMonth }, (_, index) => index + 1);
export const monthStartDay = (context = initial) => new Date(context.year, context.month, 1).getDay();
