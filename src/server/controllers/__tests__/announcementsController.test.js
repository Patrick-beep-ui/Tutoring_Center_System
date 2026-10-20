// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import rateLimit from 'express-rate-limit';

const mocks = vi.hoisted(() => ({
    findAll: vi.fn(),
    create: vi.fn(),
    findByPk: vi.fn(),
    findSemester: vi.fn(),
    findRecipients: vi.fn(),
    sendAnnouncementEmail: vi.fn(),
}));

vi.mock('../../models/Announcement.js', () => ({
    default: {
        findAll: mocks.findAll,
        create: mocks.create,
        findByPk: mocks.findByPk,
    },
}));
vi.mock('../../models/Semester.js', () => ({
    default: { findByPk: mocks.findSemester },
}));
vi.mock('../../models/User.js', () => ({
    default: { findAll: mocks.findRecipients },
}));
vi.mock('../../mail.js', () => ({ sendAnnouncementEmail: mocks.sendAnnouncementEmail }));

import jwtAuth from '../../middlewares/jwtAuth.js';
import isAdmin from '../../middlewares/admin.js';
import { createAnnouncement, getAnnouncements } from '../announcementsController.js';

const SECRET = process.env.SECRET_KEY;

function token(role) {
    return jwt.sign({ user_id: 7, role }, SECRET, { expiresIn: '1h' });
}

function app() {
    const server = express();
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
    });
    server.use(express.json());
    server.get('/announcements', limiter, jwtAuth, getAnnouncements);
    server.post('/announcements', limiter, jwtAuth, isAdmin, createAnnouncement);
    return server;
}

describe('announcement routes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.findAll.mockResolvedValue([]);
        mocks.findRecipients.mockResolvedValue([]);
    });

    it('scopes student reads and does not honor include_expired=true', async () => {
        const res = await request(app())
            .get('/announcements?semester_id=3&include_expired=true')
            .set('Authorization', `Bearer ${token('student')}`);

        expect(res.status).toBe(200);
        const where = mocks.findAll.mock.calls[0][0].where;
        expect(where.audience[Op.in]).toEqual(['all', 'students']);
        expect(where[Op.and]).toHaveLength(2);
        expect(where[Op.and][0][Op.or]).toEqual([{ semester_id: 3 }, { semester_id: null }]);
        expect(where[Op.and][1][Op.or][1].expires_at[Op.gt]).toBeInstanceOf(Date);
    });

    it('allows admins to include expired announcements', async () => {
        const res = await request(app())
            .get('/announcements?include_expired=true')
            .set('Authorization', `Bearer ${token('admin')}`);

        expect(res.status).toBe(200);
        const where = mocks.findAll.mock.calls[0][0].where;
        expect(where.audience[Op.in]).toEqual(['all', 'students', 'tutors']);
        expect(where[Op.and]).toBeUndefined();
    });

    it('uses the authenticated user as the author instead of request input', async () => {
        const announcement = { announcement_id: 1, title: 'Campus update', body: 'Details', audience: 'all' };
        mocks.create.mockResolvedValue(announcement);
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});

        const res = await request(app())
            .post('/announcements')
            .set('Authorization', `Bearer ${token('admin')}`)
            .send({ title: 'Campus update', body: 'Details', audience: 'all', author_id: 999 });

        log.mockRestore();
        expect(res.status).toBe(201);
        expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ author_id: 7 }));
    });
});
