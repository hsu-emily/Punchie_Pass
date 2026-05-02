import { useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useGacha from './useGacha';
import GachaItemArt from './GachaItemArt';
import { GACHA_KINDS, RARITY_META } from './gachaCatalog';
import './InventoryPage.css';

const KIND_LABEL = {
  cursor:              'Cursors',
  icon:                'Punch Stamps',
  'pass-template':     'Card Templates',
  egg:                 'Eggs',
  sticker:             'Stickers',
  decoration:          'Decorations',
  'avatar-decoration': 'Avatar Charms',
};

export default function InventoryPage() {
  const navigate = useNavigate();
  const { inventoryList } = useGacha();
  const [filter, setFilter] = useState('all');

  const grouped = useMemo(() => {
    const byKind = {};
    for (const it of inventoryList) {
      (byKind[it.kind] ||= []).push(it);
    }
    return byKind;
  }, [inventoryList]);

  const visibleKinds = filter === 'all'
    ? GACHA_KINDS.filter((k) => grouped[k]?.length)
    : (grouped[filter]?.length ? [filter] : []);

  return (
    <div className="inv-page">
      <header className="inv-header">
        <button className="inv-back" onClick={() => navigate('/student-id')}>
          <ArrowLeft size={18} /> Student ID
        </button>
        <h1 className="inv-title">Your Inventory</h1>
        <div />
      </header>

      <p className="inv-lede">
        Everything you've pulled from the Punchie Machine, sorted by kind and
        rarity.
      </p>

      <div className="inv-filter-row">
        <button
          className={`inv-filter ${filter === 'all' ? 'is-active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All <span className="inv-filter-count">{inventoryList.length}</span>
        </button>
        {GACHA_KINDS.map((k) => {
          const count = grouped[k]?.length || 0;
          if (!count && filter !== k) return null;
          return (
            <button
              key={k}
              className={`inv-filter ${filter === k ? 'is-active' : ''}`}
              onClick={() => setFilter(k)}
            >
              {KIND_LABEL[k] || k} <span className="inv-filter-count">{count}</span>
            </button>
          );
        })}
      </div>

      {inventoryList.length === 0 ? (
        <div className="inv-empty">
          <p>Your inventory is empty.</p>
          <button className="inv-cta" onClick={() => navigate('/gacha')}>
            ✦ Pull at the Punchie Machine
          </button>
        </div>
      ) : visibleKinds.length === 0 ? (
        <p className="inv-empty-line">Nothing in this category yet.</p>
      ) : (
        visibleKinds.map((kind) => (
          <section key={kind} className="inv-group">
            <div className="inv-group-head">
              <h2 className="inv-group-label">{KIND_LABEL[kind] || kind}</h2>
              <span className="inv-group-sub">{grouped[kind].length}</span>
            </div>
            <div className="inv-grid">
              {grouped[kind].map((it) => {
                const meta = RARITY_META[it.rarity] || RARITY_META.common;
                return (
                  <div
                    key={it.id}
                    className="inv-tile"
                    style={{ borderColor: meta.accent }}
                    title={`${meta.label} · ${it.kind}`}
                  >
                    <div className="inv-art"><GachaItemArt item={it} size={72} /></div>
                    <div className="inv-name">{it.name}</div>
                    <div className="inv-meta">
                      <span style={{ color: meta.accent }}>{meta.label}</span>
                      {it.count > 1 && <span className="inv-dupe">×{it.count}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
