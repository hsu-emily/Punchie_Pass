import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, MousePointer2, Settings, Trash2, Undo2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import holePunchCursor from "@/assets/cursors/holePunch.png";
import holePunchClickCursor from "@/assets/cursors/holePunchClick.png";
import { useHabitStore } from "@/features/habits/habitStore";
import { getCardLayout } from "@/features/punchpass/cardLayouts.config";
import PunchCardPreview from './PunchCardPreview';

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

export default function CardZoomModal({ habit, onClose, onPunch, onUndo }) {
  const navigate = useNavigate();
  const { deleteHabit } = useHabitStore();
  const cardRef = useRef(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [justPunched, setJustPunched] = useState(false);
  const [clickEnabled, setClickEnabled] = useState(true);
  const [confettiTriggered, setConfettiTriggered] = useState(false);

  // Get punch card image and layout
  const punchCardImage = punchCardMap[habit.punchCardImage] || Object.values(punchCardMap)[0] || null;
  const layout = getCardLayout(habit.punchCardImage);

  // Get icons
  const icon1 = habit.icon1 ? (iconMap[habit.icon1] || habit.icon1) : null;
  const icon2 = habit.icon2 ? (iconMap[habit.icon2] || habit.icon2) : null;

  const punchGridLayout = {
    ...layout.punchGrid,
    filledPunches: habit.currentPunches,
    totalPunches: habit.targetPunches
  };

  // Check if habit is complete
  const isComplete = habit.currentPunches >= habit.targetPunches;

  // Navigate to celebration page when habit becomes complete
  useEffect(() => {
    if (isComplete && !confettiTriggered) {
      setConfettiTriggered(true);
      // Navigate to celebration page with habit data
      navigate('/celebration', { state: { habit } });
      onClose(); // Close the modal
    }
  }, [isComplete, confettiTriggered, habit, navigate, onClose]);



  useEffect(() => {
    // Hide default cursor on body
    document.body.style.cursor = 'none';
    
    let animationFrameId;
    
    const handleMouseMove = (e) => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      animationFrameId = requestAnimationFrame(() => {
        setCursorPosition({ x: e.clientX, y: e.clientY });
        
        if (!cardRef.current) {
          setIsHovering(false);
          return;
        }
        
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if mouse is over the card
        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
          setIsHovering(true);
        } else {
          setIsHovering(false);
        }
      });
    };

    const handleMouseDown = () => {
      setIsClicking(true);
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    const handleMouseEnter = () => {
      setIsHovering(true);
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
    };

    // Close settings dropdown when clicking outside
    const handleClickOutside = (e) => {
      if (showSettings && !e.target.closest('.card-zoom-settings-container')) {
        setShowSettings(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('click', handleClickOutside);
    
    const cardElement = cardRef.current;
    if (cardElement) {
      cardElement.addEventListener('mouseenter', handleMouseEnter);
      cardElement.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('click', handleClickOutside);
      if (cardElement) {
        cardElement.removeEventListener('mouseenter', handleMouseEnter);
        cardElement.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [showSettings]);

  const handleCardClick = (e) => {
    e.stopPropagation();
    // Only punch if clicking is enabled, the card is not complete, and we haven't just punched
    if (clickEnabled && onPunch && habit.currentPunches < habit.targetPunches && !justPunched) {
      onPunch();
      setJustPunched(true);
      // Stay on page for 2 seconds after punching
      setTimeout(() => {
        setJustPunched(false);
      }, 2000);
    }
  };

  const handleUndo = () => {
    if (onUndo && habit.currentPunches > 0) {
      onUndo();
      setShowSettings(false);
    }
  };

  const handleNavigateDashboard = () => {
    navigate('/dashboard');
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this habit card? This action cannot be undone.')) {
      deleteHabit(habit.id);
      onClose();
    }
  };

  const handleToggleClick = () => {
    setClickEnabled(!clickEnabled);
    setShowSettings(false);
  };


  return (
    <AnimatePresence>
      <motion.div
        className="card-zoom-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => {
          // Don't close if we just punched (wait for delay)
          if (!justPunched) {
            onClose();
          }
        }}
        style={{ cursor: 'none' }}
      >
        <motion.div
          className="card-zoom-content"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          style={{ cursor: 'none' }}
        >
          {/* Navigation Buttons - Top Left */}
          <div className="card-zoom-nav-buttons">
            <button
              className="card-zoom-nav-btn"
              onClick={handleNavigateDashboard}
              aria-label="Go to Dashboard"
              title="Dashboard"
            >
              <LayoutDashboard size={20} />
            </button>
          </div>

          {/* Settings Button - Top Right */}
          <div className="card-zoom-settings-container">
            <button
              className="card-zoom-settings-btn"
              onClick={() => setShowSettings(!showSettings)}
              aria-label="Settings"
              title="Settings"
            >
              <Settings size={20} />
            </button>
            
            {/* Settings Dropdown */}
            {showSettings && (
              <motion.div
                className="card-zoom-settings-dropdown"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <button
                  className="card-zoom-settings-item"
                  onClick={handleToggleClick}
                >
                  <MousePointer2 size={16} />
                  <span>{clickEnabled ? 'Disable Clicking' : 'Enable Clicking'}</span>
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

          <div
            ref={cardRef}
            className="card-zoom-card"
            onClick={handleCardClick}
            style={{ cursor: 'none' }}
            role="button"
            aria-label="Click to punch hole"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCardClick(e);
              }
            }}
          >
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
                size="large"
                targetPunches={habit.targetPunches}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">{habit.theme?.emoji || '⭐'}</div>
                  <h3 className="text-xl font-bold text-gray-800">{habit.title}</h3>
                </div>
              </div>
            )}
          </div>

          {/* Custom Hole Punch Cursor - Only show when hovering over card */}
          {isHovering && (
            <div
              className="card-zoom-cursor"
              style={{
                position: 'fixed',
                left: `${cursorPosition.x - 10}px`,
                top: `${cursorPosition.y - 10}px`,
                width: '200px',
                height: '200px',
                pointerEvents: 'none',
                zIndex: 10000,
              }}
            >
              <img
                src={isClicking ? holePunchClickCursor : holePunchCursor}
                alt="hole punch cursor"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  userSelect: 'none',
                  draggable: false,
                  display: 'block',
                }}
              />
            </div>
          )}

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

