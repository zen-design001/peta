'use strict';

globalThis.localStorage = (() => {
  let store = {};
  return {
    getItem: key => (key in store ? store[key] : null),
    setItem: (key, value) => { store[key] = String(value); },
    clear: () => { store = {}; }
  };
})();

globalThis.crypto ??= {};
if (typeof globalThis.crypto.randomUUID !== 'function') {
  let counter = 0;
  globalThis.crypto.randomUUID = () => `test-id-${++counter}`;
}

import assert from 'node:assert';
import test from 'node:test';
import * as notes from './notes.js';

test('addとlistのテスト', () => {
  localStorage.clear();
  notes.add('牛乳を買う', 'yellow');
  notes.add('掃除をする', 'pink');
  const result = notes.list();
  assert.strictEqual(result.length, 2);
  assert.strictEqual(result[0].text, '牛乳を買う');
  assert.strictEqual(result[1].text, '掃除をする');
});

test('delのテスト', () => {
  localStorage.clear();
  const noteA = notes.add('牛乳を買う', 'yellow');
  notes.add('掃除をする', 'pink');
  notes.del(noteA.id);
  const result = notes.list();
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].text, '掃除をする');
});

test('updateのテスト（本文と色の変更）', () => {
  localStorage.clear();
  const note = notes.add('牛乳を買う', 'yellow');

  notes.update(note.id, { text: '豆乳を買う' });
  assert.strictEqual(notes.list()[0].text, '豆乳を買う');

  notes.update(note.id, { color: 'pink' });
  assert.strictEqual(notes.list()[0].color, 'pink');
});

test('reorderのテスト', () => {
  localStorage.clear();
  const a = notes.add('A', 'yellow');
  const b = notes.add('B', 'pink');
  const c = notes.add('C', 'blue');

  notes.reorder([c.id, a.id, b.id]);

  const result = notes.list().map(note => note.text);
  assert.deepStrictEqual(result, ['C', 'A', 'B']);
});
