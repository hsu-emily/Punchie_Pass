/**
 * PremiumBanner — thin dashboard banner that pitches Punchie Pass+ to free
 * users. Renders nothing for active subscribers. Click opens the paywall.
 */
import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import usePremium, { PREMIUM_PRICE_USD } from './usePremium';
import PremiumPaywall from './PremiumPaywall';
import './PremiumBanner.css';

export default function PremiumBanner() {
  const { premium } = usePremium();
  const [paywallOpen, setPaywallOpen] = useState(false);

  if (premium) return null;

  return (
    <>
      <div className="pmb-banner" role="region" aria-label="Premium upgrade">
        <div className="pmb-text">
          <Sparkles size={14} className="pmb-spark" />
          <span className="pmb-headline">Unlock unlimited habits, 5× coins, and more uploads</span>
          <span className="pmb-price">${PREMIUM_PRICE_USD.toFixed(2)}/yr</span>
        </div>
        <button
          type="button"
          className="pmb-cta"
          onClick={() => setPaywallOpen(true)}
        >
          Get Premium
        </button>
      </div>
      {paywallOpen && <PremiumPaywall onClose={() => setPaywallOpen(false)} />}
    </>
  );
}
