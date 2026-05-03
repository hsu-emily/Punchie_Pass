/**
 * DropListModal — every item the Punchie Machine can drop, grouped by rarity.
 */
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import GachaItemArt from './GachaItemArt';
import {
  DEFAULT_WEIGHTS,
  GACHA_ITEMS,
  GACHA_KINDS,
  RARITY_META,
  RARITY_ORDER,
} from './gachaCatalog';
import './DropListModal.css';

const KIND_LABEL = {
  cursor:              'Cursor',
  icon:                'Punch Stamp',
  'pass-template':     'Card Template',
  egg:                 'Egg',
  sticker:             'Sticker',
  decoration:          'Decoration',
  'avatar-decoration': 'Avatar Charm',
  idSkin:              'ID Skin',
};

export default function DropListModal({ onClose, ownedIds }) {
  const [filter, setFilter] = useState('all');

  const ownedSet = useMemo(() => ownedIds || new Set(), [ownedIds]);

  const totalWeight = useMemo(
    () => RARITY_ORDER.reduce((s, r) => s + (DEFAULT_WEIGHTS[r] || 0), 0),
    []
  );

  const filtered = useMemo(
    () => filter === 'all' ? GACHA_ITEMS : GACHA_ITEMS.filter((it) => it.kind === filter),
    [filter]
  );

  const grouped = useMemo(() => {
    const out = Object.fromEntries(RARITY_ORDER.map((r) => [r, []]));
    for (const it of filtered) out[it.rarity]?.push(it);
    return out;
  }, [filtered]);

  return (
    <motion.div
      className="dlm-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="dlm-panel"
        initial={{ y: 20, scale: 0.96, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 12, scale: 0.96, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="dlm-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className="dlm-eyebrow">★ DROP LIST ★</div>
        <h2 className="dlm-title">What can drop?</h2>
        <p className="dlm-lede">
          Every possible pull, grouped by rarity. Items you already own are highlighted.
        </p>

        <div className="dlm-filter-row">
          <button
            className={`dlm-filter ${filter === 'all' ? 'is-active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          {GACHA_KINDS.map((k) => (
            <button
              key={k}
              className={`dlm-filter ${filter === k ? 'is-active' : ''}`}
              onClick={() => setFilter(k)}
            >
              {KIND_LABEL[k] || k}
            </button>
          ))}
        </div>

        {RARITY_ORDER.map((r) => {
          const items = grouped[r];
          if (!items?.length) return null;
          const meta = RARITY_META[r];
          const pct = ((DEFAULT_WEIGHTS[r] || 0) / totalWeight) * 100;
          return (
            <section key={r} className="dlm-group">
              <div className="dlm-group-head">
                <span className="dlm-group-label" style={{ color: meta.accent }}>
                  ★ {meta.label}
                </span>
                <span className="dlm-group-rate">{pct.toFixed(1)}% per pull</span>
              </div>
              <div className="dlm-grid">
                {items.map((it) => {
                  const owned = ownedSet.has(it.id);
                  return (
                    <div
                      key={it.id}
                      className={`dlm-tile ${owned ? 'is-owned' : ''}`}
                      style={{
                        borderColor: meta.accent,
                        boxShadow: owned && meta.glow !== 'none' ? meta.glow : undefined,
                      }}
                      title={owned ? 'In your inventory' : 'Not yet pulled'}
                    >
                      <div className="dlm-art"><GachaItemArt item={it} size={64} /></div>
                      <div className="dlm-name">{it.name}</div>
                      <div className="dlm-kind">{KIND_LABEL[it.kind] || it.kind}</div>
                      {owned && <span className="dlm-owned-pill">✓ Owned</span>}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
