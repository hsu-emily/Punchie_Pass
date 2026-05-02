/**
 * useCanPunchToday — returns whether a punch is allowed against `pass`
 * given its frequency and most recent punch timestamp.
 *
 * @param {Object} pass                              — the pass document
 * @param {'daily'|'weekly'|'monthly'} pass.frequency
 * @param {Date|firebase.Timestamp|null} pass.lastPunchedAt
 *
 * Usage:
 *   const canPunch = useCanPunchToday(pass);
 *   <PunchCard {...} canPunchToday={canPunch} />
 *
 * Re-evaluates once per minute so a daily pass becomes punch-able at
 * midnight without a refresh.
 */
import { useEffect, useState } from 'react';

const toDate = (v) => {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v.toDate === 'function') return v.toDate(); // Firestore Timestamp
  return new Date(v);
};

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth()    === b.getMonth() &&
  a.getDate()     === b.getDate();

const isSameIsoWeek = (a, b) => {
  const w = (d) => {
    const x = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const day = x.getUTCDay() || 7;
    x.setUTCDate(x.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(x.getUTCFullYear(), 0, 1));
    return Math.ceil(((x - yearStart) / 86400000 + 1) / 7) + x.getUTCFullYear() * 100;
  };
  return w(a) === w(b);
};

const isSameMonth = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

export function canPunchToday(pass, now = new Date()) {
  const last = toDate(pass?.lastPunchedAt);
  if (!last) return true;
  switch (pass?.frequency) {
    case 'weekly':  return !isSameIsoWeek(last, now);
    case 'monthly': return !isSameMonth(last, now);
    case 'daily':
    default:        return !isSameDay(last, now);
  }
}

export default function useCanPunchToday(pass) {
  const [allowed, setAllowed] = useState(() => canPunchToday(pass));
  useEffect(() => {
    setAllowed(canPunchToday(pass));
    const id = setInterval(() => setAllowed(canPunchToday(pass)), 60_000);
    return () => clearInterval(id);
  }, [pass?.lastPunchedAt, pass?.frequency]);
  return allowed;
}
