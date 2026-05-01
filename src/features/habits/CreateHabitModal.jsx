import { Loader2, Sparkles, Wand2, X } from 'lucide-react';
import { useState } from 'react';
import { generateRewardIdeas, transformGoalToHabits } from "@/services/geminiService";
import { useHabitStore } from "@/features/habits/habitStore";
import FramerCarousel from '@/features/punchpass/FramerCarousel';
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

// Create punch card options array
const punchCardOptions = Object.keys(punchCardMap).map(filename => ({
  id: filename,
  name: filename.replace('.png', '').replace(/([A-Z])/g, ' $1').trim(),
  url: punchCardMap[filename],
  filename: filename
}));

// Create icon options array
const iconOptions = Object.keys(iconMap).map(filename => ({
  id: filename,
  name: filename.replace('.png', ''),
  url: iconMap[filename],
  filename: filename
}));

import { getCardLayout } from "@/features/punchpass/cardLayouts.config";

// Default layout configurations for each punch card
const defaultLayouts = {
  'WindowsGreen.png': getCardLayout('WindowsGreen.png'),
  'WindowsPink.png': getCardLayout('WindowsPink.png'),
  'WindowsPurple.png': getCardLayout('WindowsPurple.png'),
  'LacePink.png': getCardLayout('LacePink.png'),
  'LaceRed.png': getCardLayout('LaceRed.png'),
  'PlaidBlue.png': getCardLayout('PlaidBlue.png'),
  'PlaidGreen.png': getCardLayout('PlaidGreen.png'),
  'DigiCam.png': getCardLayout('DigiCam.png'),
  'FilmCam.png': getCardLayout('FilmCam.png')
};

