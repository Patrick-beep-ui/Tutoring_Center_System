import Semester from "../models/Semester.js";
import TutorSession from "../models/TutorSession.js";
import connection from "../connection.js";
import { QueryTypes } from "sequelize";
export const getSemesters = async (req, res) => {
    try {
        const terms = await Semester.findAll({
            order: [["semester_year", "DESC"], ["semester_id", "DESC"]]
        })

        const [courseCounts] = await connection.query(`
            SELECT semester_id, COUNT(DISTINCT course_id) AS courses
            FROM semester_courses GROUP BY semester_id`);
        const [rosterCounts] = await connection.query(`
            SELECT semester_id,
                SUM(status = 'Given') AS tutors,
                SUM(status = 'Received') AS students
            FROM user_courses GROUP BY semester_id`);
        const [scheduleCounts] = await connection.query(`
            SELECT semester_id, COUNT(*) AS schedules
            FROM schedules GROUP BY semester_id`);

        const countMap = {};
        for (const row of courseCounts) {
            countMap[row.semester_id] = { courses: Number(row.courses), tutors: 0, students: 0, schedules: 0 };
        }
        for (const row of rosterCounts) {
            countMap[row.semester_id] = {
                ...(countMap[row.semester_id] || { courses: 0, schedules: 0 }),
                tutors: Number(row.tutors),
                students: Number(row.students)
            };
        }
        for (const row of scheduleCounts) {
            countMap[row.semester_id] = {
                ...(countMap[row.semester_id] || { courses: 0, tutors: 0, students: 0 }),
                schedules: Number(row.schedules)
            };
        }

        const termsWithCounts = terms.map(term => ({
            ...term.toJSON(),
            roster_counts: countMap[term.semester_id] || { courses: 0, tutors: 0, students: 0, schedules: 0 }
        }));

        res.status(200).json({
            terms: termsWithCounts
        })
    }
    catch(e) {
        console.error(e)
        res.status(500).json({ msg: 'An error occurred while fetching semesters' });
    }
}

export const addSemester = async (req, res) => {
    try {
        const term = new Semester({
            semester_type: req.body.semester_type,
            semester_code: req.body.semester_code,
            semester_year: req.body.semester_year,
            weeks: req.body.weeks,
            start_date: req.body.start_date || null
        })

        await term.save();

        res.status(200).json({
            msg: 'Term saved successfully',
            term
        });
    }
    catch(e) {
        if (e.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ msg: 'This semester already exists' });
        }
        console.error(e)
        res.status(500).json({ msg: 'An error occurred while adding the semester' });
    }
}

export const getCurrentSemester = async (req, res) => {
    try {
        const currentSemester = await Semester.findOne({
            where: {
                is_current: true
            }
        });

        if (!currentSemester) {
            return res.status(404).json({ msg: 'No current semester found' });
        }

        res.status(200).json({
            currentSemester
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: 'Server error' });
    }
}

export const setCurrentSemester = async (req, res) => {
    const t = await connection.transaction();
    try {
        const { semester_id } = req.params;

        const term = await Semester.findByPk(semester_id, { transaction: t });
        if (!term) {
            await t.rollback();
            return res.status(404).json({ msg: 'Semester not found' });
        }

        if (term.is_current) {
            await t.rollback();
            return res.status(400).json({ msg: 'This semester is already the current one' });
        }

        await Semester.update(
            { is_current: false },
            { where: { is_current: true }, transaction: t }
        );

        term.is_current = true;
        await term.save({ transaction: t });

        await t.commit();

        res.status(200).json({
            msg: `${term.semester_type} ${term.semester_year} is now the current semester`,
            term
        });
    } catch (e) {
        await t.rollback();
        console.error(e);
        res.status(500).json({ msg: 'An error occurred while setting the current semester' });
    }
}

export const deleteSemester = async (req, res) => {
    try {
        const { semester_id } = req.params;

        const term = await Semester.findByPk(semester_id);
        if (!term) {
            return res.status(404).json({ msg: 'Semester not found' });
        }

        if (term.is_current) {
            return res.status(400).json({ msg: 'Cannot delete the current semester. Set another semester as current first.' });
        }

        const sessionCount = await TutorSession.count({ where: { semester_id } });
        if (sessionCount > 0) {
            return res.status(400).json({ msg: `Cannot delete this semester: it has ${sessionCount} session(s) recorded. Historical data must be preserved.` });
        }

        await term.destroy();

        res.status(200).json({ msg: 'Semester deleted successfully' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: 'An error occurred while deleting the semester' });
    }
}

