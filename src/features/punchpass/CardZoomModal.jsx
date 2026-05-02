import { AnimatePresence, motion } from 'framer-motion';
import { Pencil, Settings, Trash2, Undo2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHabitStore } from "@/features/habits/habitStore";
import PunchCard from '@/features/punchpass/PunchCard';

export default function CardZoomModal({ habit, onClose, onPunch, onUndo }) {
  const navigate = useNavigate();
  const { deleteHabit } = useHabitStore();
  const [showSettings, setShowSettings] = useState(false);
  const [justPunched, setJustPunched] = useState(false);
  const [confettiTriggered, setConfettiTriggered] = useState(false);

  const isComplete = habit.currentPunches >= habit.targetPunches;

  useEffect(() => {
    if (isComplete && !confettiTriggered) {
      setConfettiTriggered(true);
      navigate('/celebration', { state: { habit } });
      onClose();
    }
  }, [isComplete, confettiTriggered, habit, navigate, onClose]);

  useEffect(() => {
    if (!showSettings) return;
    const handler = (e) => {
      if (!e.target.closest('.card-zoom-settings-container')) {
        setShowSettings(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [showSettings]);

  const handleCardClick = (e) => {
    e.stopPropagation();
    if (onPunch && habit.currentPunches < habit.targetPunches && !justPunched) {
      onPunch();
      setJustPunched(true);
      setTimeout(() => setJustPunched(false), 2000);
    }
  };

  const handleUndo = () => {
    if (onUndo && habit.currentPunches > 0) {
      onUndo();
      setShowSettings(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Delete this habit card? This cannot be undone.')) {
      deleteHabit(habit.id);
      onClose();
    }
  };

  const handleEdit = () => {
    setShowSettings(false);
    onClose();
    navigate(`/passes/${habit.id}/edit`);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="card-zoom-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => {
          if (!justPunched) onClose();
        }}
      >
        <motion.div
          className="card-zoom-content"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="card-zoom-settings-container">
            <button
              className="card-zoom-settings-btn"
              onClick={() => setShowSettings(!showSettings)}
              aria-label="Settings"
              title="Settings"
            >
              <Settings size={20} />
            </button>

            {showSettings && (
              <motion.div
                className="card-zoom-settings-dropdown"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <button
                  className="card-zoom-settings-item"
                  onClick={handleEdit}
                >
                  <Pencil size={16} />
                  <span>Edit Card</span>
                </button>
                <button
                  className="card-zoom-settings-item"
                  onClick={handleUndo}
                  disabled={habit.currentPunches === 0}
                >
                  <Undo2 size={16} />
                  <span>Undo Last Punch</span>
                </button>
                <button
                  className="card-zoom-settings-item"
                  onClick={handleDelete}
                  style={{ color: 'var(--color-error)' }}
                >
                  <Trash2 size={16} />
                  <span>Delete Card</span>
                </button>
              </motion.div>
            )}
          </div>

          <button
            className="card-zoom-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={24} />
          </button>

          <PunchCard
            habit={habit}
            className="card-zoom-card"
            onClick={handleCardClick}
            role="button"
            ariaLabel="Click to punch hole"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCardClick(e);
              }
            }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
