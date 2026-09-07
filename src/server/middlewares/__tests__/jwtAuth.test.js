// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import jwtAuth from '../jwtAuth.js';

const SECRET = process.env.SECRET_KEY;

function makeRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

function validToken(payload = { user_id: 1, email: 'a@b.com', role: 'tutor' }) {
  return jwt.sign(payload, SECRET, { expiresIn: '1h' });
}

describe('jwtAuth middleware', () => {
  it('returns 401 when no authorization header is present', () => {
    const req = { headers: {} };
    const res = makeRes();
    const next = vi.fn();
    jwtAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when the header is not a Bearer token', () => {
    const req = { headers: { authorization: 'Sometoken' } };
    const res = makeRes();
    const next = vi.fn();
    jwtAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 401 when the token is missing after Bearer', () => {
    const req = { headers: { authorization: 'Bearer ' } };
    const res = makeRes();
    const next = vi.fn();
    jwtAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 403 for an invalid token', () => {
    const req = { headers: { authorization: 'Bearer not.a.jwt' } };
    const res = makeRes();
    const next = vi.fn();
    jwtAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('returns 401 for an expired token', () => {
    const expired = jwt.sign({ user_id: 1 }, SECRET, { expiresIn: -1 });
    const req = { headers: { authorization: `Bearer ${expired}` } };
    const res = makeRes();
    const next = vi.fn();
    jwtAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('sets req.user and calls next for a valid token', () => {
    const token = validToken({ user_id: 5, email: 'x@y.com', role: 'student' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = makeRes();
    const next = vi.fn();
    jwtAuth(req, res, next);
    expect(req.user).toMatchObject({ user_id: 5, role: 'student' });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
