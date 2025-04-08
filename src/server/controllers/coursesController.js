import Course from "../models/Course.js";
import Major from "../models/Major.js";
import TutorCourse from "../models/TutorCourse.js";
import connection from "../connection.js";
import {QueryTypes, Sequelize} from "sequelize";
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
    try {
        const course = new Course({
        course_name: req.body.class_name,
        course_code: req.body.course_code
        })

        await course.save();
        const courses = await Course.findAll();

        res.status(201).json({
            msg: 'Tutor added successfully',
            courses
        });
    }
    catch(e) {

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
                c.course_id as course_id,
                COUNT(s.session_id) AS completed_sessions
                FROM 
                    users u
                JOIN 
                    tutors t ON u.user_id = t.user_id
                JOIN 
                    user_courses uc ON t.user_id = uc.user_id
                LEFT JOIN 
                    courses c ON uc.course_id = c.course_id
                LEFT JOIN 
                    sessions s ON t.tutor_id = s.tutor_id AND s.course_id = c.course_id
                WHERE 
                    u.user_id = :user_id
                GROUP BY 
                    u.user_id, c.course_id
                ORDER BY 
                    tutor_first_name, tutor_last_name, c.course_name, course_id;`, {
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