import { motion } from 'framer-motion';
import { Download, RotateCcw, Share2, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { useHabitStore } from "@/features/habits/habitStore";
import { downloadCard, generateShareableCard, shareCard } from "@/services/shareCard";
import PunchCard from '@/features/punchpass/PunchCard';

export default function HabitCard({ habit, onPunch, hideControls = false }) {
  const { resetHabit, deleteHabit } = useHabitStore();
  const cardRef = useRef(null);
  const [sharing, setSharing] = useState(false);
  const progress = (habit.currentPunches / habit.targetPunches) * 100;
  const isComplete = habit.currentPunches >= habit.targetPunches;

  const handleReset = () => {
    if (confirm('Reset this habit card? This will clear all punches.')) {
      resetHabit(habit.id);
    }
  };

  const handleDelete = () => {
    if (confirm('Delete this habit permanently?')) {
      deleteHabit(habit.id);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    
    setSharing(true);
    try {
      const blob = await generateShareableCard(cardRef.current, habit);
      if (blob) {
        shareCard(blob, habit);
      }
    } catch (error) {
      console.error('Error sharing card:', error);
      alert('Error generating shareable card. Please try again.');
    } finally {
      setSharing(false);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    setSharing(true);
    try {
      const blob = await generateShareableCard(cardRef.current, habit);
      if (blob) {
        downloadCard(blob, habit.title);
      }
    } catch (error) {
      console.error('Error downloading card:', error);
      alert('Error generating card. Please try again.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="habit-card"
    >
      <PunchCard habit={habit} />

      {/* Card Controls and Info - Hidden in carousel view */}
      {!hideControls && (
        <div className="habit-card-content">
          {/* Action Buttons */}
          <div className="habit-card-actions">
            <button
              onClick={handleShare}
              disabled={sharing}
              className="habit-card-action-btn"
              title="Share"
            >
              <Share2 size={16} className="text-gray-600" />
            </button>
            <button
              onClick={handleDownload}
              disabled={sharing}
              className="habit-card-action-btn"
              title="Download"
            >
              <Download size={16} className="text-gray-600" />
            </button>
            <button
              onClick={handleReset}
              className="habit-card-action-btn"
              title="Reset"
            >
              <RotateCcw size={16} className="text-gray-600" />
            </button>
            <button
              onClick={handleDelete}
              className="habit-card-action-btn"
              title="Delete"
            >
              <Trash2 size={16} className="text-gray-600" />
            </button>
          </div>

          {/* Progress Info */}
          <div className="mb-4">
            <div className="habit-progress-info">
              <span className="habit-progress-text">
                {habit.currentPunches} / {habit.targetPunches} punches
              </span>
              <span className="habit-progress-percent">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="habit-progress-bar">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="habit-progress-fill"
              />
            </div>
          </div>

          {/* Action Button */}
          {!isComplete ? (
            <button
              onClick={onPunch}
              className="habit-punch-btn"
            >
              Punch Today! 👊
            </button>
          ) : (
            <div className="habit-complete">
              🎉 Reward: {habit.reward || 'Completed!'}
            </div>
          )}

          {/* Timestamp */}
          {habit.lastPunchedAt && (
            <p className="habit-timestamp">
              Last punched: {new Date(habit.lastPunchedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}
