import { useEffect, useRef, useState } from 'react';
import {
  generateRewardIdeas,
  transformGoalToHabits,
} from '@/services/geminiService';
import './AiSuggest.css';

function Pill({ onClick, disabled, busy, children = '★ AI SUGGEST' }) {
  return (
    <button
      type="button"
      className="ai-pill"
      onClick={onClick}
      disabled={disabled || busy}
    >
      {busy ? '★ THINKING…' : children}
    </button>
  );
}

function Popover({ open, anchorRef, onClose, children }) {
  const popRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e) => {
      if (
        popRef.current?.contains(e.target) ||
        anchorRef.current?.contains(e.target)
      )
        return;
      onClose();
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open, anchorRef, onClose]);

  if (!open) return null;
  return (
    <div className="ai-popover" ref={popRef}>
      {children}
    </div>
  );
}

/**
 * Title suggestor: free-text "what are you trying to do?" → calls
 * transformGoalToHabits, surfaces the suggestions as clickable chips
 * that fill the parent's title (and optionally description + reward).
 */
export function AiTitleSuggest({ onApply, currentDescription }) {
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [goal, setGoal] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // Seed the goal field with the description if user typed one already
  useEffect(() => {
    if (open && !goal && currentDescription) setGoal(currentDescription);
  }, [open, currentDescription, goal]);

  const fetchSuggestions = async () => {
    if (!goal.trim()) return;
    setBusy(true);
    setError('');
    try {
      const habits = await transformGoalToHabits(goal.trim());
      setSuggestions(habits.slice(0, 4));
    } catch (e) {
      setError(e?.message || 'Could not reach the AI');
    } finally {
      setBusy(false);
    }
  };

  return (
    <span style={{ position: 'relative' }} ref={anchorRef}>
      <Pill onClick={() => setOpen((v) => !v)} busy={busy}>
        ★ AI SUGGEST
      </Pill>
      <Popover open={open} anchorRef={anchorRef} onClose={() => setOpen(false)}>
        <div className="ai-pop-head">What are you trying to build?</div>
        <div className="ai-pop-row">
          <input
            type="text"
            value={goal}
            placeholder="e.g. drink more water"
            onChange={(e) => setGoal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchSuggestions()}
            className="ai-pop-input"
            autoFocus
          />
          <button
            type="button"
            onClick={fetchSuggestions}
            disabled={busy || !goal.trim()}
            className="ai-pop-go"
          >
            {busy ? '…' : 'Go'}
          </button>
        </div>
        {error && <div className="ai-pop-error">{error}</div>}
        {suggestions.length > 0 && (
          <div className="ai-pop-chips">
            {suggestions.map((h, i) => (
              <button
                key={i}
                type="button"
                className="ai-pop-chip"
                onClick={() => {
                  onApply({
                    title: h.title,
                    description: h.description,
                    frequency: h.frequency || 'daily',
                  });
                  setOpen(false);
                }}
                title={h.description}
              >
                {h.title}
              </button>
            ))}
          </div>
        )}
      </Popover>
    </span>
  );
}

/**
 * Reward suggestor: needs the current habit title; calls
 * generateRewardIdeas(title), surfaces 4-5 chips, one click fills.
 */
export function AiRewardSuggest({ habitTitle, onApply }) {
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const lastTitle = useRef(null);

  const fetchSuggestions = async (title) => {
    setBusy(true);
    setError('');
    try {
      const ideas = await generateRewardIdeas(title);
      setSuggestions(ideas.slice(0, 5));
      lastTitle.current = title;
    } catch (e) {
      setError(e?.message || 'Could not reach the AI');
    } finally {
      setBusy(false);
    }
  };

  const handleOpen = () => {
    const title = (habitTitle || '').trim();
    if (!title) {
      setOpen(true);
      setError('Add a title first, then I can suggest rewards.');
      setSuggestions([]);
      return;
    }
    setOpen(true);
    if (lastTitle.current !== title) fetchSuggestions(title);
  };

  return (
    <span style={{ position: 'relative' }} ref={anchorRef}>
      <Pill onClick={handleOpen} busy={busy}>★ AI SUGGEST</Pill>
      <Popover open={open} anchorRef={anchorRef} onClose={() => setOpen(false)}>
        <div className="ai-pop-head">
          {busy ? 'Thinking up rewards…' : 'Tap to use one:'}
        </div>
        {error && <div className="ai-pop-error">{error}</div>}
        {!busy && suggestions.length > 0 && (
          <div className="ai-pop-chips">
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                className="ai-pop-chip"
                onClick={() => {
                  onApply(s);
                  setOpen(false);
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </Popover>
    </span>
  );
}
