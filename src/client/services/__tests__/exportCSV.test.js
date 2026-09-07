import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportToCSV } from '@/services/exportCSV';

describe('exportToCSV', () => {
  let click, createObjectURL;

  beforeEach(() => {
    click = vi.fn();
    createObjectURL = vi.fn(() => 'blob:mock');
    globalThis.URL.createObjectURL = createObjectURL;
    document.createElement = vi.fn(() => ({
      href: '',
      target: '',
      download: '',
      click,
    }));
  });

  it('builds a CSV with header and data rows', () => {
    const rows = [
      ['Alice', '100'],
      ['Bob', '200'],
    ];
    exportToCSV(rows, ['Name', 'Score'], 'report.csv');
    expect(createObjectURL).toHaveBeenCalled();
    // The Blob content should contain header + rows separated by newlines.
    const blobArg = createObjectURL.mock.calls[0][0];
    expect(blobArg).toBeInstanceOf(Blob);
    return blobArg.text().then((content) => {
      expect(content).toBe('Name,Score\nAlice,100\nBob,200');
    });
  });

  it('sets the filename on the download link', () => {
    const link = {};
    document.createElement = vi.fn(() => ({ ...link, click }));
    exportToCSV([[1]], ['A'], 'my.csv');
    const el = document.createElement.mock.results[0].value;
    expect(el.download).toBe('my.csv');
  });

  it('triggers a download by clicking the link', () => {
    exportToCSV([[1]], ['A'], 'x.csv');
    expect(click).toHaveBeenCalledTimes(1);
  });
});
