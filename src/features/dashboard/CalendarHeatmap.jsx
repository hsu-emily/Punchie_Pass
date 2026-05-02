import { useMemo } from 'react';
import './CalendarHeatmap.css';

const DAY_MS = 86_400_000;
const WEEKS = 12;
const COLS = WEEKS;
const ROWS = 7;

const dayKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const toDate = (v) => {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v.toDate === 'function') return v.toDate();
  return new Date(v);
};

export default function CalendarHeatmap({ punchDates = [] }) {
  const counts = useMemo(() => {
    const m = new Map();
    for (const v of punchDates) {
      const d = toDate(v);
      if (!d) continue;
      const k = dayKey(d);
      m.set(k, (m.get(k) || 0) + 1);
    }
    return m;
  }, [punchDates]);

  const cells = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Anchor grid to most recent Saturday so columns are weeks
    const startOffset = today.getDay() + (COLS - 1) * 7;
    const start = new Date(today.getTime() - startOffset * DAY_MS);

    const out = [];
    for (let c = 0; c < COLS; c++) {
      const col = [];
      for (let r = 0; r < ROWS; r++) {
        const d = new Date(start.getTime() + (c * 7 + r) * DAY_MS);
        const future = d > today;
        const k = dayKey(d);
        col.push({ date: d, key: k, count: counts.get(k) || 0, future });
      }
      out.push(col);
    }
    return out;
  }, [counts]);

  const max = useMemo(() => {
    let m = 0;
    for (const v of counts.values()) if (v > m) m = v;
    return m;
  }, [counts]);

  const intensity = (count) => {
    if (!count) return 0;
    if (max <= 1) return 1;
    const ratio = count / max;
    if (ratio < 0.34) return 1;
    if (ratio < 0.67) return 2;
    return 3;
  };

  return (
    <div className="ch-wrap">
      <div className="ch-header">
        <span className="ch-title">Last {WEEKS} weeks</span>
        <Legend />
      </div>
      <div className="ch-grid" role="grid" aria-label="Punch activity heatmap">
        {cells.map((col, ci) => (
          <div key={ci} className="ch-col" role="row">
            {col.map((cell) => (
              <div
                key={cell.key}
                role="gridcell"
                title={`${cell.key}: ${cell.count} punch${cell.count === 1 ? '' : 'es'}`}
                className={`ch-cell ch-i-${intensity(cell.count)} ${cell.future ? 'ch-future' : ''}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="ch-legend">
      <span>Less</span>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className={`ch-cell ch-i-${i}`} />
      ))}
      <span>More</span>
    </div>
  );
}
