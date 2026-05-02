import { useState } from 'react';
import { ArrowLeft, Egg, Lock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import HatchedBunny from '@/features/bunny/HatchedBunny';
import HatchAnimation from '@/features/bunny/HatchAnimation';
import { RARITY_META } from '@/features/gacha/gachaCatalog';
import { describeNextUpgrade, MAX_PET_UPGRADE } from './petBonus';
import usePets from './usePets';
import './PetsPage.css';

export default function PetsPage() {
  const navigate = useNavigate();
  const { variants, setActivePet, hatchEgg, enhancePet } = usePets();
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);
  const [hatchingKind, setHatchingKind] = useState(null);
  const [enhanceFlash, setEnhanceFlash] = useState(null);

  const handleHatch = async (id) => {
    setBusy(`hatch:${id}`);
    setError(null);
    try {
      await hatchEgg(id);
      setHatchingKind(id);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  const handleEnhance = async (id) => {
    setBusy(`enhance:${id}`);
    setError(null);
    try {
      const { level } = await enhancePet(id);
      setEnhanceFlash({ id, level });
      setTimeout(() => setEnhanceFlash((f) => (f?.id === id ? null : f)), 2200);
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

              <div className="pets-card-name">
                {v.name}
                {v.unlocked && v.upgradeLevel > 0 && (
                  <span className="pets-card-lv" title={`Upgrade level ${v.upgradeLevel}/${MAX_PET_UPGRADE}`}>
                    +{v.upgradeLevel}
                  </span>
                )}
              </div>
              <div className="pets-card-tag">{v.tagline}</div>
              <div className="pets-card-bonus">{v.bonusLabel}</div>

              {v.unlocked && v.enhanceable && (
                <div className="pets-card-upgrade">
                  <div className="pets-upgrade-bar" aria-hidden>
                    <div
                      className="pets-upgrade-fill"
                      style={{ width: `${(v.upgradeLevel / MAX_PET_UPGRADE) * 100}%` }}
                    />
                  </div>
                  <div className="pets-upgrade-label">
                    Lv {v.upgradeLevel}/{MAX_PET_UPGRADE}
                    {!v.atMaxUpgrade && describeNextUpgrade(v.id, v.upgradeLevel) && (
                      <> · next: {describeNextUpgrade(v.id, v.upgradeLevel)}</>
                    )}
                  </div>
                  {enhanceFlash?.id === v.id && (
                    <div className="pets-upgrade-flash">↑ Lv {enhanceFlash.level}!</div>
                  )}
                </div>
              )}

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
                {v.unlocked && v.enhanceable && !v.atMaxUpgrade && (
                  <button
                    className="pets-btn pets-btn-enhance"
                    disabled={!!busy || !v.canEnhance}
                    onClick={() => handleEnhance(v.id)}
                    title={`Fuse ${v.nextUpgradeCost} ${v.name} egg${v.nextUpgradeCost === 1 ? '' : 's'} to upgrade this bunny's bonus`}
                  >
                    <Sparkles size={14} />
                    {busy === `enhance:${v.id}`
                      ? 'Enhancing…'
                      : `Enhance ${v.eggsHeld}/${v.nextUpgradeCost}`}
                  </button>
                )}
                {v.unlocked && v.enhanceable && v.atMaxUpgrade && (
                  <span className="pets-pill pets-pill-max">Max enhanced</span>
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

      {hatchingKind && (
        <HatchAnimation
          kind={hatchingKind}
          onClose={() => setHatchingKind(null)}
        />
      )}
    </div>
  );
}
