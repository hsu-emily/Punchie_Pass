// src/pages/Dashboard.jsx
import { signOut } from 'firebase/auth';
import { motion } from 'framer-motion';
import { BookOpen, ChevronLeft, ChevronRight, LogOut, Plus, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CardZoomModal from "@/features/punchpass/CardZoomModal";
import CreateHabitModal from "@/features/habits/CreateHabitModal";
import HabitCard from "@/features/habits/HabitCard";
import JournalModal from "@/features/habits/JournalModal";
import Layout from "@/ui/Layout";
import ReflectionModal from "@/features/habits/ReflectionModal";
import { auth } from "@/services/firebase";
import { useAuth } from "@/features/auth/useAuth";
import { useHabitStore } from "@/features/habits/habitStore";

// Load bunny icon
const iconModules = import.meta.glob("@/assets/icons/*.png", { eager: true });
const iconMap = {};
for (const path in iconModules) {
  const filename = path.split('/').pop();
  iconMap[filename] = iconModules[path].default;
}
const bunnyIcon = iconMap['bunny.png'] || null;

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const habits = useHabitStore(state => state.habits);
  const punchHabit = useHabitStore(state => state.punchHabit);
  const undoPunch = useHabitStore(state => state.undoPunch);
  const fetchHabits = useHabitStore(state => state.fetchHabits);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [showJournals, setShowJournals] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomedHabit, setZoomedHabit] = useState(null);

  useEffect(() => {
    if (user) {
      fetchHabits(user.uid);
    }
  }, [user, fetchHabits]);

  // Sync zoomedHabit when habits update
  useEffect(() => {
    if (zoomedHabit) {
      const updatedHabit = habits.find(h => h.id === zoomedHabit.id);
      if (updatedHabit) {
        setZoomedHabit(updatedHabit);
      }
    }
  }, [habits, zoomedHabit?.id]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handlePunch = async (habitId) => {
    await punchHabit(habitId);
  };

  // Filter out completed habits for carousel
  const uncompletedHabits = habits.filter(h => h.currentPunches < h.targetPunches);
  
  // Calculate stats
  const todayHabits = habits.filter(h => h.currentPunches < h.targetPunches).length;
  const totalPunches = habits.reduce((acc, h) => acc + h.currentPunches, 0);
  const completedHabits = habits.filter(h => h.currentPunches === h.targetPunches).length;

  // Reset active index when uncompleted habits change
  useEffect(() => {
    const uncompletedCount = habits.filter(h => h.currentPunches < h.targetPunches).length;
    if (uncompletedCount > 0 && activeIndex >= uncompletedCount) {
      setActiveIndex(Math.max(0, uncompletedCount - 1));
    } else if (uncompletedCount === 0) {
      setActiveIndex(0);
    }
  }, [habits, activeIndex]);

  return (
    <Layout>
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header-right-new">
          <button
            onClick={() => setShowReflection(true)}
            className="btn-reflection-new"
          >
            <Sparkles size={18} />
            <span className="btn-reflection-text">Reflection</span>
          </button>
          {bunnyIcon && (
            <button
              onClick={() => {
                console.log('Bunny clicked!');
              }}
              className="btn-bunny"
              title="Bunny"
              aria-label="Bunny"
            >
              <img 
                src={bunnyIcon} 
                alt="Bunny" 
                style={{ width: '24px', height: '24px', objectFit: 'contain' }}
              />
            </button>
          )}
          <button
            onClick={handleLogout}
            className="btn-logout-new"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
        
        <header className="dashboard-header-new">
          <h1 className="dashboard-title-new">
            {user?.displayName?.split(' ')[0] || 'Friend'}'s Habits.
          </h1>
        </header>

        {!(showCreateModal || showReflection || showJournals || zoomedHabit) && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-new-habit"
          >
            <Plus size={20} />
            <span>New Habit</span>
          </button>
        )}

        {uncompletedHabits.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-emoji">🐰</div>
            <h3 className="empty-state-title">No habits right now</h3>
            <p className="empty-state-text">Create your first punch card to start your journey ✨</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-create-first"
            >
              Create Your First Habit
            </button>
          </div>
        ) : (
          <div className="habits-carousel-container">
            <div className="habits-carousel-wrapper">
              {/* Left Navigation - only show if 3+ cards */}
              {uncompletedHabits.length >= 3 && (
                <button
                  onClick={() => {
                    const newIndex = (activeIndex - 1 + uncompletedHabits.length) % uncompletedHabits.length;
                    setActiveIndex(newIndex);
                  }}
                  className="carousel-nav-btn carousel-nav-left"
                  aria-label="Previous habit"
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              {/* Carousel Cards */}
              <div className="habits-carousel">
                {uncompletedHabits.map((habit, index) => {
                  // Calculate offset from active index, handling wrap-around for infinite scroll
                  let offset = index - activeIndex;
                  
                  // Normalize offset for infinite scroll (shortest path)
                  if (Math.abs(offset) > uncompletedHabits.length / 2) {
                    offset = offset > 0 
                      ? offset - uncompletedHabits.length 
                      : offset + uncompletedHabits.length;
                  }
                  
                  // Determine styling based on offset
                  let scale = 0.85;
                  let opacity = 0.3;
                  let zIndex = 10;
                  
                  if (offset === 0) {
                    // Center card
                    scale = 1.05;
                    opacity = 1;
                    zIndex = 20;
                  } else if (Math.abs(offset) === 1) {
                    // Adjacent cards (left and right)
                    scale = 0.85;
                    opacity = 0.7;
                    zIndex = 15;
                  } else if (Math.abs(offset) === 2) {
                    // Further cards
                    scale = 0.75;
                    opacity = 0.5;
                    zIndex = 12;
                  } else {
                    // Cards further away
                    scale = 0.65;
                    opacity = 0.3;
                    zIndex = 5;
                  }
                  
                  // Calculate x position in pixels for proper centering
                  const xPosition = offset * 140;
                  const isCenterCard = offset === 0;

                  return (
                    <motion.div
                      key={habit.id}
                      className={`carousel-card ${!isCenterCard ? 'disabled' : ''}`}
                      style={{
                        zIndex,
                      }}
                      initial={{
                        x: `calc(-50% + ${xPosition}px)`,
                        y: '-45%',
                        scale,
                        opacity,
                      }}
                      animate={{
                        x: `calc(-50% + ${xPosition}px)`,
                        y: '-45%',
                        scale,
                        opacity,
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                      }}
                      onClick={isCenterCard ? () => setZoomedHabit(habit) : undefined}
                    >
                      <HabitCard
                        habit={habit}
                        onPunch={() => handlePunch(habit.id)}
                        hideControls={true}
                        size="medium"
                      />
                    </motion.div>
                  );
                })}
              </div>

              {/* Right Navigation - only show if 3+ cards */}
              {uncompletedHabits.length >= 3 && (
                <button
                  onClick={() => {
                    const newIndex = (activeIndex + 1) % uncompletedHabits.length;
                    setActiveIndex(newIndex);
                  }}
                  className="carousel-nav-btn carousel-nav-right"
                  aria-label="Next habit"
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </div>

            {/* Carousel Indicators */}
            {uncompletedHabits.length > 1 && (
              <div className="carousel-indicators">
                {uncompletedHabits.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`carousel-indicator ${index === activeIndex ? 'active' : ''}`}
                    aria-label={`Go to habit ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stats Overview */}
        <div className="stats-container">
          <div className="stats-card">
            <h2 className="stats-title">
              Today's Overview 
            </h2>
            <div className="stats-grid">
              <div className="stat-card stat-card-pink">
                <div className="stat-number stat-number-pink">{todayHabits}</div>
                <div className="stat-label">Habits to punch today</div>
              </div>
              <div className="stat-card stat-card-purple">
                <div className="stat-number stat-number-purple">{totalPunches}</div>
                <div className="stat-label">Total punches</div>
              </div>
              <div className="stat-card stat-card-green">
                <div className="stat-number stat-number-green">{completedHabits}</div>
                <div className="stat-label">Rewards unlocked</div>
              </div>
            </div>
            
            {/* View Journals Button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowJournals(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <BookOpen size={20} />
                <span>View My Journals</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && user && (
        <CreateHabitModal
          userId={user.uid}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {showReflection && (
        <ReflectionModal onClose={() => setShowReflection(false)} user={user} />
      )}

      {showJournals && (
        <JournalModal onClose={() => setShowJournals(false)} user={user} />
      )}

      {zoomedHabit && (
        <CardZoomModal
          habit={zoomedHabit}
          onClose={() => setZoomedHabit(null)}
          onPunch={async () => {
            await handlePunch(zoomedHabit.id);
          }}
          onUndo={async () => {
            await undoPunch(zoomedHabit.id);
          }}
        />
      )}
    </Layout>
  );
}