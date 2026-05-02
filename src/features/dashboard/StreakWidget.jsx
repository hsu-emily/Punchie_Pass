import { Flame } from 'lucide-react';
import './StreakWidget.css';

export default function StreakWidget({ current = 0, longest = 0 }) {
  const tier = current >= 30 ? 'gold' : current >= 7 ? 'hot' : current > 0 ? 'warm' : 'cold';
  return (
    <div className={`sw-widget sw-${tier}`}>
      <div className="sw-flame" aria-hidden>
        <Flame size={current >= 7 ? 28 : 22} />
      </div>
      <div className="sw-numbers">
        <div className="sw-current">
          <span className="sw-current-num">{current}</span>
          <span className="sw-current-label">day{current === 1 ? '' : 's'} in a row</span>
        </div>
        <div className="sw-longest">Best: {longest}</div>
      </div>
    </div>
  );
}
