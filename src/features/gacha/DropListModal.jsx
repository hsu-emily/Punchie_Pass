/**
 * DropListModal — every item the Punchie Machine can drop, with an Edit
 * mode that lets you rename and reorder items. Edits are stored in
 * localStorage and only affect this client's drop-list view.
 */
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronDown, ChevronUp, Pencil, RotateCcw, X } from 'lucide-react';
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

const STORAGE_KEY = 'punchie.dropListEdits';
// { renames: { [itemId]: string }, rarities: { [itemId]: rarity }, order: [itemId, ...] }
const EMPTY_EDITS = { renames: {}, rarities: {}, order: [] };

function loadEdits() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_EDITS;
    const parsed = JSON.parse(raw);
    return {
      renames: parsed.renames || {},
      rarities: parsed.rarities || {},
      order: Array.isArray(parsed.order) ? parsed.order : [],
    };
  } catch {
    return EMPTY_EDITS;
  }
}

function saveEdits(edits) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(edits));
}

/** Apply renames and reorder to the catalog. Unknown ids in `order` are
 *  ignored; items missing from `order` keep their catalog position at the
 *  end (preserving original relative ordering). */
function applyEdits(items, edits) {
  const transformed = items.map((it) => {
    const name = edits.renames[it.id] || it.name;
    const rarity = edits.rarities[it.id] || it.rarity;
    return name === it.name && rarity === it.rarity ? it : { ...it, name, rarity };
  });
  if (!edits.order.length) return transformed;
  const byId = new Map(transformed.map((it) => [it.id, it]));
  const ordered = [];
  const seen = new Set();
  for (const id of edits.order) {
    const it = byId.get(id);
    if (it && !seen.has(id)) {
      ordered.push(it);
      seen.add(id);
    }
  }
  for (const it of transformed) if (!seen.has(it.id)) ordered.push(it);
  return ordered;
}

export default function DropListModal({ onClose, ownedIds }) {
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState(false);
  const [edits, setEdits] = useState(loadEdits);

  useEffect(() => { saveEdits(edits); }, [edits]);

  const ownedSet = useMemo(() => ownedIds || new Set(), [ownedIds]);

  const totalWeight = useMemo(
    () => RARITY_ORDER.reduce((s, r) => s + (DEFAULT_WEIGHTS[r] || 0), 0),
    []
  );

  const allItems = useMemo(() => applyEdits(GACHA_ITEMS, edits), [edits]);

  const filtered = useMemo(
    () => filter === 'all' ? allItems : allItems.filter((it) => it.kind === filter),
    [allItems, filter]
  );

  const grouped = useMemo(() => {
    const out = Object.fromEntries(RARITY_ORDER.map((r) => [r, []]));
    for (const it of filtered) out[it.rarity]?.push(it);
    return out;
  }, [filtered]);

  const moveItem = (id, dir) => {
    setEdits((prev) => {
      // Build full ordered id list first (apply current order to all items).
      const fullOrdered = applyEdits(GACHA_ITEMS, prev).map((it) => it.id);
      const idx = fullOrdered.indexOf(id);
      if (idx < 0) return prev;
      const target = idx + dir;
      if (target < 0 || target >= fullOrdered.length) return prev;
      const next = [...fullOrdered];
      [next[idx], next[target]] = [next[target], next[idx]];
      return { ...prev, order: next };
    });
  };

  const renameItem = (id, name) => {
    setEdits((prev) => {
      const renames = { ...prev.renames };
      const original = GACHA_ITEMS.find((it) => it.id === id)?.name;
      if (!name || name === original) {
        delete renames[id];
      } else {
        renames[id] = name;
      }
      return { ...prev, renames };
    });
  };

  const cycleRarity = (id) => {
    setEdits((prev) => {
      const rarities = { ...prev.rarities };
      const original = GACHA_ITEMS.find((it) => it.id === id)?.rarity;
      const current = rarities[id] || original;
      const idx = RARITY_ORDER.indexOf(current);
      const nextRarity = RARITY_ORDER[(idx + 1) % RARITY_ORDER.length];
      if (nextRarity === original) {
        delete rarities[id];
      } else {
        rarities[id] = nextRarity;
      }
      return { ...prev, rarities };
    });
  };

  const resetEdits = () => setEdits(EMPTY_EDITS);

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
          {editing
            ? 'Rename items or use the arrows to reorder. Saves locally.'
            : 'Every possible pull, grouped by rarity. Items you already own are highlighted.'}
        </p>

        <div className="dlm-toolbar">
          <button
            className={`dlm-edit-btn ${editing ? 'is-active' : ''}`}
            onClick={() => setEditing((e) => !e)}
          >
            {editing ? <><Check size={14} /> Done</> : <><Pencil size={14} /> Edit list</>}
          </button>
          {editing && (
            <button className="dlm-reset-btn" onClick={resetEdits}>
              <RotateCcw size={14} /> Reset
            </button>
          )}
        </div>

        {!editing && (
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
        )}

        {editing ? (
          <EditList
            items={allItems}
            onMove={moveItem}
            onRename={renameItem}
            onCycleRarity={cycleRarity}
          />
        ) : (
          RARITY_ORDER.map((r) => {
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
          })
        )}
      </motion.div>
    </motion.div>
  );
}

function EditList({ items, onMove, onRename, onCycleRarity }) {
  return (
    <ol className="dlm-edit-list">
      {items.map((it, i) => {
        const meta = RARITY_META[it.rarity];
        return (
          <li key={it.id} className="dlm-edit-row" style={{ borderLeftColor: meta.accent }}>
            <div className="dlm-edit-index">{i + 1}</div>
            <div className="dlm-edit-art"><GachaItemArt item={it} size={42} /></div>
            <div className="dlm-edit-fields">
              <input
                className="dlm-edit-name"
                value={it.name}
                onChange={(e) => onRename(it.id, e.target.value)}
                aria-label="Item name"
              />
              <div className="dlm-edit-meta">
                <button
                  type="button"
                  className="dlm-edit-rarity-btn"
                  style={{ color: meta.accent, borderColor: meta.accent }}
                  onClick={() => onCycleRarity(it.id)}
                  title="Click to cycle rarity"
                >
                  ★ {meta.label}
                </button>
                <span className="dlm-edit-kind">
                  {KIND_LABEL[it.kind] || it.kind}
                </span>
              </div>
            </div>
            <div className="dlm-edit-controls">
              <button
                onClick={() => onMove(it.id, -1)}
                disabled={i === 0}
                aria-label="Move up"
              >
                <ChevronUp size={16} />
              </button>
              <button
                onClick={() => onMove(it.id, 1)}
                disabled={i === items.length - 1}
                aria-label="Move down"
              >
                <ChevronDown size={16} />
              </button>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
