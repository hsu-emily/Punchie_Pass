import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Loader2, Heart, MessageCircle } from 'lucide-react';
import { useHabitStore } from "@/features/habits/habitStore";
// AI features disabled for debugging
// import { analyzeReflection } from "@/services/geminiService";
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from "@/services/firebase";
import { useAuth } from "@/features/auth/useAuth";

export default function ReflectionModal({ onClose }) {
  const { user } = useAuth();
  const habits = useHabitStore(state => state.habits);
  const [reflection, setReflection] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('input'); // 'input', 'feedback', or 'conversation'
  const [coachFeedback, setCoachFeedback] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [journalId, setJournalId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (step === 'conversation') {
      scrollToBottom();
    }
  }, [messages, step]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reflection.trim()) return;

    setLoading(true);
    try {
      // Save initial reflection to reflections collection (old format for compatibility)
      if (user) {
        await addDoc(collection(db, 'reflections'), {
          userId: user.uid,
          text: reflection,
          habits: habits.map(h => ({
            id: h.id,
            title: h.title,
            currentPunches: h.currentPunches,
            targetPunches: h.targetPunches
          })),
          createdAt: new Date().toISOString()
        });
      }

      // AI features disabled for debugging
      // const feedback = await analyzeReflection(reflection, habits, {});
      // if (feedback) {
      //   setCoachFeedback(feedback);
      //   setStep('feedback');
      // } else {
      //   alert('Reflection saved! AI analysis unavailable at the moment.');
      //   onClose();
      // }
      alert('Reflection saved! AI features are disabled for debugging.');
      onClose();
    } catch (error) {
      console.error('Error saving reflection:', error);
      alert('Error saving reflection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startConversation = async () => {
    // Initialize conversation with the reflection and AI response
    const initialMessages = [
      {
        id: 1,
        type: 'user',
        content: reflection,
        timestamp: new Date()
      },
      {
        id: 2,
        type: 'ai',
        content: coachFeedback.message,
        suggestions: coachFeedback.suggestions || [],
        timestamp: new Date()
      }
    ];

    setMessages(initialMessages);
    setStep('conversation');

    // Save to journals collection
    if (user) {
      try {
        const journalEntry = {
          userId: user.uid,
          conversation: initialMessages.map(msg => ({
            type: msg.type,
            content: msg.content,
            timestamp: msg.timestamp.toISOString(),
            suggestions: msg.suggestions || null
          })),
          habits: habits.map(h => ({
            id: h.id,
            title: h.title,
            currentPunches: h.currentPunches,
            targetPunches: h.targetPunches
          })),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const docRef = await addDoc(collection(db, 'journals'), journalEntry);
        setJournalId(docRef.id);
      } catch (error) {
        console.error('Error saving to journal:', error);
      }
    }

    // Focus input
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const saveToJournal = async (newMessages) => {
    try {
      if (!user || !journalId) return;

      await updateDoc(doc(db, 'journals', journalId), {
        conversation: newMessages.map(msg => ({
          type: msg.type,
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
          suggestions: msg.suggestions || null
        })),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving to journal:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      // AI features disabled for debugging
      // const response = await analyzeReflection(
      //   input.trim(),
      //   habits,
      //   { conversationHistory: messages }
      // );
      //
      // const aiMessage = {
      //   id: messages.length + 2,
      //   type: 'ai',
      //   content: response.message || "I understand. Tell me more about that.",
      //   suggestions: response.suggestions || [],
      //   timestamp: new Date()
      // };
      const aiMessage = {
        id: messages.length + 2,
        type: 'ai',
        content: "[AI disabled for debugging]",
        suggestions: [],
        timestamp: new Date()
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      await saveToJournal(finalMessages);
    } catch (error) {
      console.error('Error getting AI response:', error);

      const errorMessage = {
        id: messages.length + 2,
        type: 'ai',
        content: "I'm having trouble responding right now. But I'm listening - please continue sharing.",
        timestamp: new Date()
      };

      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      await saveToJournal(finalMessages);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSuggestionClick = async (suggestion) => {
    if (loading) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: `Tell me more about: ${suggestion}`,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      // AI features disabled for debugging
      // const response = await analyzeReflection(
      //   `The user wants to explore this suggestion: ${suggestion}`,
      //   habits,
      //   { conversationHistory: messages }
      // );
      //
      // const aiMessage = {
      //   id: messages.length + 2,
      //   type: 'ai',
      //   content: response.message || `Let's dive deeper into: ${suggestion}`,
      //   suggestions: response.suggestions || [],
      //   timestamp: new Date()
      // };
      const aiMessage = {
        id: messages.length + 2,
        type: 'ai',
        content: `[AI disabled for debugging] (suggestion: ${suggestion})`,
        suggestions: [],
        timestamp: new Date()
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      await saveToJournal(finalMessages);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorMessage = {
        id: messages.length + 2,
        type: 'ai',
        content: "Let me think about that... What specifically would you like to know?",
        timestamp: new Date()
      };
      
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      await saveToJournal(finalMessages);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-center rounded-t-2xl relative z-10">
          <h2 className="text-2xl font-bold text-white text-center">
            {step === 'conversation' ? 'Reflection Chat' : 'Weekly Reflection'}
          </h2>
          <button
            onClick={onClose}
            className="absolute right-4 p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
          >
            <X size={22} />
          </button>
        </div>

        {step === 'input' ? (
          // STEP 1: Initial Reflection Input
          <form
            onSubmit={handleSubmit}
            className="p-6 md:p-8 space-y-6 flex flex-col items-center"
          >
            <div className="max-w-2xl w-full mx-auto space-y-3">
              <label className="block text-sm font-semibold text-gray-800 text-center">
                How did this week feel?
              </label>
              <textarea
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none h-32 resize-none transition-colors"
                placeholder="Share what went well, what was challenging, which habits felt easy or hard..."
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="max-w-2xl w-full mx-auto bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="flex flex-col items-center text-center gap-2">
                <Sparkles className="text-purple-600" size={20} />
                <div>
                  <p className="font-medium text-purple-900">AI Coach</p>
                  <p className="text-sm text-purple-700 mt-1">
                    Our AI will analyze your reflection and provide personalized suggestions to help you improve.
                  </p>
                </div>
              </div>
            </div>

            <div className="max-w-2xl w-full mx-auto flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Get AI Feedback
                    <Sparkles size={20} />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : step === 'feedback' ? (
          // STEP 2: AI Feedback with option to continue conversation
          <div className="p-6 md:p-8 space-y-6 flex flex-col items-center">
            <div className="max-w-2xl w-full mx-auto space-y-6">
              {coachFeedback?.message && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
                  <div className="flex flex-col items-center text-center gap-3">
                    <Heart className="text-purple-600 flex-shrink-0" size={24} />
                    <div>
                      <h3 className="font-bold text-purple-900 mb-2">
                        Your AI Coach
                      </h3>
                      <p className="text-gray-800 leading-relaxed">
                        {coachFeedback.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {coachFeedback?.suggestions && coachFeedback.suggestions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-gray-800 mb-1 flex items-center justify-center gap-2 text-center">
                    <Sparkles className="text-purple-600" size={20} />
                    <span>Personalized Suggestions</span>
                  </h3>
                  <div className="space-y-2">
                    {coachFeedback.suggestions.map((suggestion, idx) => (
                      <div
                        key={idx}
                        className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-colors"
                      >
                        <div className="flex items-start gap-3 justify-center">
                          <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-purple-600 font-bold text-sm">
                              {idx + 1}
                            </span>
                          </div>
                          <p className="text-gray-800 text-left">
                            {suggestion}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="max-w-2xl w-full mx-auto flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Done
              </button>
              <button
                onClick={startConversation}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle size={20} />
                Continue Conversation
              </button>
            </div>
          </div>
        ) : (
          // STEP 3: Ongoing Conversation
          <div className="flex flex-col h-[75vh]">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.type === 'ai' && (
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="text-purple-600" size={16} />
                        <span className="text-xs font-semibold text-purple-600">AI Coach</span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="text-purple-600" size={14} />
                          <span className="text-xs font-semibold text-purple-600">Explore these:</span>
                        </div>
                        {message.suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick(suggestion)}
                            disabled={loading}
                            className="w-full text-left bg-white hover:bg-purple-50 border-2 border-purple-200 hover:border-purple-400 rounded-lg px-3 py-2 text-sm text-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin text-purple-600" size={16} />
                      <span className="text-sm text-gray-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 px-6 py-4 flex-shrink-0">
              <div className="flex gap-3 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Share your thoughts..."
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none resize-none min-h-[60px] max-h-[120px]"
                  rows={2}
                  disabled={loading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={loading || !input.trim()}
                  className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send size={20} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}