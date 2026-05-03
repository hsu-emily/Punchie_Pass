/**
 * PremiumOffer — onboarding step that pitches Punchie Pass+ before the user
 * creates their first habit. Subscribing flips `profile.premium` and continues
 * to the next step; "Maybe later" simply continues without subscribing.
 */
import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import usePremium, {
  FREE_HABIT_LIMIT,
  PREMIUM_BONUS_UPLOAD_SLOTS,
  PREMIUM_COIN_MULTIPLIER,
  PREMIUM_PRICE_USD,
} from '@/features/premium/usePremium';
import './PremiumOffer.css';

const FREE_PERKS = [
  `${FREE_HABIT_LIMIT} habits at a time`,
  '1 custom icon upload slot',
  'Standard coin earnings',
];

const PREMIUM_PERKS = [
  'Unlimited habits',
  `+${PREMIUM_BONUS_UPLOAD_SLOTS} custom icon slots`,
  `${PREMIUM_COIN_MULTIPLIER}× coin boost from habits`,
  'Support future development',
];

export default function PremiumOffer({ onContinue }) {
  const { subscribe } = usePremium();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const handleSubscribe = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await subscribe();
      onContinue();
    } catch (err) {
      console.error('Subscribe failed:', err);
      setError('Something went wrong. Try again.');
      setBusy(false);
    }
  };

  return (
    <div className="pp-stage">
      <div className="pof-eyebrow">
        <Sparkles size={14} /> PUNCHIE PASS+
      </div>
      <h1 className="pp-h1">Want the full experience?</h1>
      <p className="pp-lede">
        Free is plenty to get started. Premium unlocks the cap and gives your
        bunny extra room to grow.
      </p>

      <div className="pof-compare">
        <div className="pof-tier pof-tier-free">
          <div className="pof-tier-head">
            <span className="pof-tier-name">Free</span>
            <span className="pof-tier-price">$0</span>
          </div>
          <ul className="pof-perks">
            {FREE_PERKS.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>

        <div className="pof-tier pof-tier-premium">
          <div className="pof-tier-head">
            <span className="pof-tier-name">
              <Sparkles size={12} /> Premium
            </span>
            <span className="pof-tier-price">
              ${PREMIUM_PRICE_USD.toFixed(2)}
              <span className="pof-period">/yr</span>
            </span>
          </div>
          <ul className="pof-perks">
            {PREMIUM_PERKS.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </div>

      {error && <div className="pof-error">{error}</div>}

      <div className="pof-actions">
        <button
          type="button"
          className="pp-btn pp-btn-ghost"
          onClick={onContinue}
          disabled={busy}
        >
          Maybe later
        </button>
        <button
          className="pp-btn pp-btn-primary pof-cta"
          onClick={handleSubscribe}
          disabled={busy}
        >
          {busy ? 'Activating…' : `Subscribe — $${PREMIUM_PRICE_USD.toFixed(2)}/yr`}
        </button>
      </div>
    </div>
  );
}
