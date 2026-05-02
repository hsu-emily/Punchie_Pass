// src/pages/Dashboard.jsx
import { signOut } from 'firebase/auth';
import { motion } from 'framer-motion';
import { BookOpen, ChevronLeft, ChevronRight, LogOut, Plus, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CardZoomModal from "@/features/punchpass/CardZoomModal";
import HabitCard from "@/features/habits/HabitCard";
import JournalModal from "@/features/habits/JournalModal";
import Layout from "@/ui/Layout";
import ReflectionModal from "@/features/habits/ReflectionModal";
import { auth } from "@/services/firebase";
import { useAuth } from "@/features/auth/useAuth";
import { useHabitStore } from "@/features/habits/habitStore";
import HatchedBunny from "@/features/bunny/HatchedBunny";
import useUserProgress from "@/features/habits/useUserProgress";
import useUserLevel from "@/features/progress/useUserLevel";
import useLevelRewards from "@/features/progress/useLevelRewards";
import LevelUpToast from "@/features/progress/LevelUpToast";
import DashboardCards from "./DashboardCards";
import "./EmptyState.css";
import "./Carousel.css";

export default function Dashboard() {
  const { user, profile } = useAuth();
  const bunnyKind = profile?.bunny?.kind || 'bun';
  const navigate = useNavigate();
  const habits = useHabitStore(state => state.habits);
  const punchHabit = useHabitStore(state => state.punchHabit);
  const undoPunch = useHabitStore(state => state.undoPunch);
  const fetchHabits = useHabitStore(state => state.fetchHabits);
  const progress = useUserProgress(habits);
  const { level } = useUserLevel(progress);
  const { event: levelUpEvent, acknowledge: dismissLevelUp } = useLevelRewards(level);
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
          <button
            onClick={() => navigate('/student-id')}
            className="btn-bunny"
            title="Student ID"
            aria-label="Student ID"
          >
            <HatchedBunny kind={bunnyKind} size={48} />
          </button>
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

        {uncompletedHabits.length === 0 ? (
          <div className="dashboard-empty">
            <div className="dashboard-empty-bunny"><HatchedBunny kind={bunnyKind} size={140} /></div>
            <div className="dashboard-empty-eyebrow">★ A fresh start ★</div>
            <h3 className="dashboard-empty-title">No habits yet</h3>
            <p className="dashboard-empty-text">
              Make your first punch card and your bunny will start growing.
            </p>
            <button
              onClick={() => navigate('/passes/new')}
              className="dashboard-empty-btn"
            >
              Create your first card ▸
            </button>
          </div>
        ) : (
          <div className="habits-carousel-container">
            <div className="habits-carousel-wrapper">
              {/* Left Navigation */}
              {uncompletedHabits.length >= 1 && (
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
                  
                  // Determine styling based on offset (softer scale curve)
                  let scale = 0.78;
                  let opacity = 0.35;
                  let zIndex = 10;

                  if (offset === 0) {
                    scale = 1;
                    opacity = 1;
                    zIndex = 20;
                  } else if (Math.abs(offset) === 1) {
                    scale = 0.88;
                    opacity = 0.85;
                    zIndex = 15;
                  } else if (Math.abs(offset) === 2) {
                    scale = 0.82;
                    opacity = 0.55;
                    zIndex = 12;
                  } else {
                    scale = 0.76;
                    opacity = 0.3;
                    zIndex = 5;
                  }

                  // Tighter horizontal spacing so neighbors don't feel cramped
                  const xPosition = offset * 124;
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

              {/* Right Navigation */}
              {uncompletedHabits.length >= 1 && (
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

        {!(showReflection || showJournals || zoomedHabit) && (
          <button
            onClick={() => navigate('/passes/new')}
            className="btn-new-habit"
          >
            <Plus size={20} />
            <span>New Habit</span>
          </button>
        )}

        <DashboardCards habits={habits} />

        <div className="dashboard-quick-row">
          <button
            onClick={() => setShowJournals(true)}
            className="dashboard-quick-btn dashboard-journal-btn"
          >
            <BookOpen size={18} />
            <span>View my journals</span>
          </button>
        </div>
      </div>

      <LevelUpToast event={levelUpEvent} onClose={dismissLevelUp} />

      {/* Modals */}
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

