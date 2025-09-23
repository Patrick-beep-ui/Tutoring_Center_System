import Course from "../models/Course.js";
import Major from "../models/Major.js";
import TutorCourse from "../models/TutorCourse.js";
import connection from "../connection.js";
import {QueryTypes, Sequelize, Transaction} from "sequelize";
import {sanitizeUserInput} from "../utils/sanitize.js";

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
    }
}

export const getCoursesByUser = async (req, res) => {
    const { user_id } = req.params;
    console.log("User ID from params:", user_id);
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
    }
}

export const getCoursesByMajor = async (req, res) => {
    try {
        const major_id = req.params.major_id;

        if(major_id) {
            const courses = await Course.findAll({
                where: {
                    major_id
                }
            });

            res.status(200).json({
                courses
            });
        }
    } catch(e) {
        console.error(e);
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

        await t.commit();
        //const courses = await Course.findAll();

        res.status(201).json({
            msg: 'Course added successfully',
            course
        });
    }
    catch(e) {
        await t.rollback();
        res.status(500).json({ msg: 'Internal server error' });
    }
}

export const getTutorCourses = async (req, res) => {
    try {
        const id  = sanitizeUserInput(req.params.tutor_id);

        if(id) {
            const tutor_classes = await connection.query(`
                SELECT 
                    u.first_name AS tutor_first_name,
                    u.last_name AS tutor_last_name,
                    c.course_name,
                    c.course_id,
                    COUNT(CASE WHEN sd.session_status = 'completed' AND sem.is_current = TRUE THEN s.session_id END) AS completed_sessions
                FROM 
                    users u
                JOIN 
                    user_courses uc ON u.user_id = uc.user_id
                LEFT JOIN 
                    courses c ON uc.course_id = c.course_id
                LEFT JOIN 
                    sessions s ON u.user_id = s.tutor_id 
                            AND s.course_id = c.course_id
                LEFT JOIN 
                    session_details sd ON s.session_id = sd.session_id
                LEFT JOIN 
                    semester sem ON s.semester_id = sem.semester_id
                WHERE 
                    u.user_id = :user_id
                GROUP BY 
                    u.user_id, c.course_id
                ORDER BY 
                    tutor_first_name, tutor_last_name, c.course_name, c.course_id;`, {
                    replacements: { user_id: id },
                    type: QueryTypes.SELECT
                });
        
                res.status(200).json({ tutor_classes });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
}