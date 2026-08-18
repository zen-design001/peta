'use strict';

import * as notes from './notes.js';

const PRESET_COLORS = ['#fff59d', '#ffcc80', '#ef9a9a', '#a5d6a7', '#90caf9', '#ce93d8'];

const ICON_EDIT = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 20h9"></path>
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
  </svg>
`;

const ICON_PALETTE = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 2.7 17.7 8.3a8 8 0 1 1-11.4 0Z"></path>
  </svg>
`;

const board = document.getElementById('board');
const form = document.getElementById('note-form');
const textInput = document.getElementById('note-text');
const colorInput = document.getElementById('note-color');
const presets = document.getElementById('color-presets');

function render() {
  board.innerHTML = '';
  const items = notes.list();

  if (items.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'メモはまだありません。';
    board.appendChild(empty);
    return;
  }

  for (const note of items) {
    board.appendChild(createNoteElement(note));
  }
}

function closeAllColorPopovers() {
  for (const popover of board.querySelectorAll('.note-color-popover')) {
    popover.hidden = true;
  }
}

function createNoteElement(note) {
  const el = document.createElement('div');
  el.className = 'note';
  el.dataset.id = note.id;
  el.draggable = true;
  el.style.setProperty('--note-color', note.color);

  const text = document.createElement('p');
  text.className = 'note-text';
  text.textContent = note.text;

  const footer = document.createElement('div');
  footer.className = 'note-footer';

  const actions = document.createElement('div');
  actions.className = 'note-actions';

  const editButton = document.createElement('button');
  editButton.className = 'icon-btn note-edit-btn';
  editButton.type = 'button';
  editButton.title = '編集';
  editButton.setAttribute('aria-label', '編集');
  editButton.innerHTML = ICON_EDIT;
  editButton.addEventListener('click', () => startEditing(el, text, note));

  const colorWrap = document.createElement('div');
  colorWrap.className = 'note-color-wrap';

  const colorButton = document.createElement('button');
  colorButton.className = 'icon-btn note-color-btn';
  colorButton.type = 'button';
  colorButton.title = '色を変更';
  colorButton.setAttribute('aria-label', '色を変更');
  colorButton.innerHTML = ICON_PALETTE;

  const colorPopover = document.createElement('div');
  colorPopover.className = 'note-color-popover';
  colorPopover.hidden = true;

  for (const color of PRESET_COLORS) {
    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.className = 'swatch';
    swatch.style.setProperty('--swatch-color', color);
    swatch.addEventListener('click', () => {
      notes.update(note.id, { color });
      el.style.setProperty('--note-color', color);
      colorPopover.hidden = true;
    });
    colorPopover.appendChild(swatch);
  }

  colorButton.addEventListener('click', event => {
    event.stopPropagation();
    const wasHidden = colorPopover.hidden;
    closeAllColorPopovers();
    colorPopover.hidden = !wasHidden;
  });

  colorWrap.appendChild(colorButton);
  colorWrap.appendChild(colorPopover);

  actions.appendChild(editButton);
  actions.appendChild(colorWrap);

  const deleteButton = document.createElement('button');
  deleteButton.className = 'note-delete';
  deleteButton.type = 'button';
  deleteButton.textContent = '削除';
  deleteButton.addEventListener('click', () => {
    notes.del(note.id);
    render();
  });

  footer.appendChild(actions);
  footer.appendChild(deleteButton);

  el.appendChild(text);
  el.appendChild(footer);

  el.addEventListener('dragstart', () => {
    el.classList.add('dragging');
  });
  el.addEventListener('dragend', () => {
    el.classList.remove('dragging');
    const orderedIds = [...board.querySelectorAll('.note')].map(item => item.dataset.id);
    notes.reorder(orderedIds);
  });
  el.addEventListener('dragover', event => {
    event.preventDefault();
    const dragging = board.querySelector('.dragging');
    if (!dragging || dragging === el) {
      return;
    }
    const rect = el.getBoundingClientRect();
    const isAfter = event.clientY - rect.top > rect.height / 2;
    el.parentNode.insertBefore(dragging, isAfter ? el.nextSibling : el);
  });

  return el;
}

function startEditing(el, text, note) {
  const textarea = document.createElement('textarea');
  textarea.className = 'note-edit';
  textarea.value = note.text;
  el.replaceChild(textarea, text);
  textarea.focus();
  textarea.select();

  const commit = () => {
    const newText = textarea.value.trim();
    if (newText !== '' && newText !== note.text) {
      notes.update(note.id, { text: newText });
    }
    render();
  };

  textarea.addEventListener('blur', commit);
}

document.addEventListener('click', () => {
  closeAllColorPopovers();
});

presets.addEventListener('click', event => {
  const swatch = event.target.closest('.swatch');
  if (!swatch) {
    return;
  }
  colorInput.value = swatch.dataset.color;
});

form.addEventListener('submit', event => {
  event.preventDefault();

  const text = textInput.value.trim();
  if (text === '') {
    return;
  }

  notes.add(text, colorInput.value);
  textInput.value = '';
  textInput.focus();
  render();
});

render();
