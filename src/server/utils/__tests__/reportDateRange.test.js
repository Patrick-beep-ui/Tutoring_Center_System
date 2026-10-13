import { describe, expect, it } from 'vitest';
import { getReportDateRange, reportSessionSql, reportSessionWhere } from '../reportDateRange.js';

describe('report date ranges', () => {
  it('accepts optional valid ISO calendar dates', () => {
    expect(getReportDateRange({ date_from: '2026-02-01', date_to: '2026-02-28' })).toEqual({ date_from: '2026-02-01', date_to: '2026-02-28' });
    expect(getReportDateRange({})).toEqual({ date_from: undefined, date_to: undefined });
  });

  it('rejects malformed, impossible, and inverted dates', () => {
    expect(getReportDateRange({ date_from: '2026-2-01' })).toBeNull();
    expect(getReportDateRange({ date_to: '2026-02-30' })).toBeNull();
    expect(getReportDateRange({ date_from: '2026-03-01', date_to: '2026-02-28' })).toBeNull();
  });

  it('uses an exclusive next-day upper bound so date_to is inclusive', () => {
    const range = getReportDateRange({ date_from: '2026-02-01', date_to: '2026-02-28' });
    expect(reportSessionSql('s', range)).toBe(' AND s.session_date >= :date_from AND s.session_date < DATE_ADD(:date_to, INTERVAL 1 DAY)');
    expect(reportSessionWhere(range).session_date).toBeDefined();
  });
});
