import { describe, it, expect } from 'vitest';
import { alertCategoryLabel } from '@/services/alertLabels';

describe('alertCategoryLabel', () => {
  it('returns "Alert" for null, undefined and empty strings', () => {
    expect(alertCategoryLabel(null)).toBe('Alert');
    expect(alertCategoryLabel(undefined)).toBe('Alert');
    expect(alertCategoryLabel('')).toBe('Alert');
  });

  it('returns the mapped label for known categories', () => {
    expect(alertCategoryLabel('unaccepted_session')).toBe('Unaccepted Session');
    expect(alertCategoryLabel('new_tutor_registered')).toBe('New Tutor Registered');
    expect(alertCategoryLabel('high_cancellation')).toBe('High Cancellation');
    expect(alertCategoryLabel('weekly_report_ready')).toBe('Weekly Report Ready');
  });

  it('title-cases unknown snake_case categories', () => {
    expect(alertCategoryLabel('some_new_category')).toBe('Some New Category');
  });

  it('handles single-word unknown categories', () => {
    expect(alertCategoryLabel('misc')).toBe('Misc');
  });
});