export default function CreateHabitModal({ userId, onClose }) {
  const addHabit = useHabitStore(state => state.addHabit);
  const [mode, setMode] = useState('habit'); // 'habit' or 'goal'
  const [goalText, setGoalText] = useState('');
  const [generatingHabits, setGeneratingHabits] = useState(false);
  const [suggestedHabits, setSuggestedHabits] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(null);
  const [rewardSuggestions, setRewardSuggestions] = useState([]);
  const [showRewardSuggestions, setShowRewardSuggestions] = useState(false);
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [selectedIcon1, setSelectedIcon1] = useState(iconOptions[0]?.filename || '');
  const [selectedIcon2, setSelectedIcon2] = useState(iconOptions[1]?.filename || '');
  
  const [habit, setHabit] = useState({
    title: '',
    description: '',
    targetPunches: 10,
    reward: '',
    timeWindow: 'daily',
    punchCardImage: punchCardOptions[0]?.filename || '',
    icon1: iconOptions[0]?.filename || '',
    icon2: iconOptions[1]?.filename || ''
  });

  // Get selected punch card
  const selectedCard = punchCardOptions[selectedCardIndex] || punchCardOptions[0];
  const selectedCardLayout = defaultLayouts[selectedCard?.filename] || defaultLayouts['WindowsGreen.png'];

  // Update habit when card selection changes
  const handleCardSelect = (index) => {
    setSelectedCardIndex(index);
    setHabit({ ...habit, punchCardImage: punchCardOptions[index]?.filename || '' });
  };

  // Handle transforming goal to habits
  const handleTransformGoal = async () => {
    if (!goalText.trim()) return;
    setGeneratingHabits(true);
    try {
      const suggestions = await transformGoalToHabits(goalText);
      setSuggestedHabits(suggestions);
      setSelectedSuggestionIndex(null); // Don't auto-select
    } catch (error) {
      console.error('Error transforming goal:', error);
      alert('Error generating habits. Try entering a habit directly.');
    } finally {
      setGeneratingHabits(false);
    }
  };

  // Handle when user selects a suggestion
  const handleSelectSuggestion = (index) => {
    setSelectedSuggestionIndex(index);
    const suggestion = suggestedHabits[index];
    setHabit({
      ...habit,
      title: suggestion.title,
      description: suggestion.description || '',
      targetPunches: 10,
      timeWindow: suggestion.frequency || 'daily'
    });
    setMode('habit'); // Switch to habit tab
  };

  const handleGetRewardSuggestions = async () => {
    if (!habit.title.trim()) {
      alert('Please enter a habit title first');
      return;
    }
    setShowRewardSuggestions(true);
    try {
      const suggestions = await generateRewardIdeas(habit.title);
      setRewardSuggestions(suggestions);
    } catch (error) {
      console.error('Error generating rewards:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!habit.title.trim()) {
      alert('Please enter a habit title');
      return;
    }
    if (!habit.punchCardImage) {
      alert('Please select a punch card design');
      return;
    }
    try {
      const habitData = {
        ...habit,
        icon1: selectedIcon1,
        icon2: selectedIcon2,
        layout: selectedCardLayout
      };
      await addHabit(userId, habitData);
      onClose();
    } catch (error) {
      alert('Error creating habit: ' + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden">
        {/* Header - CENTERED TITLE */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-5 flex items-center justify-center z-10 rounded-t-2xl relative">
          <h2 className="text-2xl font-bold text-white">Create New Habit</h2>
          <button
            onClick={onClose}
            className="absolute right-6 p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          {/* Mode Toggle */}
          <div className="flex gap-3 p-1.5 bg-gray-100 rounded-xl mb-8">
            <button
              type="button"
              onClick={() => setMode('habit')}
              className={`flex-1 py-3 px-2 rounded-lg font-medium transition-all ${
                mode === 'habit'
                  ? 'bg-white shadow-md text-purple-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              I have a habit
            </button>
            <button
              type="button"
              onClick={() => setMode('goal')}
              className={`flex-1 py-3 px-2 rounded-lg font-medium transition-all ${
                mode === 'goal'
                  ? 'bg-white shadow-md text-purple-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              I have a goal
            </button>
          </div>

          <div
            className={`grid gap-6 lg:gap-8 px-2 md:px-4 ${
            mode === 'goal'
            ? 'grid-cols-1 place-items-center'
            : 'grid-cols-1 lg:grid-cols-2'
            }`}
          >
            {/* Left Column: Form Inputs */}
            <div className="space-y-6 min-w-0 flex flex-col items-center justify-center w-full">
              {/* Goal Mode */}
              {mode === 'goal' && (
                <div className="w-full flex justify-center items-center">
                  <div className="w-full max-w-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Sparkles className="text-purple-600" size={24} />
                    <h3 className="font-semibold text-purple-900 text-lg">AI Habit Generator</h3>
                  </div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                    What goal do you want to achieve?
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none h-32 resize-none mb-3 break-words overflow-wrap-anywhere"
                    placeholder="e.g., I want to stop cramming for exams"
                    value={goalText}
                    onChange={(e) => setGoalText(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleTransformGoal}
                    disabled={generatingHabits || !goalText.trim()}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {generatingHabits ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        AI is thinking...
                      </>
                    ) : (
                      <>
                        <Wand2 size={18} />
                        Generate Habits
                      </>
                    )}
                  </button>
                  
                  {suggestedHabits.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="font-medium text-purple-900 text-sm text-center">Choose a suggestion:</p>
                      {suggestedHabits.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSelectSuggestion(index)}
                          className="w-full text-left p-4 rounded-xl border-2 transition-all hover:border-purple-400 hover:shadow-md bg-white border-purple-200 break-words overflow-wrap-anywhere"
                        >
                          <div className="font-bold text-gray-900 mb-1 break-words">{suggestion.title}</div>
                          <div className="text-sm text-gray-600 mb-1 break-words">{suggestion.description}</div>
                          <div className="text-xs text-purple-600">📅 {suggestion.frequency}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              )}

              {/* Habit Form */}
              {mode === 'habit' && (
                <div className="space-y-5 w-full max-w-xl mx-auto flex flex-col items-center">
                  {/* Title */}
                  <div className="w-full">
                    <label className="block text-sm font-semibold text-gray-700 mb-4 text-center">
                      Habit Title *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-lg break-words overflow-wrap-anywhere"
                      placeholder="e.g., Study for 30 minutes"
                      value={habit.title}
                      onChange={(e) => setHabit({ ...habit, title: e.target.value })}
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="w-full">
                    <label className="block text-sm font-semibold text-gray-700 mb-4 text-center">
                      Description (optional)
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none transition-colors break-words overflow-wrap-anywhere"
                      placeholder="e.g., Before breakfast"
                      value={habit.description}
                      onChange={(e) => setHabit({ ...habit, description: e.target.value })}
                    />
                  </div>

                  {/* Time Window */}
                  <div className="w-full flex flex-col items-center">
                    <label className="block text-sm font-semibold text-gray-700 mb-4 text-center">
                      How often? *
                    </label>
                    <div className="grid grid-cols-3 gap-3 w-full max-w-lg">
                      {['daily', 'weekly', 'custom'].map((window) => (
                        <button
                          key={window}
                          type="button"
                          onClick={() => setHabit({ ...habit, timeWindow: window })}
                          className={`py-4 rounded-xl border-2 transition-all capitalize font-medium ${
                            habit.timeWindow === window
                              ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-md'
                              : 'border-gray-200 hover:border-gray-300 text-gray-600'
                          }`}
                        >
                          {window}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reward */}
                  <div className="w-full">
                    <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
                      <label className="block text-sm font-semibold text-gray-700 text-center">
                        Reward when complete
                      </label>
                      <button
                        type="button"
                        onClick={handleGetRewardSuggestions}
                        className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1 font-medium"
                      >
                        <Sparkles size={14} />
                        AI suggestions
                      </button>
                    </div>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none transition-colors break-words overflow-wrap-anywhere"
                      placeholder="e.g., Treat myself to ice cream 🍦"
                      value={habit.reward}
                      onChange={(e) => setHabit({ ...habit, reward: e.target.value })}
                    />
                    {showRewardSuggestions && rewardSuggestions.length > 0 && (
                      <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto">
                        {rewardSuggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setHabit({ ...habit, reward: suggestion });
                              setShowRewardSuggestions(false);
                            }}
                            className="w-full text-left px-3 py-2.5 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm transition-colors border border-purple-100"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Icon Selection */}
                  <div className="w-full">
                    <label className="block text-sm font-semibold text-gray-700 mb-4 text-center">Choose Icons</label>
                    <div className="grid grid-cols-2 gap-4 w-full">
                      <div className="w-full">
                        <p className="text-xs font-medium text-gray-600 mb-2 text-center">Icon 1</p>
                        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl max-h-40 overflow-y-auto border-2 border-gray-200 justify-center w-full">
                          {iconOptions.map((icon) => (
                            <button
                              key={icon.id}
                              type="button"
                              onClick={() => {
                                setSelectedIcon1(icon.filename);
                                setHabit({ ...habit, icon1: icon.filename });
                              }}
                              className={`w-11 h-11 p-1.5 rounded-lg border-2 transition-all flex-shrink-0 ${
                                selectedIcon1 === icon.filename
                                  ? 'border-purple-500 bg-purple-100 scale-110 shadow-md'
                                  : 'border-gray-200 hover:border-gray-300 bg-white'
                              }`}
                            >
                              <img src={icon.url} alt={icon.name} className="w-full h-full object-contain" />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="w-full">
                        <p className="text-xs font-medium text-gray-600 mb-2 text-center">Icon 2</p>
                        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl max-h-40 overflow-y-auto border-2 border-gray-200 justify-center w-full">
                          {iconOptions.map((icon) => (
                            <button
                              key={icon.id}
                              type="button"
                              onClick={() => {
                                setSelectedIcon2(icon.filename);
                                setHabit({ ...habit, icon2: icon.filename });
                              }}
                              className={`w-11 h-11 p-1.5 rounded-lg border-2 transition-all flex-shrink-0 ${
                                selectedIcon2 === icon.filename
                                  ? 'border-purple-500 bg-purple-100 scale-110 shadow-md'
                                  : 'border-gray-200 hover:border-gray-300 bg-white'
                              }`}
                            >
                              <img src={icon.url} alt={icon.name} className="w-full h-full object-contain" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Right Column: Punch Card Selection & Preview */}
            {mode === 'habit' && (
              <div className="space-y-6 min-w-0 flex flex-col items-center w-full">
                {/* Punch Card Carousel */}
                <div className="w-full">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 text-center lg:text-left">Choose Punch Card Design</label>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border-2 border-gray-200 overflow-hidden">
                    <div className="w-full overflow-hidden">
                      <FramerCarousel 
                        punchCards={punchCardOptions}
                        activeIndex={selectedCardIndex}
                        onCardSelect={handleCardSelect}
                      />
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="w-full flex flex-col items-center">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 text-center lg:text-left w-full">Preview</label>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border-2 border-purple-200 w-full flex justify-center">
                    <div
                      className="relative rounded-2xl shadow-2xl overflow-hidden"
                      style={{
                        width: '100%',
                        maxWidth: '600px',
                        aspectRatio: '1004/591'
                      }}
                    >
                      <PunchCardPreview
                        key={`preview-${selectedCard?.filename}-${selectedCardLayout.title.fontFamily}`}
                        name={habit.title || 'Punch Pass Title'}
                        description={habit.description || 'Your description will appear here.'}
                        icon1={iconMap[selectedIcon1] || selectedIcon1}
                        icon2={iconMap[selectedIcon2] || selectedIcon2}
                        cardImage={punchCardMap[selectedCard?.filename] || punchCardMap['WindowsGreen.png']}
                        isDailyPunch={habit.timeWindow === 'daily'}
                        titlePlacement={selectedCardLayout.title}
                        descriptionPlacement={selectedCardLayout.description}
                        punchGridPlacement={selectedCardLayout.punchGrid}
                        currentPunches={0}
                        targetPunches={10}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-gray-700"
            >
              Cancel
            </button>
            {mode === 'habit' && (
              <button
                type="submit"
                className="flex-1 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
              >
                Create Habit
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}