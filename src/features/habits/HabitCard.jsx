import { motion } from 'framer-motion';
import { Download, RotateCcw, Share2, Trash2 } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useHabitStore } from "@/features/habits/habitStore";
import { getCardLayout } from "@/features/punchpass/cardLayouts.config";
import { downloadCard, generateShareableCard, shareCard } from "@/services/shareCard";
import PunchCardPreview from '@/features/punchpass/PunchCardPreview';

// Load punch card PNGs
const punchCardModules = import.meta.glob("@/assets/punch_cards/*.png", { eager: true });
const punchCardMap = {};
for (const path in punchCardModules) {
  const filename = path.split('/').pop();
  punchCardMap[filename] = punchCardModules[path].default;
}

// Load icon PNGs
const iconModules = import.meta.glob("@/assets/icons/*.png", { eager: true });
const iconMap = {};
for (const path in iconModules) {
  const filename = path.split('/').pop();
  iconMap[filename] = iconModules[path].default;
}

export default function HabitCard({ habit, onPunch, hideControls = false, size = 'medium' }) {
  const { resetHabit, deleteHabit } = useHabitStore();
  const cardRef = useRef(null);
  const [sharing, setSharing] = useState(false);
  const progress = (habit.currentPunches / habit.targetPunches) * 100;
  const isComplete = habit.currentPunches >= habit.targetPunches;

  // Get punch card image and layout
  const punchCardImage = useMemo(() => {
    if (habit.punchCardImage && punchCardMap[habit.punchCardImage]) {
      return punchCardMap[habit.punchCardImage];
    }
    // Fallback to first available card
    return Object.values(punchCardMap)[0] || null;
  }, [habit.punchCardImage]);

  // Get layout from cardLayouts based on punchCardImage
  // Always use cardLayouts to ensure we have Medium/Large structure
  // If habit.layout exists and has custom values, we could merge them, but for now use cardLayouts
  const layout = getCardLayout(habit.punchCardImage);

  // Get icons
  const icon1 = habit.icon1 ? (iconMap[habit.icon1] || habit.icon1) : null;
  const icon2 = habit.icon2 ? (iconMap[habit.icon2] || habit.icon2) : null;

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

  // Create punch grid with filled/unfilled states
  const getPunchIcon = (index) => {
    if (index < habit.currentPunches) {
      // Return filled icon (alternate between icon1 and icon2)
      return (index % 2 === 0 ? icon1 : icon2) || '✓';
    }
    return null; // Empty punch
  };

  // Update layout to show filled punches
  const punchGridLayout = {
    ...layout.punchGrid,
    filledPunches: habit.currentPunches,
    totalPunches: habit.targetPunches
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="habit-card"
    >
      {/* Punch Card Preview */}
      <div className="relative w-full" style={{ aspectRatio: '1004/591', minHeight: '300px' }}>
        {punchCardImage ? (
          <PunchCardPreview
            name={habit.title}
            description={habit.description || ''}
            icon1={icon1}
            icon2={icon2}
            cardImage={punchCardImage}
            isDailyPunch={habit.timeWindow === 'daily'}
            titlePlacement={layout.title}
            descriptionPlacement={layout.description}
            punchGridPlacement={punchGridLayout}
            currentPunches={habit.currentPunches}
            targetPunches={habit.targetPunches}
            size={size}
          />
        ) : (
          <div className="habit-card-fallback">
            <div className="habit-card-fallback-content">
              <div className="habit-card-fallback-emoji">{habit.theme?.emoji || '⭐'}</div>
              <h3 className="habit-card-fallback-title">{habit.title}</h3>
            </div>
          </div>
        )}
      </div>

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
