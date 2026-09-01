// @vitest-environment node
import { describe, it, expect, beforeAll, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const SECRET = process.env.SECRET_KEY;

const mocks = vi.hoisted(() => {
  const query = vi.fn();
  const transaction = vi.fn().mockResolvedValue({ commit: vi.fn(), rollback: vi.fn() });
  const authenticate = vi.fn().mockResolvedValue();
  const resolveSemesterId = vi.fn();
  const getCurrentSemesterId = vi.fn();

  const modelMethods = () => ({ findAll: vi.fn(), findOne: vi.fn(), findByPk: vi.fn(), create: vi.fn(), destroy: vi.fn(), update: vi.fn(), count: vi.fn(), findOrCreate: vi.fn() });
  const define = vi.fn((name) => {
    const target = modelMethods();
    return new Proxy(target, {
      get(t, p) {
        if (p in t) return t[p];
        if (p === 'hasMany' || p === 'belongsTo' || p === 'belongsToMany' || p === 'hasOne') return vi.fn(() => t);
        return undefined;
      },
      set(t, p, v) { t[p] = v; return true; },
    });
  });

  return { query, transaction, authenticate, define, resolveSemesterId, getCurrentSemesterId };
});

vi.mock('../connection.js', () => ({
  default: {
    query: mocks.query,
    transaction: mocks.transaction,
    define: mocks.define,
    authenticate: mocks.authenticate,
  },
}));

vi.mock('../utils/currentSemester.js', () => ({
  resolveSemesterId: mocks.resolveSemesterId,
  getCurrentSemesterId: mocks.getCurrentSemesterId,
}));

import { getCatalogWithSemesterFlag } from '../controllers/coursesController.js';
import isAdmin from '../middlewares/admin.js';
import jwtAuth from '../middlewares/jwtAuth.js';
import semesterScope from '../middlewares/semesterScope.js';

const catalogRows = [
  { course_id: 1, course_name: 'Algebra', course_code: 'MAT101', credits: 3, major_id: 1, major_name: 'Mathematics', offered: 1, tutors_counter: 2 },
  { course_id: 2, course_name: 'Physics', course_code: 'FIS201', credits: 4, major_id: 2, major_name: 'Physics', offered: 0, tutors_counter: 0 },
];

function sign(payload) {
  return jwt.sign({ user_id: 1, email: 'e@e.com', role: 'student', ...payload }, SECRET, { expiresIn: '1h' });
}

function buildAuthApp() {
  const app = express();
  app.use(express.json());
  app.get('/catalog', jwtAuth, semesterScope, getCatalogWithSemesterFlag);
  return app;
}

describe('GET /catalog (integration: jwtAuth + semesterScope + catalog controller)', () => {
  let catalogApp;

  beforeAll(() => {
    catalogApp = buildAuthApp();
  });

  beforeEach(() => {
    mocks.query.mockReset();
    mocks.resolveSemesterId.mockReset();
    mocks.getCurrentSemesterId.mockReset();
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(catalogApp).get('/catalog');
    expect(res.status).toBe(401);
  });

  it('returns 403 for an invalid token', async () => {
    const res = await request(catalogApp).get('/catalog').set('Authorization', 'Bearer not.a.jwt').query({ semester_id: '1' });
    expect(res.status).toBe(403);
  });

  it('blocks a student from a non-current semester with 403', async () => {
    mocks.getCurrentSemesterId.mockResolvedValue(12);
    mocks.resolveSemesterId.mockImplementation((r) => (r ? Number(r) : mocks.getCurrentSemesterId()));
    const token = sign({ role: 'student' });
    const res = await request(catalogApp).get('/catalog').set('Authorization', `Bearer ${token}`).query({ semester_id: '1' });
    expect(res.status).toBe(403);
  });

  it('returns the catalog with expected shape for an allowed request', async () => {
    mocks.getCurrentSemesterId.mockResolvedValue(12);
    mocks.resolveSemesterId.mockImplementation((r) => (r ? Number(r) : mocks.getCurrentSemesterId()));
    mocks.query.mockResolvedValue(catalogRows);
    const token = sign({ role: 'admin' });
    const res = await request(catalogApp).get('/catalog').set('Authorization', `Bearer ${token}`).query({ semester_id: '12' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('courses');
    expect(Array.isArray(res.body.courses)).toBe(true);
    expect(res.body.courses).toHaveLength(2);
    const first = res.body.courses[0];
    expect(first).toMatchObject({ course_id: 1, course_code: 'MAT101', major_name: 'Mathematics' });
    expect(first).toHaveProperty('offered');
    expect(first).toHaveProperty('tutors_counter');
    expect(mocks.query).toHaveBeenCalled();
  });

  it('returns 404 when no current semester is set', async () => {
    mocks.getCurrentSemesterId.mockRejectedValue(new Error('No current semester is set'));
    mocks.resolveSemesterId.mockRejectedValue(new Error('No current semester is set'));
    const token = sign({ role: 'admin' });
    const res = await request(catalogApp).get('/catalog').set('Authorization', `Bearer ${token}`).query({ semester_id: '9' });
    expect(res.status).toBe(404);
  });
});

describe('isAdmin role gating (integration: jwtAuth + isAdmin)', () => {
  let adminApp;
  beforeAll(() => {
    adminApp = express();
    adminApp.use(express.json());
    adminApp.post('/admin-only', jwtAuth, isAdmin, (req, res) => res.status(201).json({ ok: true }));
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(adminApp).post('/admin-only');
    expect(res.status).toBe(401);
  });

  it('returns 403 for a non-privileged role (tutor)', async () => {
    const token = sign({ role: 'tutor' });
    const res = await request(adminApp).post('/admin-only').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('returns 403 for a student', async () => {
    const token = sign({ role: 'student' });
    const res = await request(adminApp).post('/admin-only').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('allows an admin to proceed', async () => {
    const token = sign({ role: 'admin' });
    const res = await request(adminApp).post('/admin-only').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(201);
  });

  it('allows a dev to proceed', async () => {
    const token = sign({ role: 'dev' });
    const res = await request(adminApp).post('/admin-only').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(201);
  });
});
