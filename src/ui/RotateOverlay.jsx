import { useEffect, useState } from 'react';
import './RotateOverlay.css';

const PORTRAIT_PHONE_QUERY = '(orientation: portrait) and (max-width: 600px)';

export default function RotateOverlay() {
  const [isPhonePortrait, setIsPhonePortrait] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia(PORTRAIT_PHONE_QUERY).matches
      : false
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(PORTRAIT_PHONE_QUERY);
    const onChange = (e) => setIsPhonePortrait(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  if (!isPhonePortrait) return null;

  return (
    <div className="rotate-overlay" role="alertdialog" aria-live="polite">
      <div className="rotate-overlay-card">
        <div className="rotate-overlay-icon" aria-hidden>
          <svg viewBox="0 0 64 64" width="72" height="72">
            <rect x="14" y="6" width="36" height="52" rx="6" ry="6"
              fill="none" stroke="#EC4899" strokeWidth="3" />
            <circle cx="32" cy="52" r="2" fill="#EC4899" />
            <path
              d="M44 28 a16 16 0 0 1 -16 16"
              fill="none" stroke="#B47CFF" strokeWidth="3"
              strokeLinecap="round" strokeDasharray="3 4"
            />
            <path d="M28 42 l4 6 l-8 0 z" fill="#B47CFF" />
          </svg>
        </div>
        <h2 className="rotate-overlay-title">Please rotate your phone</h2>
        <p className="rotate-overlay-msg">
          Punchie Pass is designed for landscape view. Turn your phone sideways
          to keep going.
        </p>
      </div>
    </div>
  );
}
