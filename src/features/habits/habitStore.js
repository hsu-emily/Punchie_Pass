// src/store/habitStore.js
import { create } from 'zustand';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from "@/services/firebase";
import { canPunchToday as canPunchByFrequency } from '@/features/punchpass/useCanPunchToday';

const habitsCol = (userId) => collection(db, 'users', userId, 'habits');
const habitDoc = (userId, habitId) => doc(db, 'users', userId, 'habits', habitId);

export const useHabitStore = create((set, get) => ({
  habits: [],
  userId: null,
  loading: false,
  error: null,

  // Fetch habits from Firestore
  fetchHabits: async (userId) => {
    set({ loading: true, error: null, userId });
    try {
      const querySnapshot = await getDocs(habitsCol(userId));
      const habits = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      set({ habits, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Error fetching habits:', error);
    }
  },

  // Add new habit
  addHabit: async (userId, habitData) => {
    set({ loading: true, userId });
    try {
      const newHabit = {
        ...habitData,
        userId,
        currentPunches: 0,
        createdAt: new Date().toISOString(),
        logs: []
      };
      const docRef = await addDoc(habitsCol(userId), newHabit);
      set(state => ({
        habits: [...state.habits, { id: docRef.id, ...newHabit }],
        loading: false
      }));
      return docRef.id;
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Error adding habit:', error);
      throw error;
    }
  },

  // Punch habit (increment)
  punchHabit: async (habitId) => {
    const { userId } = get();
    const habit = get().habits.find(h => h.id === habitId);
    if (!habit || !userId || habit.currentPunches >= habit.targetPunches) return false;
    if (!get().canPunchToday(habit)) return false;

    try {
      const newPunches = habit.currentPunches + 1;
      const habitRef = habitDoc(userId, habitId);

      const log = {
        date: new Date().toISOString(),
        punchNumber: newPunches
      };

      await updateDoc(habitRef, {
        currentPunches: newPunches,
        logs: [...(habit.logs || []), log],
        lastPunchedAt: new Date().toISOString()
      });

      set(state => ({
        habits: state.habits.map(h =>
          h.id === habitId
            ? { ...h, currentPunches: newPunches, logs: [...(h.logs || []), log], lastPunchedAt: new Date().toISOString() }
            : h
        )
      }));

      return newPunches === habit.targetPunches;
    } catch (error) {
      console.error('Error punching habit:', error);
      set({ error: error.message });
      return false;
    }
  },

  // Undo last punch (decrement)
  undoPunch: async (habitId) => {
    const { userId } = get();
    const habit = get().habits.find(h => h.id === habitId);
    if (!habit || !userId || habit.currentPunches <= 0) return false;

    try {
      const newPunches = Math.max(0, habit.currentPunches - 1);
      const habitRef = habitDoc(userId, habitId);

      const updatedLogs = habit.logs && habit.logs.length > 0
        ? habit.logs.slice(0, -1)
        : [];

      await updateDoc(habitRef, {
        currentPunches: newPunches,
        logs: updatedLogs,
        lastPunchedAt: updatedLogs.length > 0
          ? updatedLogs[updatedLogs.length - 1].date
          : null
      });

      set(state => ({
        habits: state.habits.map(h =>
          h.id === habitId
            ? {
                ...h,
                currentPunches: newPunches,
                logs: updatedLogs,
                lastPunchedAt: updatedLogs.length > 0
                  ? updatedLogs[updatedLogs.length - 1].date
                  : null
              }
            : h
        )
      }));

      return true;
    } catch (error) {
      console.error('Error undoing punch:', error);
      set({ error: error.message });
      return false;
    }
  },

  // Reset habit (for new cycle)
  resetHabit: async (habitId) => {
    const { userId } = get();
    if (!userId) return;
    try {
      const habitRef = habitDoc(userId, habitId);
      await updateDoc(habitRef, {
        currentPunches: 0,
        logs: [],
        lastResetAt: new Date().toISOString()
      });

      set(state => ({
        habits: state.habits.map(h =>
          h.id === habitId
            ? { ...h, currentPunches: 0, logs: [], lastResetAt: new Date().toISOString() }
            : h
        )
      }));
    } catch (error) {
      console.error('Error resetting habit:', error);
      set({ error: error.message });
    }
  },

  // Delete habit
  deleteHabit: async (habitId) => {
    const { userId } = get();
    if (!userId) return;
    try {
      await deleteDoc(habitDoc(userId, habitId));
      set(state => ({
        habits: state.habits.filter(h => h.id !== habitId)
      }));
    } catch (error) {
      console.error('Error deleting habit:', error);
      set({ error: error.message });
    }
  },

  // Update habit
  updateHabit: async (habitId, updates) => {
    const { userId } = get();
    if (!userId) {
      const err = new Error('Cannot update habit: no userId in store. Did fetchHabits run?');
      console.error(err);
      set({ error: err.message });
      throw err;
    }
    try {
      const habitRef = habitDoc(userId, habitId);
      await updateDoc(habitRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      set(state => ({
        habits: state.habits.map(h =>
          h.id === habitId ? { ...h, ...updates, updatedAt: new Date().toISOString() } : h
        )
      }));
    } catch (error) {
      console.error('Error updating habit:', error);
      set({ error: error.message });
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Check if habit can be punched now — locks based on the previous punch
  // timestamp and the habit's frequency (daily/weekly/monthly).
  canPunchToday: (habit) => {
    return canPunchByFrequency({
      lastPunchedAt: habit.lastPunchedAt,
      frequency: habit.frequency || habit.timeWindow || 'daily',
    });
  },

  // Get habits that can be punched today
  getHabitsToPunchToday: () => {
    const habits = get().habits;
    return habits.filter(h =>
      h.currentPunches < h.targetPunches && get().canPunchToday(h)
    );
  }
}));
