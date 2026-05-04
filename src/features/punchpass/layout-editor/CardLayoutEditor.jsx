import { Check, ChevronDown, ChevronUp, Copy, Download, Upload } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getCardImageUrl } from '@/features/punchpass/PunchCard';
import PunchCardPreview from '@/features/punchpass/PunchCardPreview';
import { cardLayouts, getCardLayout } from '@/features/punchpass/cardLayouts.config';

// Assets are .webp on disk; cardLayouts config + user data use the original
// `.png` filename as the identifier, so we normalize back when listing names.
const toPngKey = (filename) => filename.replace(/\.webp$/i, '.png');

const punchCardModules = import.meta.glob('@/assets/punch_cards/*.webp', { eager: true });
const cardNames = Object.keys(punchCardModules)
  .map((p) => toPngKey(p.split('/').pop()))
  .sort();

const flatIconModules = import.meta.glob('@/assets/icons/*.webp', { eager: true });
const bucketIconModules = import.meta.glob('@/assets/icons/*/*.webp', { eager: true });
const iconChoices = [
  ...Object.keys(flatIconModules).map((p) => toPngKey(p.split('/').pop())),
  ...Object.keys(bucketIconModules).map((p) => {
    const parts = p.split('/');
    const file = parts.pop();
    const bucket = parts.pop();
    return `${bucket}/${file.replace(/\.webp$/i, '')}`;
  }),
].sort();

// Only fonts loaded by index.html. Adding new ones here without also adding
// them to the <link> in index.html will silently fall back at render time.
const fontOptions = [
  'Press Start 2P',
  'Great Vibes',
  'Dancing Script',
  'Cinzel',
  'Playfair Display',
  'Allura',
  'Parisienne',
  'Instrument Sans',
  'Fredoka',
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Courier New',
  'monospace',
  'serif',
  'sans-serif',
  'cursive',
];

const adjustPercentage = (value, delta) => {
  const m = String(value || '').match(/^(-?[\d.]+)(%)?$/);
  if (!m) return value;
  const next = parseFloat(m[1]) + delta;
  return `${next}${m[2] || '%'}`;
};

const adjustPixels = (value, delta) => {
  const m = String(value || '').match(/^([\d.]+)(px|rem|em)?$/);
  if (!m) return value;
  const next = Math.max(0, parseFloat(m[1]) + delta);
  return `${next}${m[2] || ''}`;
};

