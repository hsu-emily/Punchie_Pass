import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import './LevelUpToast.css';

export default function LevelUpToast({ event, onClose }) {
  useEffect(() => {
    if (!event) return;
    const t = setTimeout(onClose, event.milestone ? 6500 : 4500);
    return () => clearTimeout(t);
  }, [event, onClose]);

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          className={`lvlup-toast ${event.milestone ? 'is-milestone' : ''}`}
          initial={{ y: -40, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -20, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          role="status"
        >
          <Sparkles size={18} className="lvlup-icon" />
          <div className="lvlup-text">
            <div className="lvlup-title">
              {event.milestone ? 'MILESTONE!' : 'Level up!'} Lv {event.level}
            </div>
            <div className="lvlup-sub">
              +{event.tokens} ✦ token{event.tokens === 1 ? '' : 's'}
              {event.levels.length > 1 ? ` · ${event.levels.length} levels` : ''}
            </div>
          </div>
          <button className="lvlup-close" onClick={onClose} aria-label="Dismiss">
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
