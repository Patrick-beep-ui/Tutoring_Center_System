import Course from "../models/Course.js";
import Major from "../models/Major.js";
import TutorCourse from "../models/TutorCourse.js";
import connection from "../connection.js";
import {QueryTypes, Sequelize} from "sequelize";

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
        const id  = req.params.tutor_id;

        if(id) {
            const tutor_classes = await connection.query(`SELECT c.course_name as 'course_name', c.course_code as 'course_code', tc.user_id as 'tutor_id', c.course_id as 'course_id', COUNT(CASE WHEN sd.session_status = 'completed' THEN s.course_id END) AS 'sessions'
                FROM courses c JOIN user_courses tc ON c.course_id = tc.course_id
                JOIN tutors t ON t.tutor_id = tc.user_id
                LEFT JOIN sessions s ON s.course_id = c.course_id
                LEFT JOIN session_details sd ON s.session_id = sd.session_id
                WHERE tc.user_id = ${id}
                GROUP BY course_name, course_code, tutor_id, course_id;`, {
                    type: QueryTypes.SELECT
                });
        
                res.status(200).json({ tutor_classes });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
}