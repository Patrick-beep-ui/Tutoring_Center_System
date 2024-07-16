import express from 'express';
import {QueryTypes} from "sequelize";
import connection from "./connection.js";
import isAuth from './modules/auth.js';
import isAdmin from './modules/admin.js';

import Course from "./models/Course.js";
import Contact from "./models/Contact.js";
import Major from "./models/Major.js";
import Semester from "./models/Semester.js";
import Student from "./models/Student.js";
import Tutor from "./models/Tutor.js";
import TutorCourse from "./models/TutorCourse.js";
import TutorSession from "./models/TutorSession.js"
import User from "./models/User.js";

const api = express.Router({mergeParams: true});

// Endpoint to check authentication
api.route('/auth')
.get(isAuth, async (req, res) => {
    const id = req.user.user_id;
    const user = await User.findByPk(id);
    res.status(200).json({
        user
    });
});

//tutors
api.route("/tutors")
.get(async (req, res) => {
    try {
        const tutors = await connection.query(` SELECT CONCAT(u.first_name, ' ', u.last_name) as 'tutor_name', u.email as 'tutor_email', u.ku_id as 'tutor_id', m.major_name as 'tutor_major', t.official_schedule as 'tutor_schedule', t.tutor_id as 'id'
        FROM users u JOIN tutors t ON u.user_id = t.user_id
        JOIN majors m ON t.major_id = m.major_id
        GROUP BY tutor_name, tutor_email, tutor_id, tutor_major, tutor_schedule, id
        ORDER BY tutor_id;`, {
            type: QueryTypes.SELECT
        })
        res.status(201);
        res.json({
            tutors
        })
    }
    catch(e) {
        console.error(e)
    }
})
.post(async (req, res) => {
    try {
        console.log(req.body);

        const classIDs = req.body['class-option'];

        const user = new User({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            role: 'tutor',
            is_admin: req.body.is_admin,
            ku_id: req.body.id
        });

        await user.save();
        const userId = user.user_id;

        
        const phone = new Contact({
            phone_number: req.body.phone_number
        })

        await phone.save();

        console.log("User Id:" + userId);

        const tutor = new Tutor({
            user_id: userId,
            official_schedule: req.body.schedule,
            phone_id: phone.phone_id,
            major_id: req.body.major

        });

        await tutor.save();

        for(const classID of classIDs) {
            const tutorCourse = new TutorCourse({
                course_id: classID,
                tutor_id: tutor.tutor_id
            });
    
            await tutorCourse.save();
        }

        const tutors = await Tutor.findAll();

        res.status(201).json({
            msg: 'Tutor added successfully',
            tutors
        });
    }
    catch(e) {
        console.error(e);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

api.route("/tutors/:tutor_id")
.get(async (req, res) => {
    try {
        const id  = req.params.tutor_id;
        const tutor_info = await connection.query(`SELECT CONCAT(u.first_name, ' ', u.last_name) as 'tutor_name', u.email as 'tutor_email', u.ku_id as 'tutor_id', m.major_name as 'tutor_major', t.official_schedule as 'tutor_schedule', c.phone_number as 'contact'
        FROM users u JOIN tutors t ON u.user_id = t.user_id
        JOIN majors m ON t.major_id = m.major_id
        JOIN contacts c ON t.phone_id = c.phone_id
        WHERE t.tutor_id = ${id}
        GROUP BY tutor_name, tutor_email, tutor_id, tutor_major, tutor_schedule, contact
        ORDER BY tutor_id;`, {
            type: QueryTypes.SELECT
        });

        res.status(200).json({ tutor_info });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

api.route("/courses/:tutor_id")
.get(async (req, res) => {
    try {
        const id  = req.params.tutor_id;
        const tutor_classes = await connection.query(`SELECT c.course_name as 'course_name', c.course_code as 'course_code', tc.tutor_id as 'tutor_id', c.course_id as 'course_id'
        FROM courses c JOIN tutor_courses tc ON c.course_id = tc.course_id
        JOIN tutors t ON t.tutor_id = tc.tutor_id
        WHERE tc.tutor_id = ${id}
        GROUP BY course_name, course_code, tutor_id;`, {
            type: QueryTypes.SELECT
        });

        res.status(200).json({ tutor_classes });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//tutor_sessions
api.route('/sessions/:tutor_id?/:course_id?')
.get([isAuth], async (req, res) => {
    try {
        const id = req.params.tutor_id
        const course = req.params.course_id

        if(id || course) {
             const sessions = await connection.query(` SELECT s.session_id as 'session_id', CONCAT(u.first_name, ' ', u.last_name) as 'tutor_name', s.student_id as 'student',  c.course_name as 'course_name', s.session_totalhours as 'total_hours'
        FROM sessions s JOIN tutors t on s.tutor_id = t.tutor_id
        JOIN users u ON u.user_id = t.user_id
        JOIN courses c ON s.course_id = c.course_id
        WHERE t.tutor_id = ${id} AND s.course_id = ${course}
        GROUP BY session_id, tutor_name, student, total_hours
        ORDER BY course_name;`, {
            type: QueryTypes.SELECT
        })

        res.status(200).json({ sessions });
        } else {
            const sessions = await connection.query(` SELECT s.session_id as 'session_id', CONCAT(u.first_name, ' ', u.last_name) as 'tutor_name', s.student_id as 'student',  c.course_name as 'course_name', s.session_totalhours as 'total_hours', t.tutor_id as 'tutor_id'
            FROM sessions s JOIN tutors t on s.tutor_id = t.tutor_id
            JOIN users u ON u.user_id = t.user_id
            JOIN courses c ON s.course_id = c.course_id
            GROUP BY session_id, tutor_name, student, total_hours
            ORDER BY tutor_name, course_name;`, {
                type: QueryTypes.SELECT
            })

        res.status(200).json({ sessions });
        }
    }
    catch(e) {
        console.error(e)
    }
})
.post(async (req, res) => {
    const tutor_id = req.params.tutor_id
    const course_id = req.params.course_id

    const session = new TutorSession({
        tutor_id: tutor_id,
        student_id: req.body.student_id,
        course_id: course_id,
        semester_id: req.body.semester_id,
        session_date: req.body.session_date,
        session_totalhours: req.body.session_hours,
        feedback: req.body.feedback
    })

    await session.save();
    const sessions = await TutorSession.findAll()

    res.status(201).json({
        msg: 'Session added successfully',
        sessions
    });

})

//classes
api.route("/classes")
.get(async (req, res) => {
    try {   
        const courses = await connection.query(`SELECT 
        c.*, 
        COUNT(DISTINCT tc.tutor_id) AS tutors_counter
    FROM 
        courses c 
        LEFT JOIN tutor_courses tc ON c.course_id = tc.course_id
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
})
.post(async (req, res) => {
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
})

api.route("/majors")
.get(async (req, res) => {
    try {
        const majors = await Major.findAll()
        res.status(200).json({
            majors
        })
    }
    catch(e) {
        console.error(e);
    }
})
.post(async (req, res) => {
    try {
        const major = new Major({
            major_name: req.body.major_name
        })

        await major.save()
        const majors = await major.findAll()

        res.status(201).json({
            msg: 'Tutor added successfully',
            majors
        });
    } catch(e) {

    }
})

api.route("/terms")
.get(async (req, res) => {
    try {
        const terms = await Semester.findAll()
        res.status(200).json({
            terms
        })
    }
    catch(e) {
        console.error(e)
    }
})
.post(async (req, res) => {
    try {
        const term = new Semester({
            semester_type: req.body.semester_type,
            semester_code: req.body.semester_code,
            semester_year: req.body.semester_year,
            weeks: req.body.weeks
        })

        await term.save();

        res.status(200).json({
            msg: 'Term saved successfully',
            term
        });
    }
    catch(e) {
        console.error(e)
    }
})

//Reports

api.route("/report")
.get(async (req, res) => {
    try {
        const tutors = await Tutor.count();
        const sessions = await TutorSession.count();
        const tutor_courses = await TutorCourse.count({
            distinct: true,
            col: 'course_id'
        });
        const students = await User.count({
            where: {
                role: 'student'
            }
        });
        res.status(200).json({
            report: {
                tutors: tutors,
                sessions: sessions,
                tutor_courses: tutor_courses,
                students: students
              }
        })
    }
    catch(e) {
        console.error(e);
    }
});


export default api