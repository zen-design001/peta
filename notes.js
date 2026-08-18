'use strict';

const STORAGE_KEY = 'sticky-notes';

function loadNotes() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveNotes(notes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function add(text, color) {
  const notes = loadNotes();
  const note = {
    id: crypto.randomUUID(),
    text,
    color
  };
  notes.push(note);
  saveNotes(notes);
  return note;
}

function list() {
  return loadNotes();
}

function del(id) {
  const notes = loadNotes();
  const indexFound = notes.findIndex(note => note.id === id);
  if (indexFound !== -1) {
    notes.splice(indexFound, 1);
    saveNotes(notes);
  }
}

function update(id, changes) {
  const notes = loadNotes();
  const indexFound = notes.findIndex(note => note.id === id);
  if (indexFound !== -1) {
    notes[indexFound] = { ...notes[indexFound], ...changes };
    saveNotes(notes);
  }
}

function reorder(orderedIds) {
  const notes = loadNotes();
  const byId = new Map(notes.map(note => [note.id, note]));
  saveNotes(orderedIds.map(id => byId.get(id)));
}

export { add, list, del, update, reorder };
