// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { sanitizeUserInput } from '../sanitize.js';

describe('sanitizeUserInput', () => {
  it('returns an empty string for null and undefined', () => {
    expect(sanitizeUserInput(null)).toBe('');
    expect(sanitizeUserInput(undefined)).toBe('');
  });

  it('passes plain text through unchanged', () => {
    expect(sanitizeUserInput('Hello world')).toBe('Hello world');
  });

  it('strips HTML tags', () => {
    expect(sanitizeUserInput('<b>bold</b> text')).toBe('bold text');
  });

  it('removes script content entirely', () => {
    expect(sanitizeUserInput('<script>alert(1)</script>')).toBe('');
  });

  it('strips all attributes', () => {
    expect(sanitizeUserInput('<a href="https://evil.com">link</a>')).toBe('link');
  });

  it('trims surrounding whitespace', () => {
    expect(sanitizeUserInput('  spaced out  ')).toBe('spaced out');
  });

  it('stringifies non-string primitive values', () => {
    expect(sanitizeUserInput(42)).toBe('42');
  });
});
