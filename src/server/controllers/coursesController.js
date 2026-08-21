import Course from "../models/Course.js";
import Major from "../models/Major.js";
import TutorCourse from "../models/TutorCourse.js";
import SemesterCourse from "../models/SemesterCourse.js";
import connection from "../connection.js";
import {QueryTypes, Sequelize, Transaction} from "sequelize";
import {sanitizeUserInput} from "../utils/sanitize.js";
import { resolveSemesterId } from "../utils/currentSemester.js";

export const getCourses = async (req, res) => {
    try {
        const courses = await Course.findAll({
            attributes: {
              include: [
                [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('user_id'))), 'tutors_counter']
              ]
            },
            include: [
              {
                model: TutorCourse,
                attributes: [],
                required: false
              },
              {
                model: Major,
                attributes: ['major_name'],
                required: false
              }
            ],
            group: ['course_id', 'major_id']
          });

        res.status(200).json({
            courses
        })
    }
    catch(e) {
        console.error(e);
        res.status(500).json({ msg: 'An error occurred while fetching courses' });
    }
}

export const getSemesterCourses = async (req, res) => {
    try {
        const semester_id = await resolveSemesterId(req.params.semester_id === 'current' ? null : req.params.semester_id);

        const courses = await connection.query(`
            SELECT
                c.course_id,
                c.course_name,
                c.course_code,
                c.credits,
                c.major_id,
                m.major_name,
                COUNT(DISTINCT CASE WHEN uc.status = 'Given' THEN uc.user_id END) AS tutors_counter
            FROM semester_courses sc
            JOIN courses c ON sc.course_id = c.course_id
            LEFT JOIN majors m ON c.major_id = m.major_id
            LEFT JOIN user_courses uc ON uc.course_id = c.course_id AND uc.semester_id = sc.semester_id
            WHERE sc.semester_id = :semester_id
            GROUP BY c.course_id, c.course_name, c.course_code, c.credits, c.major_id, m.major_name
            ORDER BY c.course_name;`, {
                replacements: { semester_id },
                type: QueryTypes.SELECT
            });

        res.status(200).json({ courses });
    }
    catch(e) {
        if (e.message === 'No current semester is set') {
            return res.status(404).json({ msg: e.message });
        }
        console.error(e);
        res.status(500).json({ msg: 'An error occurred while fetching semester courses' });
    }
}

export const getCatalogWithSemesterFlag = async (req, res) => {
    try {
        const semester_id = await resolveSemesterId(req.query.semester_id);

        const courses = await connection.query(`
            SELECT
                c.course_id,
                c.course_name,
                c.course_code,
                c.credits,
                c.major_id,
                m.major_name,
                (sc.semester_course_id IS NOT NULL) AS offered,
                COUNT(DISTINCT CASE WHEN uc.status = 'Given' AND uc.semester_id = :semester_id THEN uc.user_id END) AS tutors_counter
            FROM courses c
            LEFT JOIN majors m ON c.major_id = m.major_id
            LEFT JOIN semester_courses sc ON sc.course_id = c.course_id AND sc.semester_id = :semester_id
            LEFT JOIN user_courses uc ON uc.course_id = c.course_id
            GROUP BY c.course_id, c.course_name, c.course_code, c.credits, c.major_id, m.major_name, offered
            ORDER BY c.course_name;`, {
                replacements: { semester_id },
                type: QueryTypes.SELECT
            });

        res.status(200).json({ courses });
    }
    catch(e) {
        if (e.message === 'No current semester is set') {
            return res.status(404).json({ msg: e.message });
        }
        console.error(e);
        res.status(500).json({ msg: 'An error occurred while fetching the course catalog' });
    }
}

export const getCoursesByUser = async (req, res) => {
    const { user_id } = req.params;
    try {
        const courses = await Course.findAll({
            attributes: {
              include: [
                [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('user_id'))), 'tutors_counter']
              ]
            },
            include: [
              {
                model: TutorCourse,
                attributes: ['user_id', 'tutor_course_id'],
                required: true,
                where: {
                    user_id: user_id
                }
              },
              {
                model: Major,
                attributes: ['major_name', 'major_id'],
                required: false
              }
            ],
            group: ['course_id', 'major_id', 'TutorCourses.tutor_course_id', 'TutorCourses.user_id', 'Major.major_id']
        });


        res.status(200).json({
            courses
        })
    }
    catch(e) {
        console.error(e);
        res.status(500).json({ msg: 'An error occurred while fetching user courses' });
    }
}

export const getCoursesByMajor = async (req, res) => {
    try {
        const major_id = req.params.major_id;

        if(major_id) {
            // Scope to current semester offerings: students/tutors can only pick courses being offered now
            const currentSemesterId = await resolveSemesterId(null);
            const courses = await connection.query(`
                SELECT c.course_id, c.course_name, c.course_code, c.credits, c.major_id
                FROM courses c
                JOIN semester_courses sc ON sc.course_id = c.course_id
                WHERE c.major_id = :major_id AND sc.semester_id = :semester_id
                ORDER BY c.course_name;`, {
                    replacements: { major_id, semester_id: currentSemesterId },
                    type: QueryTypes.SELECT
                });

            res.status(200).json({
                courses
            });
        }
    } catch(e) {
        if (e.message === 'No current semester is set') {
            return res.status(404).json({ msg: e.message });
        }
        console.error(e);
        res.status(500).json({ msg: 'An error occurred while fetching courses by major' });
    }
}

