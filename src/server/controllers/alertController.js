import connection from "../connection.js";
import { resolveSemesterId } from "../utils/currentSemester.js";

// Configurable thresholds
const UNACCEPTED_HOURS = Number(process.env.ALERT_UNACCEPTED_HOURS) || 24;
const CANCELLATION_RATE_PCT = Number(process.env.ALERT_CANCELLATION_PCT) || 20;
const ATTENDANCE_PCT = Number(process.env.ALERT_ATTENDANCE_PCT) || 60;

// Insert an alert if one with the same (category, user, semester, message) does
// not already exist. Returns true if inserted.
async function insertIfNew({ semester_id, source = 'rule' }) {
    return async ({ category, message, userId = null, status = 'unread' }) => {
        const [[existing]] = await connection.query(
            `SELECT alert_id FROM alerts
             WHERE category_id = (SELECT id FROM alerts_categories WHERE category_name = ?)
               AND (? IS NULL OR user_id = ?)
               AND (? IS NULL OR semester_id = ?)
               AND message = ?
             LIMIT 1`,
            { replacements: [category, userId, userId, semester_id, semester_id, message] }
        );
        if (existing) return false;

        await connection.query(
            `INSERT INTO alerts (category_id, user_id, semester_id, source, message, status)
             SELECT id, ?, ?, ?, ?, ? FROM alerts_categories WHERE category_name = ?`,
            { replacements: [userId, semester_id, source, message, status, category] }
        );
        return true;
    };
}

