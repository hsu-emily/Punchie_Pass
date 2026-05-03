import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import usePremium, {
  FREE_HABIT_LIMIT,
  PREMIUM_BONUS_UPLOAD_SLOTS,
  PREMIUM_COIN_MULTIPLIER,
  PREMIUM_PRICE_USD,
} from './usePremium';
import './PremiumPaywall.css';

const PERKS = [
  {
    title: 'Unlimited habits',
    body: `Free accounts are capped at ${FREE_HABIT_LIMIT}. Premium lifts the cap entirely.`,
  },
  {
    title: `${PREMIUM_COIN_MULTIPLIER}× coin boost`,
    body: 'Every completed pass earns five times the gacha tokens.',
  },
  {
    title: `+${PREMIUM_BONUS_UPLOAD_SLOTS} custom icon slots`,
    body: 'Upload your own punch icons without grinding shards.',
  },
  {
    title: 'Support future development',
    body: 'Keep Punchie World growing — more bunnies, pets, and skins.',
  },
];

export default function PremiumPaywall({ onClose, headline }) {
  const { subscribe } = usePremium();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const handleSubscribe = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await subscribe();
      onClose?.();
    } catch (err) {
      console.error('Subscribe failed:', err);
      setError('Something went wrong. Try again.');
      setBusy(false);
    }
  };

  return (
    <div className="ppw-backdrop" onClick={onClose}>
      <div className="ppw-modal" onClick={(e) => e.stopPropagation()}>
        <button className="ppw-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className="ppw-eyebrow">
          <Sparkles size={14} /> PUNCHIE PASS+
        </div>
        <h2 className="ppw-title">
          {headline || 'Go premium for the full experience'}
        </h2>

        <ul className="ppw-perks">
          {PERKS.map((p) => (
            <li key={p.title} className="ppw-perk">
              <span className="ppw-perk-dot" />
              <div>
                <div className="ppw-perk-title">{p.title}</div>
                <div className="ppw-perk-body">{p.body}</div>
              </div>
            </li>
          ))}
        </ul>

        <div className="ppw-price-row">
          <span className="ppw-price">${PREMIUM_PRICE_USD.toFixed(2)}</span>
          <span className="ppw-period">/ year</span>
        </div>

        {error && <div className="ppw-error">{error}</div>}

        <button
          className="ppw-cta"
          onClick={handleSubscribe}
          disabled={busy}
        >
          {busy ? 'Activating…' : 'Subscribe'}
        </button>

        <p className="ppw-fineprint">
          Renews yearly. Cancel anytime from your Student ID.
        </p>
      </div>
    </div>
  );
}
