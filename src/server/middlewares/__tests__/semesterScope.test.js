// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  getCurrentSemesterId: vi.fn(),
}));

vi.mock('../../utils/currentSemester.js', () => ({
  getCurrentSemesterId: mocks.getCurrentSemesterId,
}));

import semesterScope from '../semesterScope.js';

function makeRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('semesterScope middleware', () => {
  beforeEach(() => {
    mocks.getCurrentSemesterId.mockReset();
    mocks.getCurrentSemesterId.mockResolvedValue(12);
  });

  it('passes through when no semester_id is provided', async () => {
    const req = { query: {} };
    const res = makeRes();
    const next = vi.fn();
    await semesterScope(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('passes through when requested semester equals current', async () => {
    const req = { query: { semester_id: '12' }, user: { role: 'student' } };
    const res = makeRes();
    const next = vi.fn();
    await semesterScope(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('blocks a student requesting a non-current semester with 403', async () => {
    const req = { query: { semester_id: '1' }, user: { role: 'student' } };
    const res = makeRes();
    const next = vi.fn();
    await semesterScope(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('allows an admin requesting a non-current semester', async () => {
    const req = { query: { semester_id: '1' }, user: { role: 'admin' } };
    const res = makeRes();
    const next = vi.fn();
    await semesterScope(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('allows a dev requesting a non-current semester', async () => {
    const req = { query: { semester_id: '1' }, user: { role: 'dev' } };
    const res = makeRes();
    const next = vi.fn();
    await semesterScope(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('returns 404 when no current semester is set', async () => {
    mocks.getCurrentSemesterId.mockRejectedValue(new Error('No current semester is set'));
    const req = { query: { semester_id: '1' }, user: { role: 'student' } };
    const res = makeRes();
    const next = vi.fn();
    await semesterScope(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
