import { useMemo, useState } from 'react';
import { ArrowLeft, Recycle, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useGacha from './useGacha';
import useUploadSlots from './useUploadSlots';
import GachaItemArt from './GachaItemArt';
import ShardIcon from './ShardIcon';
import { GACHA_KINDS, RARITY_META, SHARD_VALUE } from './gachaCatalog';
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
  const { inventoryList, shards, recycle, recycleAll } = useGacha();
  const { slotsUnlocked, nextSlotIndex, nextSlotCost, canUnlockNext, unlockNextSlot } =
    useUploadSlots();
  const [filter, setFilter] = useState('all');
  const [busyId, setBusyId] = useState(null);
  const [flash, setFlash] = useState(null);

  // Sum of every duplicate across the inventory and the shards they'd yield.
  const dupeTotals = useMemo(() => {
    let dupes = 0;
    let value = 0;
    for (const it of inventoryList) {
      if (it.kind === 'egg') continue;
      const extra = (it.count || 1) - 1;
      if (extra <= 0) continue;
      dupes += extra;
      value += (SHARD_VALUE[it.rarity] || 1) * extra;
    }
    return { dupes, value };
  }, [inventoryList]);

  const showFlash = (msg, ms = 1800) => {
    setFlash({ id: Date.now(), msg });
    setTimeout(() => setFlash((f) => (f && Date.now() - f.id >= ms ? null : f)), ms);
  };

  const handleRecycle = async (item) => {
    setBusyId(item.id);
    try {
      const dupes = (item.count || 1) - 1;
      const { shards: gained, recycled } = await recycle(item.id, dupes);
      showFlash(`+${gained} shards · ${recycled} recycled`);
    } catch (err) {
      console.error('Recycle failed:', err);
    } finally {
      setBusyId(null);
    }
  };

  const handleRecycleAll = async () => {
    setBusyId('all');
    try {
      const { shards: gained, recycled } = await recycleAll();
      if (recycled === 0) showFlash('No duplicates to recycle');
      else showFlash(`+${gained} shards · ${recycled} recycled`, 2400);
    } catch (err) {
      console.error('Recycle all failed:', err);
    } finally {
      setBusyId(null);
    }
  };

  const handleUnlockSlot = async () => {
    setBusyId('slot');
    try {
      await unlockNextSlot();
      showFlash('New upload slot unlocked!', 2400);
    } catch (err) {
      console.error('Unlock slot failed:', err);
    } finally {
      setBusyId(null);
    }
  };

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
        Everything you've pulled from the Punchie Machine. Recycle duplicates
        for shards, then spend shards on more upload slots.
      </p>

      <section className="inv-shards-card">
        <div className="inv-shards-row">
          <div className="inv-shards-balance">
            <span className="inv-shards-num"><ShardIcon size={20} /> {shards}</span>
            <span className="inv-shards-label">shards</span>
          </div>
          <div className="inv-shards-stat">
            <span className="inv-shards-num-sm">{slotsUnlocked}</span>
            <span className="inv-shards-label">upload slot{slotsUnlocked === 1 ? '' : 's'}</span>
          </div>
          <div className="inv-shards-actions">
            <button
              className="inv-shards-btn inv-shards-btn-ghost"
              onClick={handleRecycleAll}
              disabled={dupeTotals.dupes === 0 || busyId === 'all'}
              title={dupeTotals.dupes === 0
                ? 'No duplicates to recycle'
                : `Recycle ${dupeTotals.dupes} duplicate${dupeTotals.dupes === 1 ? '' : 's'} for ${dupeTotals.value} shards`}
            >
              <Recycle size={14} />
              {busyId === 'all'
                ? 'Recycling…'
                : <>Recycle all · <ShardIcon size={14} /> {dupeTotals.value}</>}
            </button>
            <button
              className="inv-shards-btn"
              onClick={handleUnlockSlot}
              disabled={!canUnlockNext || busyId === 'slot'}
              title={canUnlockNext
                ? `Unlock upload slot ${nextSlotIndex} for ${nextSlotCost} shards`
                : `Need ${nextSlotCost - shards} more shards`}
            >
              <Upload size={14} />
              {busyId === 'slot'
                ? 'Unlocking…'
                : <>Unlock slot {nextSlotIndex} · <ShardIcon size={14} /> {nextSlotCost}</>}
            </button>
          </div>
        </div>
      </section>

      {flash && (
        <div className="inv-toast" key={flash.id} role="status">
          <ShardIcon size={16} /> {flash.msg}
        </div>
      )}

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
                const isEgg = it.kind === 'egg';
                const dupes = (it.count || 1) - 1;
                const canRecycle = !isEgg && dupes > 0;
                const shardValue = SHARD_VALUE[it.rarity] || 1;
                const Tile = isEgg ? 'button' : 'div';
                return (
                  <Tile
                    key={it.id}
                    className={`inv-tile ${isEgg ? 'inv-tile-egg' : ''}`}
                    style={{ borderColor: meta.accent }}
                    title={isEgg ? 'Hatch in Pets' : `${meta.label} · ${it.kind}`}
                    onClick={isEgg ? () => navigate('/pets') : undefined}
                  >
                    <div className="inv-art"><GachaItemArt item={it} size={72} /></div>
                    <div className="inv-name">{it.name}</div>
                    <div className="inv-meta">
                      <span style={{ color: meta.accent }}>{meta.label}</span>
                      {it.count > 1 && <span className="inv-dupe">×{it.count}</span>}
                    </div>
                    {isEgg && <div className="inv-tile-cta">Tap to hatch →</div>}
                    {canRecycle && (() => {
                      const totalGain = shardValue * dupes;
                      return (
                        <button
                          type="button"
                          className="inv-tile-recycle"
                          disabled={busyId === it.id}
                          onClick={(e) => { e.stopPropagation(); handleRecycle(it); }}
                          title={`Recycle all ${dupes} duplicate${dupes === 1 ? '' : 's'} for ${totalGain} shard${totalGain === 1 ? '' : 's'}`}
                        >
                          <Recycle size={12} /> <ShardIcon size={12} /> {totalGain}
                          <span className="inv-tile-recycle-x">×{dupes}</span>
                        </button>
                      );
                    })()}
                  </Tile>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