export default function CardLayoutEditor() {
  const [selectedCard, setSelectedCard] = useState(cardNames[0] || '');
  const [selectedIcon1, setSelectedIcon1] = useState(iconChoices.find((n) => n.includes('punch')) || iconChoices[0] || '');
  const [selectedIcon2, setSelectedIcon2] = useState(iconChoices[1] || iconChoices[0] || '');
  const [currentPunches, setCurrentPunches] = useState(3);
  const [targetPunches, setTargetPunches] = useState(10);

  const previewRef = useRef(null);
  const [previewDimensions, setPreviewDimensions] = useState({ width: 0, height: 0 });

  // Initialize state from the actual canonical layout for the selected card.
  const [layoutState, setLayoutState] = useState(() => getCardLayout(cardNames[0] || ''));

  // When the user picks a different card, load its real config into the form
  // so the editor shows the values that are actually in production.
  useEffect(() => {
    if (selectedCard) {
      setLayoutState(getCardLayout(selectedCard));
    }
  }, [selectedCard]);

  const setTitle = (k, v) => setLayoutState((s) => ({ ...s, title: { ...s.title, [k]: v } }));
  const setDesc = (k, v) => setLayoutState((s) => ({ ...s, description: { ...s.description, [k]: v } }));
  const setGrid = (k, v) => setLayoutState((s) => ({ ...s, punchGrid: { ...s.punchGrid, [k]: v } }));

  const previewHabit = useMemo(() => ({
    cardImage: selectedCard,
    title: 'Sample Title',
    description: 'This is a sample description text',
    icon1Id: selectedIcon1,
    icon2Id: selectedIcon2,
    currentPunches,
    targetPunches,
  }), [selectedCard, selectedIcon1, selectedIcon2, currentPunches, targetPunches]);

  // Override the resolved layout for live editing — PunchCard reads from
  // cardLayouts.config which is static, so we render PunchCard but pass our
  // edited layout values via a synthetic resolver. Simplest: render against
  // the in-state layout by feeding a one-off habit to PunchCard with the
  // selected card name (which it'll use to look up the static config) — but
  // we need the live values to win. Instead we render a "virtual card name"
  // by stashing our state into the cardLayouts map at render time.
  // Simpler still: pass the layout through a small inline preview.
  const livePreviewLayout = layoutState;

  const jsonOutput = useMemo(() => JSON.stringify(layoutState, null, 2), [layoutState]);

  const [copiedType, setCopiedType] = useState(null);
  const [importError, setImportError] = useState('');
  const [importText, setImportText] = useState('');

  const copy = async (text, type) => {
    await navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const copyAsEntry = () => {
    const code = `  '${selectedCard}': {\n` +
      `    title: ${JSON.stringify(layoutState.title, null, 6).replace(/\n/g, '\n    ')},\n` +
      `    description: ${JSON.stringify(layoutState.description, null, 6).replace(/\n/g, '\n    ')},\n` +
      `    punchGrid: ${JSON.stringify(layoutState.punchGrid, null, 6).replace(/\n/g, '\n    ')},\n` +
      `  },`;
    copy(code, 'entry');
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importText);
      if (!parsed.title || !parsed.description || !parsed.punchGrid) {
        throw new Error('Missing title / description / punchGrid');
      }
      setLayoutState({
        title: { ...layoutState.title, ...parsed.title },
        description: { ...layoutState.description, ...parsed.description },
        punchGrid: { ...layoutState.punchGrid, ...parsed.punchGrid },
      });
      setImportError('');
    } catch (err) {
      setImportError(`Invalid JSON: ${err.message}`);
    }
  };

  useEffect(() => {
    const update = () => {
      if (!previewRef.current) return;
      const r = previewRef.current.getBoundingClientRect();
      setPreviewDimensions({ width: Math.round(r.width), height: Math.round(r.height) });
    };
    update();
    window.addEventListener('resize', update);
    const ro = previewRef.current ? new ResizeObserver(update) : null;
    if (ro && previewRef.current) ro.observe(previewRef.current);
    return () => {
      window.removeEventListener('resize', update);
      if (ro) ro.disconnect();
    };
  }, [selectedCard]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-[1800px] mx-auto">
        <h1 className="text-3xl font-bold text-center mb-1 text-pink-600">Card Layout Editor</h1>
        <p className="text-center text-sm text-gray-600 mb-4">
          One layout per card. Renders identically on dashboard, modal, create form, and celebration.
        </p>

        {/* Top Controls Bar */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Card Image:</label>
              <select
                value={selectedCard}
                onChange={(e) => setSelectedCard(e.target.value)}
                className="w-full p-2 border rounded text-sm"
              >
                {cardNames.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              {!cardLayouts[selectedCard] && (
                <p className="text-xs text-amber-600 mt-1">No saved layout — using base defaults.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Icon 1:</label>
              <select value={selectedIcon1} onChange={(e) => setSelectedIcon1(e.target.value)} className="w-full p-2 border rounded text-sm">
                {iconChoices.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Icon 2:</label>
              <select value={selectedIcon2} onChange={(e) => setSelectedIcon2(e.target.value)} className="w-full p-2 border rounded text-sm">
                {iconChoices.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-2">Current:</label>
                <input type="number" value={currentPunches} onChange={(e) => setCurrentPunches(parseInt(e.target.value) || 0)} className="w-full p-2 border rounded text-sm" min="0" max={targetPunches} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Target:</label>
                <input type="number" value={targetPunches} onChange={(e) => setTargetPunches(parseInt(e.target.value) || 1)} className="w-full p-2 border rounded text-sm" min="1" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Preview */}
          <div className="xl:col-span-2 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-2">Live Preview</h2>
            <p className="text-xs text-gray-500 mb-4">
              Canonical 1004:591 box, max 600px wide — same as every other render site.
            </p>
            <div className="relative flex justify-center">
              <div ref={previewRef} className="border-4 border-pink-200 rounded-lg overflow-hidden" style={{ width: '100%', maxWidth: 600 }}>
                <LivePreview habit={previewHabit} layout={livePreviewLayout} />
              </div>
              {previewDimensions.width > 0 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm border-2 border-pink-300 rounded-md px-2 py-1 text-xs font-semibold text-pink-600 shadow-md">
                  {previewDimensions.width} × {previewDimensions.height} px
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-lg shadow-lg p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            <Section title="Title" tone="purple">
              <PercentField label="Top" value={layoutState.title.top} onChange={(v) => setTitle('top', v)} />
              <PercentField label="Left" value={layoutState.title.left} onChange={(v) => setTitle('left', v)} />
              <SelectField label="Text Align" value={layoutState.title.textAlign} onChange={(v) => setTitle('textAlign', v)} options={['left', 'center', 'right']} />
              <ColorField label="Color" value={layoutState.title.color} onChange={(v) => setTitle('color', v)} />
              <SizeField label="Font Size" value={layoutState.title.fontSize} onChange={(v) => setTitle('fontSize', v)} />
              <SelectField label="Font Family" value={layoutState.title.fontFamily} onChange={(v) => setTitle('fontFamily', v)} options={fontOptions} />
              <PercentField label="Width" value={layoutState.title.width} onChange={(v) => setTitle('width', v)} step={1} />
              <SelectField label="Font Weight" value={layoutState.title.fontWeight || 'bold'} onChange={(v) => setTitle('fontWeight', v)} options={['normal', 'bold', '300', '400', '500', '600', '700', '800', '900']} />
            </Section>

            <Section title="Description" tone="pink">
              <PercentField label="Top" value={layoutState.description.top} onChange={(v) => setDesc('top', v)} />
              <PercentField label="Left" value={layoutState.description.left} onChange={(v) => setDesc('left', v)} />
              <SelectField label="Text Align" value={layoutState.description.textAlign} onChange={(v) => setDesc('textAlign', v)} options={['left', 'center', 'right']} />
              <ColorField label="Color" value={layoutState.description.color} onChange={(v) => setDesc('color', v)} />
              <SizeField label="Font Size" value={layoutState.description.fontSize} onChange={(v) => setDesc('fontSize', v)} />
              <SelectField label="Font Family" value={layoutState.description.fontFamily} onChange={(v) => setDesc('fontFamily', v)} options={fontOptions} />
              <PercentField label="Width" value={layoutState.description.width} onChange={(v) => setDesc('width', v)} step={1} />
            </Section>

            <Section title="Punch Grid" tone="blue">
              <PercentField label="Top" value={layoutState.punchGrid.top} onChange={(v) => setGrid('top', v)} />
              <PercentField label="Left" value={layoutState.punchGrid.left} onChange={(v) => setGrid('left', v)} />
              <TextField label="Transform" value={layoutState.punchGrid.transform} onChange={(v) => setGrid('transform', v)} placeholder="translateX(-50%)" />
              <SizeField label="Circle Size" value={layoutState.punchGrid.punchCircleSize} onChange={(v) => setGrid('punchCircleSize', v)} step={1} />
              <SizeField label="Icon Size" value={layoutState.punchGrid.punchIconSize} onChange={(v) => setGrid('punchIconSize', v)} step={1} />
              <SizeField label="Horizontal Gap" value={layoutState.punchGrid.punchHorizontalGap} onChange={(v) => setGrid('punchHorizontalGap', v)} step={1} />
              <SizeField label="Vertical Gap" value={layoutState.punchGrid.punchVerticalGap} onChange={(v) => setGrid('punchVerticalGap', v)} step={1} />
              <NumberField label="Rows" value={layoutState.punchGrid.numRows} onChange={(v) => setGrid('numRows', v)} />
              <NumberField label="Per Row" value={layoutState.punchGrid.punchesPerRow} onChange={(v) => setGrid('punchesPerRow', v)} />
            </Section>

            {/* Export & Import */}
            <div className="mb-4 border-t pt-4">
              <h3 className="text-lg font-bold mb-3 text-gray-800">Export & Import</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <CopyButton onClick={() => copy(jsonOutput, 'json')} label="Copy JSON" copied={copiedType === 'json'} tone="purple" />
                <CopyButton onClick={copyAsEntry} label="Copy as Config Entry" copied={copiedType === 'entry'} tone="blue" />
              </div>

              <div className="mb-4 p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  <Upload size={16} className="inline mr-1" />
                  Import Layout (Paste JSON)
                </label>
                <textarea
                  value={importText}
                  onChange={(e) => { setImportText(e.target.value); setImportError(''); }}
                  placeholder='Paste JSON layout (must include title, description, punchGrid)'
                  className="w-full p-2 border-2 border-gray-300 rounded text-xs font-mono h-24 mb-2 focus:border-blue-500 focus:outline-none bg-white"
                />
                <button
                  onClick={() => importText.trim() ? handleImport() : setImportError('Paste JSON first')}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 text-sm font-medium shadow-sm"
                >
                  Import Layout
                </button>
                {importError && (
                  <div className="mt-2 text-xs text-red-700 bg-red-50 p-2 rounded border border-red-200">⚠️ {importError}</div>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  <Download size={16} className="inline mr-1" />
                  Layout Output
                </label>
                <textarea
                  value={jsonOutput}
                  readOnly
                  onClick={(e) => e.target.select()}
                  className="w-full p-4 border-2 border-gray-300 rounded-lg text-sm font-mono h-80 bg-white shadow-inner"
                  style={{ resize: 'vertical', minHeight: 320 }}
                />
              </div>

              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800 font-medium mb-1">💡 How to use:</p>
                <ol className="text-xs text-blue-700 list-decimal list-inside space-y-1">
                  <li>Pick a card — the editor loads its current layout from cardLayouts.config.js</li>
                  <li>Adjust values; the preview reflects what the dashboard / modal / celebration will render</li>
                  <li>Click "Copy as Config Entry" and paste into cardLayouts.config.js to persist</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Renders a card with an arbitrary layout override (instead of the static
// config one). Builds the same inner stage as PunchCard so the live preview
// reflects edits before they are persisted to cardLayouts.config.js.
function LivePreview({ habit, layout }) {
  // The shipped PunchCard wrapper resolves its layout from cardLayouts.config,
  // which would ignore unsaved edits. So the editor renders PunchCardPreview
  // directly with the in-flight layout values.
  const cardImage = getCardImageUrl(habit.cardImage);
  return (
    <div style={{ width: '100%', aspectRatio: '1004 / 591', position: 'relative' }}>
      {cardImage && (
        <PunchCardPreview
          name={habit.title}
          description={habit.description}
          icon1={resolveIconForEditor(habit.icon1Id)}
          icon2={resolveIconForEditor(habit.icon2Id)}
          cardImage={cardImage}
          titlePlacement={layout.title}
          descriptionPlacement={layout.description}
          punchGridPlacement={{ ...layout.punchGrid, filledPunches: habit.currentPunches, totalPunches: habit.targetPunches }}
          currentPunches={habit.currentPunches}
          targetPunches={habit.targetPunches}
          editMode
          showCursor={false}
        />
      )}
    </div>
  );
}

const flatIcons = import.meta.glob('@/assets/icons/*.webp', { eager: true });
const bucketIcons = import.meta.glob('@/assets/icons/*/*.webp', { eager: true });
const ICON_LOOKUP = {};
for (const path in flatIcons) {
  const filename = path.split('/').pop();
  ICON_LOOKUP[toPngKey(filename)] = flatIcons[path].default;
}
for (const path in bucketIcons) {
  const parts = path.split('/');
  const filename = parts.pop();
  const bucket = parts.pop();
  const num = filename.replace(/\.webp$/i, '');
  ICON_LOOKUP[`${bucket}/${num}`] = bucketIcons[path].default;
}
function resolveIconForEditor(idOrName) {
  if (!idOrName) return null;
  return ICON_LOOKUP[idOrName] || null;
}

// ---------- Form primitives ----------

const toneClasses = {
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800' },
  pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-800' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
};

function Section({ title, tone, children }) {
  const t = toneClasses[tone] || toneClasses.purple;
  return (
    <div className={`mb-6 p-5 rounded-lg border-2 ${t.bg} ${t.border}`}>
      <h3 className={`font-bold mb-4 text-lg ${t.text}`}>{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
}

function Stepper({ value, onChange, parse, placeholder, type = 'text' }) {
  return (
    <div className="flex items-center gap-1">
      <button type="button" onClick={() => onChange(parse(value, -1))} className="px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded-l border border-gray-300">
        <ChevronDown size={14} />
      </button>
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-none text-base focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      <button type="button" onClick={() => onChange(parse(value, +1))} className="px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded-r border border-gray-300">
        <ChevronUp size={14} />
      </button>
    </div>
  );
}

function PercentField({ label, value, onChange, step = 0.5 }) {
  return (
    <FieldShell label={label}>
      <Stepper value={value} onChange={onChange} parse={(v, d) => adjustPercentage(v, d * step)} placeholder="0%" />
    </FieldShell>
  );
}

function SizeField({ label, value, onChange, step = 0.1 }) {
  return (
    <FieldShell label={label}>
      <Stepper value={value} onChange={onChange} parse={(v, d) => adjustPixels(v, d * step)} placeholder="1rem" />
    </FieldShell>
  );
}

function NumberField({ label, value, onChange }) {
  return (
    <FieldShell label={label}>
      <Stepper value={value} onChange={(v) => onChange(parseInt(v, 10) || 1)} parse={(v, d) => Math.max(1, (parseInt(v, 10) || 1) + d)} type="number" />
    </FieldShell>
  );
}

function TextField({ label, value, onChange, placeholder }) {
  return (
    <FieldShell label={label}>
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded text-base font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </FieldShell>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <FieldShell label={label}>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        {options.map((o) => <option key={o} value={o} style={{ fontFamily: `"${o}"` }}>{o}</option>)}
      </select>
    </FieldShell>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <FieldShell label={label}>
      <div className="flex items-center gap-2">
        <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)} className="w-16 h-10 border-2 border-gray-300 rounded cursor-pointer" />
        <input type="text" value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder="#333333" className="flex-1 px-3 py-2 border border-gray-300 rounded text-base font-mono focus:outline-none focus:ring-2 focus:ring-purple-500" />
      </div>
    </FieldShell>
  );
}

function FieldShell({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2 text-gray-700">{label}:</label>
      {children}
    </div>
  );
}

function CopyButton({ onClick, label, copied, tone }) {
  const colors = {
    purple: 'bg-purple-600 hover:bg-purple-700',
    pink: 'bg-pink-600 hover:bg-pink-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
  };
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all shadow-sm text-white ${copied ? 'bg-green-600' : colors[tone] || colors.purple}`}>
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? 'Copied!' : label}
    </button>
  );
}