export const copySemesterFrom = async (req, res) => {
    const t = await connection.transaction();
    try {
        const target_id = Number(req.params.semester_id);
        const source_id = Number(req.params.source_id);
        const { courses = true, tutors = true, students = true, schedules = true } = req.body || {};

        if (!Number.isInteger(target_id) || !Number.isInteger(source_id)) {
            await t.rollback();
            return res.status(400).json({ msg: 'Invalid semester ids' });
        }

        if (target_id === source_id) {
            await t.rollback();
            return res.status(400).json({ msg: 'Cannot copy a semester onto itself' });
        }

        const [target, source] = await Promise.all([
            Semester.findByPk(target_id, { transaction: t }),
            Semester.findByPk(source_id, { transaction: t })
        ]);

        if (!target || !source) {
            await t.rollback();
            return res.status(404).json({ msg: 'Semester not found' });
        }

        const copied = {};

        if (courses) {
            const [pending] = await connection.query(`
                SELECT COUNT(*) AS cnt
                FROM semester_courses sc
                WHERE sc.semester_id = :source
                  AND NOT EXISTS (
                    SELECT 1 FROM semester_courses x
                    WHERE x.semester_id = :target AND x.course_id = sc.course_id
                  )`, {
                    replacements: { target: target_id, source: source_id },
                    type: QueryTypes.SELECT,
                    transaction: t
                });

            await connection.query(`
                INSERT INTO semester_courses (semester_id, course_id)
                SELECT :target, sc.course_id
                FROM semester_courses sc
                WHERE sc.semester_id = :source
                  AND NOT EXISTS (
                    SELECT 1 FROM semester_courses x
                    WHERE x.semester_id = :target AND x.course_id = sc.course_id
                  )`, {
                    replacements: { target: target_id, source: source_id },
                    transaction: t
                });
            copied.courses = Number(pending.cnt);
        }

        if (tutors) {
            const [pending] = await connection.query(`
                SELECT COUNT(*) AS cnt
                FROM user_courses uc
                WHERE uc.semester_id = :source AND uc.status = 'Given'
                  AND NOT EXISTS (
                    SELECT 1 FROM user_courses x
                    WHERE x.user_id = uc.user_id AND x.course_id = uc.course_id
                      AND x.status = 'Given' AND x.semester_id = :target
                  )`, {
                    replacements: { target: target_id, source: source_id },
                    type: QueryTypes.SELECT,
                    transaction: t
                });

            await connection.query(`
                INSERT INTO user_courses (course_id, user_id, status, semester_id)
                SELECT uc.course_id, uc.user_id, 'Given', :target
                FROM user_courses uc
                WHERE uc.semester_id = :source AND uc.status = 'Given'
                  AND NOT EXISTS (
                    SELECT 1 FROM user_courses x
                    WHERE x.user_id = uc.user_id AND x.course_id = uc.course_id
                      AND x.status = 'Given' AND x.semester_id = :target
                  )`, {
                    replacements: { target: target_id, source: source_id },
                    transaction: t
                });
            copied.tutors = Number(pending.cnt);
        }

        if (students) {
            const [pending] = await connection.query(`
                SELECT COUNT(*) AS cnt
                FROM user_courses uc
                WHERE uc.semester_id = :source AND uc.status = 'Received'
                  AND NOT EXISTS (
                    SELECT 1 FROM user_courses x
                    WHERE x.user_id = uc.user_id AND x.course_id = uc.course_id
                      AND x.status = 'Received' AND x.semester_id = :target
                  )`, {
                    replacements: { target: target_id, source: source_id },
                    type: QueryTypes.SELECT,
                    transaction: t
                });

            await connection.query(`
                INSERT INTO user_courses (course_id, user_id, status, semester_id)
                SELECT uc.course_id, uc.user_id, 'Received', :target
                FROM user_courses uc
                WHERE uc.semester_id = :source AND uc.status = 'Received'
                  AND NOT EXISTS (
                    SELECT 1 FROM user_courses x
                    WHERE x.user_id = uc.user_id AND x.course_id = uc.course_id
                      AND x.status = 'Received' AND x.semester_id = :target
                  )`, {
                    replacements: { target: target_id, source: source_id },
                    transaction: t
                });
            copied.students = Number(pending.cnt);
        }

        // Ensure the roster covers every course referenced by copied assignments,
        // even when the standalone "courses" option was unchecked
        if (tutors || students) {
            await connection.query(`
                INSERT INTO semester_courses (semester_id, course_id)
                SELECT DISTINCT :target, uc.course_id
                FROM user_courses uc
                WHERE uc.semester_id = :target
                  AND NOT EXISTS (
                    SELECT 1 FROM semester_courses x
                    WHERE x.semester_id = :target AND x.course_id = uc.course_id
                  )`, {
                    replacements: { target: target_id },
                    transaction: t
                });
        }

        if (schedules) {
            const [pending] = await connection.query(`
                SELECT COUNT(*) AS cnt
                FROM schedules s
                WHERE s.semester_id = :source
                  AND NOT EXISTS (
                    SELECT 1 FROM schedules x
                    WHERE x.user_id = s.user_id AND x.day = s.day
                      AND x.start_time = s.start_time AND x.end_time = s.end_time
                      AND x.semester_id = :target
                  )`, {
                    replacements: { target: target_id, source: source_id },
                    type: QueryTypes.SELECT,
                    transaction: t
                });

            await connection.query(`
                INSERT INTO schedules (user_id, day, start_time, end_time, semester_id)
                SELECT s.user_id, s.day, s.start_time, s.end_time, :target
                FROM schedules s
                WHERE s.semester_id = :source
                  AND NOT EXISTS (
                    SELECT 1 FROM schedules x
                    WHERE x.user_id = s.user_id AND x.day = s.day
                      AND x.start_time = s.start_time AND x.end_time = s.end_time
                      AND x.semester_id = :target
                  )`, {
                    replacements: { target: target_id, source: source_id },
                    transaction: t
                });
            copied.schedules = Number(pending.cnt);
        }

        await t.commit();

        res.status(200).json({
            msg: `Rosters copied from ${source.semester_type} ${source.semester_year} to ${target.semester_type} ${target.semester_year}`,
            copied
        });
    } catch (e) {
        await t.rollback();
        console.error(e);
        res.status(500).json({ msg: 'An error occurred while copying the semester rosters' });
    }
}
