import { useState } from 'react';
import { ArrowLeft, Egg, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import HatchedBunny from '@/features/bunny/HatchedBunny';
import { RARITY_META } from '@/features/gacha/gachaCatalog';
import usePets from './usePets';
import './PetsPage.css';

export default function PetsPage() {
  const navigate = useNavigate();
  const { variants, setActivePet, hatchEgg } = usePets();
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);

  const handleHatch = async (id) => {
    setBusy(`hatch:${id}`);
    setError(null);
    try {
      await hatchEgg(id);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  const handleSetActive = async (id) => {
    setBusy(`active:${id}`);
    try { await setActivePet(id); } finally { setBusy(null); }
  };

  return (
    <div className="pets-page">
      <header className="pets-header">
        <button className="pets-back" onClick={() => navigate('/student-id')}>
          <ArrowLeft size={18} /> Student ID
        </button>
        <h1 className="pets-title">Your Pets</h1>
        <div />
      </header>

      <p className="pets-lede">
        Each bunny has a different bonus. Hatch eggs from the Punchie Machine
        to discover new ones, then make any one your active companion.
      </p>

      {error && <p className="pets-error">{error}</p>}

      <div className="pets-grid">
        {variants.map((v) => {
          const rarityMeta = RARITY_META[v.rarity] || RARITY_META.common;
          const status = v.active ? 'active' : v.unlocked ? 'unlocked' : 'locked';
          return (
            <div
              key={v.id}
              className={`pets-card pets-card-${status}`}
              style={{
                borderColor: rarityMeta.accent,
                boxShadow: v.active && rarityMeta.glow !== 'none' ? rarityMeta.glow : undefined,
              }}
            >
              <div className="pets-card-rarity" style={{ color: rarityMeta.accent }}>
                {rarityMeta.label}
              </div>

              <div className="pets-card-bunny">
                {v.unlocked ? (
                  <HatchedBunny kind={v.id} size={120} />
                ) : (
                  <div className="pets-card-locked-art">
                    {v.eggsHeld > 0 ? <Egg size={56} /> : <Lock size={42} />}
                  </div>
                )}
              </div>

              <div className="pets-card-name">{v.name}</div>
              <div className="pets-card-tag">{v.tagline}</div>
              <div className="pets-card-bonus">{v.bonusLabel}</div>

              <div className="pets-card-action">
                {v.active && <span className="pets-pill pets-pill-active">★ Active</span>}
                {!v.active && v.unlocked && (
                  <button
                    className="pets-btn pets-btn-primary"
                    disabled={!!busy}
                    onClick={() => handleSetActive(v.id)}
                  >
                    {busy === `active:${v.id}` ? 'Switching…' : 'Make active'}
                  </button>
                )}
                {!v.unlocked && v.canHatch && (
                  <button
                    className="pets-btn pets-btn-hatch"
                    disabled={!!busy}
                    onClick={() => handleHatch(v.id)}
                  >
                    {busy === `hatch:${v.id}` ? 'Hatching…' : `Hatch egg (${v.eggsHeld})`}
                  </button>
                )}
                {!v.unlocked && !v.canHatch && (
                  <span className="pets-pill pets-pill-locked">{v.hint}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
