import Course from "../models/Course.js";
import connection from "../connection.js";
import {QueryTypes} from "sequelize";

export const getCourses = async (req, res) => {
    try {   
        const courses = await connection.query(`SELECT 
        c.*, 
        COUNT(DISTINCT tc.user_id) AS tutors_counter
    FROM 
        courses c 
        LEFT JOIN user_courses tc ON c.course_id = tc.course_id
    GROUP BY 
        c.course_id;`, {
            type: QueryTypes.SELECT
        })

        res.status(200).json({
            courses
        })
    }
    catch(e) {
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