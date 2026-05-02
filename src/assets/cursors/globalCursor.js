// Apply the default pointer cursor app-wide. Imported for side effects from App.jsx.
import { getCursor, DEFAULT_CURSOR_ID, playCursorSound } from './cursors';

const cursor = getCursor(DEFAULT_CURSOR_ID);

if (typeof document !== 'undefined') {
  document.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    const scoped = e.target?.closest?.('[data-cursor-id]');
    const id = scoped?.getAttribute('data-cursor-id') || DEFAULT_CURSOR_ID;
    playCursorSound(id);
  });
}

if (cursor && typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.setAttribute('data-global-cursor', DEFAULT_CURSOR_ID);
  const interactiveSelector = [
    'a', 'button', '[role="button"]', '[role="link"]',
    'input[type="button"]', 'input[type="submit"]', 'input[type="reset"]',
    'label[for]', 'select', 'summary',
    '.clickable', '[data-clickable="true"]',
  ].join(', ');
  const activeSelector = interactiveSelector
    .split(', ')
    .map((s) => `${s}:active`)
    .join(', ');

  style.textContent = `
    html, body {
      cursor: url(${cursor.cursor}) 4 4, auto;
    }
    ${interactiveSelector} {
      cursor: url(${cursor.cursor}) 4 4, pointer;
    }
    ${interactiveSelector.split(', ').map((s) => `${s}:hover`).join(', ')} {
      cursor: url(${cursor.click}) 4 4, pointer;
    }
    ${activeSelector} {
      cursor: url(${cursor.click}) 4 4, pointer;
    }
  `;
  document.head.appendChild(style);
}
