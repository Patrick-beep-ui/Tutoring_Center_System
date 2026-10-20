import { Op } from "sequelize";
import { sendAnnouncementEmail } from "../mail.js";
import Announcement from "../models/Announcement.js";
import Semester from "../models/Semester.js";
import User from "../models/User.js";

const AUDIENCES = new Set(['all', 'students', 'tutors']);
const PRIVILEGED_ROLES = new Set(['admin', 'dev']);

function isPositiveInteger(value) {
    return Number.isInteger(value) && value > 0;
}

function parseOptionalSemesterId(value) {
    if (value === undefined || value === null || value === '') return { value: null };
    const semesterId = Number(value);
    if (!isPositiveInteger(semesterId)) return { error: 'semester_id must be a positive integer' };
    return { value: semesterId };
}

function parseOptionalDate(value, fieldName) {
    if (value === undefined || value === null || value === '') return { value: null };
    if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
        return { error: `${fieldName} must be a valid date` };
    }

    const date = new Date(value);
    const dateParts = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (dateParts) {
        const [, year, month, day] = dateParts.map(Number);
        const calendarDate = new Date(Date.UTC(year, month - 1, day));
        if (
            calendarDate.getUTCFullYear() !== year ||
            calendarDate.getUTCMonth() + 1 !== month ||
            calendarDate.getUTCDate() !== day
        ) {
            return { error: `${fieldName} must be a valid date` };
        }
    }
    return { value: date };
}

async function validateSemester(semesterId) {
    if (semesterId === null) return null;
    return Semester.findByPk(semesterId);
}

function validateAnnouncementInput(body, { partial = false, publishedAt = new Date() } = {}) {
    const values = {};
    const has = (field) => Object.prototype.hasOwnProperty.call(body, field);

    if (!partial || has('title')) {
        if (typeof body.title !== 'string' || !body.title.trim() || body.title.trim().length > 150) {
            return { error: 'title is required and must be at most 150 characters' };
        }
        values.title = body.title.trim();
    }

    if (!partial || has('body')) {
        if (typeof body.body !== 'string' || !body.body.trim()) {
            return { error: 'body is required' };
        }
        values.body = body.body.trim();
    }

    if (!partial || has('audience')) {
        if (!AUDIENCES.has(body.audience)) return { error: 'audience must be all, students, or tutors' };
        values.audience = body.audience;
    }

    if (has('semester_id')) {
        const semester = parseOptionalSemesterId(body.semester_id);
        if (semester.error) return semester;
        values.semester_id = semester.value;
    }

    if (has('expires_at')) {
        const expires = parseOptionalDate(body.expires_at, 'expires_at');
        if (expires.error) return expires;
        if (expires.value && expires.value <= publishedAt) {
            return { error: 'expires_at must be after published_at' };
        }
        values.expires_at = expires.value;
    }

    if (partial && Object.keys(values).length === 0) {
        return { error: 'No announcement fields were provided' };
    }
    return { values };
}

function visibleAudiences(role) {
    if (PRIVILEGED_ROLES.has(role)) return ['all', 'students', 'tutors'];
    if (role === 'student') return ['all', 'students'];
    if (role === 'tutor') return ['all', 'tutors'];
    return null;
}

function validAnnouncementId(value) {
    const id = Number(value);
    return isPositiveInteger(id) ? id : null;
}

async function sendRecipientEmails(announcement) {
    const roles = announcement.audience === 'all'
        ? ['student', 'tutor']
        : [announcement.audience === 'students' ? 'student' : 'tutor'];
    const recipients = await User.findAll({
        attributes: ['email', 'first_name'],
        where: {
            role: { [Op.in]: roles },
            email: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: '' }] },
        },
    });

    const sends = recipients
        .filter(({ email }) => typeof email === 'string' && email.trim())
        .map(({ email, first_name }) => sendAnnouncementEmail(email.trim(), {
            recipientName: first_name || 'there',
            title: announcement.title,
            body: announcement.body,
            expiresAt: announcement.expires_at,
        }));
    await Promise.allSettled(sends);
}

export async function getAnnouncements(req, res) {
    try {
        const audiences = visibleAudiences(req.user?.role);
        if (!audiences) return res.status(403).json({ error: 'Access denied' });

        const semester = parseOptionalSemesterId(req.query.semester_id);
        if (semester.error) return res.status(400).json({ error: semester.error });

        const where = { audience: { [Op.in]: audiences } };
        const conditions = [];
        if (semester.value !== null) {
            conditions.push({ [Op.or]: [{ semester_id: semester.value }, { semester_id: null }] });
        }
        if (!(req.query.include_expired === 'true' && PRIVILEGED_ROLES.has(req.user.role))) {
            conditions.push({ [Op.or]: [{ expires_at: null }, { expires_at: { [Op.gt]: new Date() } }] });
        }
        if (conditions.length) where[Op.and] = conditions;

        const announcements = await Announcement.findAll({
            where,
            include: [
                { model: User, as: 'author', attributes: ['user_id', 'first_name', 'last_name'] },
                { model: Semester, attributes: ['semester_id', 'semester_type', 'semester_code', 'semester_year'] },
            ],
            order: [['published_at', 'DESC'], ['announcement_id', 'DESC']],
        });
        res.json({ announcements });
    } catch (error) {
        console.error('Error fetching announcements:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function createAnnouncement(req, res) {
    try {
        const validation = validateAnnouncementInput(req.body || {});
        if (validation.error) return res.status(400).json({ error: validation.error });
        const { values } = validation;
        if (values.semester_id !== undefined && values.semester_id !== null && !(await validateSemester(values.semester_id))) {
            return res.status(400).json({ error: 'Semester not found' });
        }

        const announcement = await Announcement.create({ ...values, author_id: req.user.user_id });
        try {
            await sendRecipientEmails(announcement);
        } catch (error) {
            console.error('Announcement email delivery failed:', error);
        }
        res.status(201).json({ announcement });
    } catch (error) {
        console.error('Error creating announcement:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function updateAnnouncement(req, res) {
    try {
        const announcementId = validAnnouncementId(req.params.announcement_id);
        if (!announcementId) return res.status(400).json({ error: 'Invalid announcement id' });

        const announcement = await Announcement.findByPk(announcementId);
        if (!announcement) return res.status(404).json({ error: 'Announcement not found' });

        const validation = validateAnnouncementInput(req.body || {}, {
            partial: true,
            publishedAt: announcement.published_at,
        });
        if (validation.error) return res.status(400).json({ error: validation.error });
        const { values } = validation;
        if (values.semester_id !== undefined && values.semester_id !== null && !(await validateSemester(values.semester_id))) {
            return res.status(400).json({ error: 'Semester not found' });
        }

        await announcement.update(values);
        res.json({ announcement });
    } catch (error) {
        console.error('Error updating announcement:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function deleteAnnouncement(req, res) {
    try {
        const announcementId = validAnnouncementId(req.params.announcement_id);
        if (!announcementId) return res.status(400).json({ error: 'Invalid announcement id' });

        const deleted = await Announcement.destroy({ where: { announcement_id: announcementId } });
        if (!deleted) return res.status(404).json({ error: 'Announcement not found' });
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting announcement:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