export const getAlerts = async (req, res) => {
    try {
        const semester_id = await resolveSemesterId(req.query.semester_id);
        const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
        const status = req.query.status; // optional filter: unread|read|pending

        let sql = `
            SELECT a.alert_id, a.category_id,
                   ac.category_name, ac.severity_level, ac.description,
                   a.user_id, u.first_name AS user_first, u.last_name AS user_last,
                   a.semester_id, a.source, a.message, a.status, a.created_at
            FROM alerts a
            JOIN alerts_categories ac ON ac.id = a.category_id
            LEFT JOIN users u ON u.user_id = a.user_id
            WHERE a.semester_id = :semester_id
        `;
        const replacements = { semester_id, limit };
        if (status) {
            sql += ` AND a.status = :status`;
            replacements.status = status;
        }
        sql += ` ORDER BY a.created_at DESC, a.alert_id DESC LIMIT :limit`;

        const [rows] = await connection.query(sql, { replacements });
        res.json({
            alerts: rows.map(r => ({
                alert_id: r.alert_id,
                category_id: r.category_id,
                category: r.category_name,
                severity_level: r.severity_level,
                description: r.description,
                user_id: r.user_id,
                user_name: r.user_first && r.user_last ? `${r.user_first} ${r.user_last}` : null,
                semester_id: r.semester_id,
                source: r.source,
                message: r.message,
                status: r.status,
                created_at: r.created_at,
            }))
        });
    }
    catch (e) {
        if (e.message === 'No current semester is set') {
            return res.status(404).json({ error: e.message });
        }
        console.error("Error fetching alerts:", e);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const evaluateAlerts = async (req, res) => {
    try {
        const semester_id = await resolveSemesterId(req.query.semester_id);
        const emit = await insertIfNew({ semester_id });

        // Track how many were inserted per rule for the response
        const generated = [];
        const count = async (category, n) => { if (n > 0) generated.push({ category, count: n }); };

        // ---- Rule 1: unaccepted_session (HIGH) ----
        // Sessions still 'scheduled' whose updatedAt is older than threshold (tutor never accepted)
        const [unaccepted] = await connection.query(`
            SELECT s.tutor_id, t.user_id AS tutor_user_id, s.student_id,
                   c.course_name, s.session_id
            FROM session_details sd
            JOIN sessions s ON s.session_id = sd.session_id
            JOIN tutors t ON t.tutor_id = s.tutor_id
            JOIN courses c ON c.course_id = s.course_id
            WHERE sd.session_status = 'scheduled'
              AND s.semester_id = :semester_id
              AND sd.updatedAt < (NOW() - INTERVAL :hours HOUR)
        `, { replacements: { semester_id, hours: UNACCEPTED_HOURS } });
        let n1 = 0;
        for (const u of unaccepted) {
            const ok = await emit({
                category: 'unaccepted_session',
                message: `${u.course_name} session (id ${u.session_id}) still unaccepted for over ${UNACCEPTED_HOURS}h`,
                userId: u.tutor_user_id,
                status: 'unread',
            });
            if (ok) n1++;
        }
        await count('unaccepted_session', n1);

        // ---- Rule 2: high_cancellation (HIGH) ----
        // Per-program cancellation rate above threshold in the semester
        const [cancels] = await connection.query(`
            SELECT m.major_name,
                   COUNT(*) AS total,
                   SUM(CASE WHEN sd.session_status = 'canceled' THEN 1 ELSE 0 END) AS canceled
            FROM sessions s
            JOIN session_details sd ON sd.session_id = s.session_id
            JOIN courses c ON c.course_id = s.course_id
            LEFT JOIN majors m ON m.major_id = c.major_id
            WHERE s.semester_id = :semester_id
            GROUP BY m.major_id, m.major_name
            HAVING total > 0 AND canceled / total * 100 > :rate
        `, { replacements: { semester_id, rate: CANCELLATION_RATE_PCT } });
        let n2 = 0;
        for (const cr of cancels) {
            const pct = Math.round((cr.canceled / cr.total) * 100);
            const ok = await emit({
                category: 'high_cancellation',
                message: `${cr.major_name || 'Unknown program'} has a ${pct}% cancellation rate`,
                userId: null,
            });
            if (ok) n2++;
        }
        await count('high_cancellation', n2);

        // ---- Rule 3: low_attendance (MEDIUM) ----
        // Tutors whose attended (completed) proportion of non-canceled sessions is below threshold
        const [att] = await connection.query(`
            SELECT t.user_id AS tutor_user_id, u.first_name, u.last_name, s.tutor_id,
                   COUNT(*) AS total,
                   SUM(CASE WHEN sd.session_status = 'completed' THEN 1 ELSE 0 END) AS attended
            FROM sessions s
            JOIN session_details sd ON sd.session_id = s.session_id
            JOIN tutors t ON t.tutor_id = s.tutor_id
            JOIN users u ON u.user_id = t.user_id
            WHERE s.semester_id = :semester_id
              AND sd.session_status IN ('completed','scheduled','pending')
            GROUP BY s.tutor_id, t.user_id, u.first_name, u.last_name
            HAVING attended / total * 100 < :pct
        `, { replacements: { semester_id, pct: ATTENDANCE_PCT } });
        let n3 = 0;
        for (const a of att) {
            const pct = Math.round((a.attended / a.total) * 100);
            const ok = await emit({
                category: 'low_attendance',
                message: `${a.first_name} ${a.last_name} has ${pct}% attendance`,
                userId: a.tutor_user_id,
            });
            if (ok) n3++;
        }
        await count('low_attendance', n3);

        // ---- Rule 4: feedback_received (LOW) ----
        // New feedback rows on sessions in this semester -> alert the session's tutor
        const [feedbacks] = await connection.query(`
            SELECT f.feedback_id, f.rating, s.tutor_id, t.user_id AS tutor_user_id,
                   c.course_name, s.session_id
            FROM session_feedback f
            JOIN sessions s ON s.session_id = f.session_id
            JOIN tutors t ON t.tutor_id = s.tutor_id
            JOIN courses c ON c.course_id = s.course_id
            WHERE s.semester_id = :semester_id
              AND f.created_at >= (NOW() - INTERVAL 7 DAY)
        `, { replacements: { semester_id } });
        let n4 = 0;
        for (const f of feedbacks) {
            const ok = await emit({
                category: 'feedback_received',
                message: `New ${f.rating}/5 feedback on ${f.course_name} session (id ${f.session_id})`,
                userId: f.tutor_user_id,
            });
            if (ok) n4++;
        }
        await count('feedback_received', n4);

        // ---- Rule 5: new_tutor_registered (LOW) ----
        // New tutor accounts (anchor = max user_id seen previously; use users without a signup timestamp)
        // We approximate "new" as tutors created in the last 7 days by user_id ordering only if a
        // last-seen anchor exists; otherwise we seed from the highest user id not yet alerted.
        const [[maxAnchor]] = await connection.query(`
            SELECT COALESCE(MAX(CAST(SUBSTRING_INDEX(message, '#', -1) AS UNSIGNED)), 0) AS anchor
            FROM alerts WHERE source = 'rule' AND category_id = (SELECT id FROM alerts_categories WHERE category_name = 'new_tutor_registered')
        `);
        const [newTutors] = await connection.query(`
            SELECT user_id, first_name, last_name, ku_id FROM users
            WHERE role = 'tutor' AND user_id > :anchor
            ORDER BY user_id ASC
        `, { replacements: { anchor: maxAnchor.anchor } });
        let n5 = 0;
        for (const nt of newTutors) {
            const ok = await emit({
                category: 'new_tutor_registered',
                message: `New tutor registered: ${nt.first_name} ${nt.last_name} (#${nt.user_id})`,
                userId: null,
            });
            if (ok) n5++;
        }
        await count('new_tutor_registered', n5);

        // ---- Rule 6: session_completed / scheduled / canceled (activity) ----
        // Emit one alert per qualifying session transition in the semester (deduped by message)
        const [events] = await connection.query(`
            SELECT sd.session_id, sd.session_status,
                   s.tutor_id, t.user_id AS tutor_user_id,
                   c.course_name, s.session_id as sid,
                   u.first_name AS uf, u.last_name AS ul
            FROM session_details sd
            JOIN sessions s ON s.session_id = sd.session_id
            JOIN tutors t ON t.tutor_id = s.tutor_id
            JOIN courses c ON c.course_id = s.course_id
            LEFT JOIN users u ON u.user_id = t.user_id
            WHERE s.semester_id = :semester_id
              AND sd.session_status IN ('completed','scheduled','canceled')
              AND sd.createdAt >= (NOW() - INTERVAL 7 DAY)
        `, { replacements: { semester_id } });
        const evCounts = { completed: 0, scheduled: 0, canceled: 0 };
        for (const ev of events) {
            const map = {
                completed: ['session_completed', 'Session completed: '],
                scheduled: ['session_scheduled', 'Session scheduled: '],
                canceled: ['session_canceled', 'Session canceled: '],
            };
            const [cat, prefix] = map[ev.session_status];
            const ok = await emit({
                category: cat,
                message: `${prefix}${ev.course_name} (${ev.uf} ${ev.ul}, id ${ev.sid})`,
                userId: ev.tutor_user_id,
            });
            if (ok) evCounts[ev.session_status]++;
        }
        for (const k of Object.keys(evCounts)) {
            if (evCounts[k] > 0) await count(`session_${k}`, evCounts[k]);
        }

        // ---- Rule 7: comment_added (LOW) ----
        const [coms] = await connection.query(`
            SELECT c.comment_id, c.content, s.semester_id, u.first_name AS uf, u.last_name AS ul
            FROM comments c
            JOIN sessions s ON s.session_id = c.session_id
            JOIN users u ON u.user_id = c.user_id
            WHERE s.semester_id = :semester_id
              AND c.created_at >= (NOW() - INTERVAL 7 DAY)
        `, { replacements: { semester_id } });
        let n7 = 0;
        for (const co of coms) {
            const ok = await emit({
                category: 'comment_added',
                message: `${co.uf} ${co.ul} commented: ${(co.content || '').slice(0, 40)}`,
                userId: null,
            });
            if (ok) n7++;
        }
        await count('comment_added', n7);

        // ---- Rule 8: weekly_report_ready (MEDIUM, once) ----
        const okWeekly = await emit({
            category: 'weekly_report_ready',
            message: 'Weekly performance report is available for review',
            userId: null,
        });
        if (okWeekly) await count('weekly_report_ready', 1);

        res.json({ generated, semester_id });
    }
    catch (e) {
        if (e.message === 'No current semester is set') {
            return res.status(404).json({ error: e.message });
        }
        console.error("Error evaluating alerts:", e);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const markAlertRead = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await connection.query(
            `UPDATE alerts SET status = 'read' WHERE alert_id = :id`,
            { replacements: { id: Number(id) } }
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Alert not found' });
        }
        res.json({ message: 'Alert marked as read' });
    }
    catch (e) {
        console.error("Error marking alert read:", e);
        res.status(500).json({ error: 'Internal server error' });
    }
};
