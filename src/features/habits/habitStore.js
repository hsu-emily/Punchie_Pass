// src/store/habitStore.js
import { create } from 'zustand';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from "@/services/firebase";

export const useHabitStore = create((set, get) => ({
  habits: [],
  loading: false,
  error: null,

  // Fetch habits from Firestore
  fetchHabits: async (userId) => {
    set({ loading: true, error: null });
    try {
      const q = query(collection(db, 'habits'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
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
    set({ loading: true });
    try {
      const newHabit = {
        ...habitData,
        userId,
        currentPunches: 0,
        createdAt: new Date().toISOString(),
        logs: []
      };
      const docRef = await addDoc(collection(db, 'habits'), newHabit);
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
    const habit = get().habits.find(h => h.id === habitId);
    if (!habit || habit.currentPunches >= habit.targetPunches) return false;

    try {
      const newPunches = habit.currentPunches + 1;
      const habitRef = doc(db, 'habits', habitId);
      
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

      // Return true if habit is complete
      return newPunches === habit.targetPunches;
    } catch (error) {
      console.error('Error punching habit:', error);
      set({ error: error.message });
      return false;
    }
  },

  // Undo last punch (decrement)
  undoPunch: async (habitId) => {
    const habit = get().habits.find(h => h.id === habitId);
    if (!habit || habit.currentPunches <= 0) return false;

    try {
      const newPunches = Math.max(0, habit.currentPunches - 1);
      const habitRef = doc(db, 'habits', habitId);
      
      // Remove the last log entry
      const updatedLogs = habit.logs && habit.logs.length > 0 
        ? habit.logs.slice(0, -1) 
        : [];

      await updateDoc(habitRef, {
        currentPunches: newPunches,
        logs: updatedLogs,
        // Update lastPunchedAt to the previous punch date, or null if no punches left
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
    try {
      const habitRef = doc(db, 'habits', habitId);
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
    try {
      await deleteDoc(doc(db, 'habits', habitId));
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
    try {
      const habitRef = doc(db, 'habits', habitId);
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
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Check if habit can be punched today (based on time_window)
  canPunchToday: (habit) => {
    if (!habit.lastPunchedAt) return true;
    
    const lastPunch = new Date(habit.lastPunchedAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastPunch.setHours(0, 0, 0, 0);
    
    const timeWindow = habit.timeWindow || 'daily';
    
    if (timeWindow === 'daily') {
      return lastPunch.getTime() < today.getTime();
    } else if (timeWindow === 'weekly') {
      const daysDiff = Math.floor((today - lastPunch) / (1000 * 60 * 60 * 24));
      return daysDiff >= 7;
    }
    return true; // custom - allow anytime
  },

  // Get habits that can be punched today
  getHabitsToPunchToday: () => {
    const habits = get().habits;
    return habits.filter(h => 
      h.currentPunches < h.targetPunches && get().canPunchToday(h)
    );
  }
}));