export const addCourse = async (req, res) => {
    const t = await connection.transaction();
    try {
        const { class_name, course_code, course_credits, major_id } = req.body;

        const existingCourse = await Course.findOne({
            where: { course_code },
            transaction: t
         });
        if (existingCourse) {
          await t.rollback();
          return res.status(409).json({ msg: 'Course already exists with that code' });
        }

        const course = await Course.create(
            {
              course_name: class_name,
              course_code,
              credits: course_credits,
              major_id
            },
            { transaction: t }
          );

        // Auto-register new course into the current semester roster
        const currentSemesterId = await resolveSemesterId(null);
        await SemesterCourse.create(
            { semester_id: currentSemesterId, course_id: course.course_id },
            { transaction: t }
        );

        await t.commit();

        res.status(201).json({
            msg: 'Course added successfully',
            course
        });
    }
    catch(e) {
        await t.rollback();
        if (e.message === 'No current semester is set') {
            return res.status(404).json({ msg: e.message });
        }
        console.error(e);
        res.status(500).json({ msg: 'Internal server error' });
    }
}

export const addCourseToSemester = async (req, res) => {
    try {
        const course_id = sanitizeUserInput(req.params.course_id);
        const semester_id = await resolveSemesterId(req.params.semester_id === 'current' ? null : req.params.semester_id);

        const course = await Course.findByPk(course_id);
        if (!course) {
            return res.status(404).json({ msg: 'Course not found' });
        }

        const [existing, created] = await SemesterCourse.findOrCreate({
            where: { semester_id, course_id },
            defaults: { semester_id, course_id }
        });

        if (!created) {
            return res.status(200).json({ msg: 'Course is already in this semester roster' });
        }

        res.status(201).json({ msg: 'Course added to semester roster' });
    } catch (e) {
        if (e.message === 'No current semester is set') {
            return res.status(404).json({ msg: e.message });
        }
        console.error(e);
        res.status(500).json({ msg: 'An error occurred while adding the course to the semester' });
    }
}

export const removeCourseFromSemester = async (req, res) => {
    try {
        const course_id = sanitizeUserInput(req.params.course_id);
        const semester_id = await resolveSemesterId(req.params.semester_id === 'current' ? null : req.params.semester_id);

        const existing = await SemesterCourse.findOne({ where: { semester_id, course_id } });
        if (!existing) {
            return res.status(404).json({ msg: 'Course is not in this semester roster' });
        }

        // Guard: block removal if assignments/enrollments or sessions reference it this semester
        const [assignmentRows] = await connection.query(
            `SELECT COUNT(*) AS cnt FROM user_courses WHERE course_id = :course_id AND semester_id = :semester_id`,
            { replacements: { course_id, semester_id }, type: QueryTypes.SELECT }
        );
        if (Number(assignmentRows.cnt) > 0) {
            return res.status(400).json({ msg: `Cannot remove: ${assignmentRows.cnt} tutor/student assignment(s) exist for this course in the selected semester. Reassign them first.` });
        }

        const [sessionRows] = await connection.query(
            `SELECT COUNT(*) AS cnt FROM sessions WHERE course_id = :course_id AND semester_id = :semester_id`,
            { replacements: { course_id, semester_id }, type: QueryTypes.SELECT }
        );
        if (Number(sessionRows.cnt) > 0) {
            return res.status(400).json({ msg: `Cannot remove: ${sessionRows.cnt} session(s) recorded for this course in the selected semester.` });
        }

        await existing.destroy();

        res.status(200).json({ msg: 'Course removed from semester roster' });
    } catch (e) {
        if (e.message === 'No current semester is set') {
            return res.status(404).json({ msg: e.message });
        }
        console.error(e);
        res.status(500).json({ msg: 'An error occurred while removing the course from the semester' });
    }
}

export const getTutorCourses = async (req, res) => {
    try {
        const id  = sanitizeUserInput(req.params.tutor_id);
        const semester_id = await resolveSemesterId(req.query.semester_id);

        if(id) {
            const tutor_classes = await connection.query(`
                SELECT
                    u.first_name AS tutor_first_name,
                    u.last_name AS tutor_last_name,
                    c.course_name,
                    c.course_id,
                    COUNT(CASE WHEN sd.session_status = 'completed' THEN s.session_id END) AS completed_sessions
                FROM
                    users u
                JOIN
                    user_courses uc ON u.user_id = uc.user_id AND uc.semester_id = :semester_id
                LEFT JOIN
                    courses c ON uc.course_id = c.course_id
                LEFT JOIN
                    sessions s ON u.user_id = s.tutor_id
                            AND s.course_id = c.course_id
                            AND s.semester_id = :semester_id
                LEFT JOIN
                    session_details sd ON s.session_id = sd.session_id
                WHERE
                    u.user_id = :user_id
                GROUP BY
                    u.user_id, c.course_id
                ORDER BY
                    tutor_first_name, tutor_last_name, c.course_name, c.course_id;`, {
                    replacements: { user_id: id, semester_id },
                    type: QueryTypes.SELECT
                });

                res.status(200).json({ tutor_classes });
        }
    } catch (e) {
        if (e.message === 'No current semester is set') {
            return res.status(404).json({ msg: e.message });
        }
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
}
