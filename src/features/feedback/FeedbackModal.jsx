/**
 * FeedbackModal — collects user feedback and writes it to the top-level
 * `feedback` Firestore collection. Each submission includes uid, email,
 * message, an optional category, and a server-side createdAt timestamp.
 */
import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { MessageSquare, X } from 'lucide-react';
import { db } from '@/services/firebase';
import { useAuth } from '@/features/auth/useAuth';
import './FeedbackModal.css';

const CATEGORIES = [
  { id: 'bug', label: 'Bug' },
  { id: 'idea', label: 'Idea' },
  { id: 'love', label: 'Love letter' },
  { id: 'other', label: 'Other' },
];

export default function FeedbackModal({ onClose }) {
  const { user } = useAuth();
  const [category, setCategory] = useState('idea');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  const trimmed = message.trim();
  const canSubmit = trimmed.length > 0 && !busy;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      await addDoc(collection(db, 'feedback'), {
        uid: user?.uid || null,
        email: user?.email || null,
        displayName: user?.displayName || null,
        category,
        message: trimmed,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        createdAt: serverTimestamp(),
      });
      setSent(true);
    } catch (err) {
      console.error('Feedback submit failed:', err);
      setError('Could not send. Try again.');
      setBusy(false);
    }
  };

  return (
    <div className="fbm-backdrop" onClick={onClose}>
      <div className="fbm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="fbm-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        {sent ? (
          <div className="fbm-thanks">
            <div className="fbm-thanks-icon">✦</div>
            <h2 className="fbm-title">Thank you</h2>
            <p className="fbm-body">
              Your feedback was sent. We read every note.
            </p>
            <button className="fbm-cta" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div className="fbm-eyebrow">
              <MessageSquare size={14} /> SEND FEEDBACK
            </div>
            <h2 className="fbm-title">Tell us what's on your mind</h2>
            <p className="fbm-body">
              Bug reports, ideas, kind words — all welcome.
            </p>

            <div className="fbm-categories">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`fbm-cat ${category === c.id ? 'is-active' : ''}`}
                  onClick={() => setCategory(c.id)}
                  disabled={busy}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <textarea
              className="fbm-textarea"
              placeholder="What would you like us to know?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={2000}
              rows={5}
              disabled={busy}
              autoFocus
            />
            <div className="fbm-counter">{trimmed.length}/2000</div>

            {error && <div className="fbm-error">{error}</div>}

            <button
              className="fbm-cta"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {busy ? 'Sending…' : 'Send feedback'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
