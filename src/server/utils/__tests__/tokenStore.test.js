// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest';
import { tokenStore } from '../tokenStore.js';

describe('tokenStore', () => {
  beforeEach(() => {
    tokenStore.clear();
  });

  it('starts empty', () => {
    expect(tokenStore.size).toBe(0);
  });

  it('reports whether a token is present', () => {
    const token = 'abc123';
    tokenStore.add(token);
    expect(tokenStore.has(token)).toBe(true);
    expect(tokenStore.has('nope')).toBe(false);
  });

  it('removes a token on delete', () => {
    const token = 'xyz';
    tokenStore.add(token);
    tokenStore.delete(token);
    expect(tokenStore.has(token)).toBe(false);
  });

  it('does not treat a token as present after clear', () => {
    tokenStore.add('one');
    tokenStore.add('two');
    tokenStore.clear();
    expect(tokenStore.size).toBe(0);
  });

  it('is a Set, so duplicates are ignored', () => {
    tokenStore.add('dup');
    tokenStore.add('dup');
    expect(tokenStore.size).toBe(1);
  });
});
