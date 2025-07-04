import User from "../models/User.js";
import Contact from "../models/Contact.js";
import TutorCourse from "../models/TutorCourse.js";
import Tutor from "../models/Tutor.js";
import Schedule from "../models/Schedule.js";
import connection from "../connection.js";
import {QueryTypes} from "sequelize";
import { sanitizeUserInput } from "../utils/sanitize.js";

export const getTutors = async (req, res) => {
    try {
        const tutors = await connection.query(` 
        SELECT CONCAT(u.first_name, ' ', u.last_name) as 'tutor_name', u.email as 'tutor_email', u.ku_id as 'tutor_id', m.major_name as 'tutor_major', GROUP_CONCAT(DISTINCT c.course_code ORDER BY c.course_code SEPARATOR ', ') AS tutor_courses, t.tutor_id as 'id'
        FROM users u 
        JOIN tutors t ON u.user_id = t.user_id
        JOIN majors m ON u.major_id = m.major_id
        JOIN user_courses tc ON t.user_id = tc.user_id
        JOIN courses c ON c.course_id = tc.course_id
        WHERE tc.status = 'Given'
        GROUP BY tutor_name, tutor_email, tutor_id, tutor_major, id
        ORDER BY tutor_id;`, {
            type: QueryTypes.SELECT,
            replacements: [],
        })
        res.status(201);
        res.json({
            tutors
        })
    }
    catch(e) {
        console.error(e)
    }
}

export const getTutorsByUser = async (req, res) => {
    try {
        const user_id = sanitizeUserInput(req.params.user_id)
        const tutors = await connection.query(
            `SELECT 
                CONCAT(u.first_name, ' ', u.last_name) as 'tutor_name', 
                u.email as 'tutor_email', 
                u.ku_id as 'tutor_id', 
                m.major_name as 'tutor_major', 
                GROUP_CONCAT(DISTINCT c.course_code ORDER BY c.course_code SEPARATOR ', ') AS tutor_courses,
                t.tutor_id as 'id'
            FROM 
                users u
            JOIN 
                tutors t ON u.user_id = t.user_id
            JOIN 
                majors m ON u.major_id = m.major_id
            JOIN 
                user_courses tc ON t.user_id = tc.user_id
            JOIN 
                courses c ON c.course_id = tc.course_id
            WHERE 
                tc.status = 'Given' 
                AND c.course_id IN (SELECT course_id FROM user_courses WHERE user_id = :user_id)
            GROUP BY 
                tutor_name, tutor_email, tutor_id, tutor_major, id
            ORDER BY 
                tutor_id;`, {
                    type: QueryTypes.SELECT,
                    replacements: { user_id: user_id },
                }
        )

        res.status(201);
        res.json({
            tutors
        })
    }
    catch(e) {
        console.error(e)
    }
}

export const addTutor = async (req, res) => {
    try {
        console.log(req.body);

        const classIDs = req.body['class-option'];
        const schedules = req.body.schedule;
        
        const user = new User({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            role: 'tutor',
            ku_id: req.body.id,
            major_id: req.body.major
        });

        await user.save();
        const userId = user.user_id;

        console.log("User Id:" + userId);

        const tutor = new Tutor({
            tutor_id: userId,
            user_id: userId,
        });

        await tutor.save(); 

                
        const phone = new Contact({
            user_id: userId,
            phone_number: req.body.phone_number
        })

        await phone.save();

        if (Array.isArray(schedules)) {
            for (const schedule of schedules) {
                for (const day of schedule.days) {
                    const newSchedule = new Schedule({
                        user_id: tutor.tutor_id,
                        day,
                        start_time: schedule.start_time,
                        end_time: schedule.end_time
                    });
                    await newSchedule.save();
                }
            }
        }
        
        if (Array.isArray(classIDs)) {
            for(const classID of classIDs) {
                const tutorCourse = new TutorCourse({
                    course_id: classID,
                    user_id: tutor.tutor_id,
                    status: 'Given'
                });
                await tutorCourse.save();
            }
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
}

export const getTutorById = async (req, res) => {
    try {
        const id  = sanitizeUserInput(req.params.tutor_id);
        const tutor_info = await connection.query(`SELECT CONCAT(u.first_name, ' ', u.last_name) as 'tutor_name', u.email as 'tutor_email', u.ku_id as 'tutor_id', m.major_name as 'tutor_major', t.official_schedule as 'tutor_schedule', c.phone_number as 'contact'
        FROM users u JOIN tutors t ON u.user_id = t.user_id
        JOIN majors m ON u.major_id = m.major_id
        JOIN contacts c ON t.user_id = c.user_id
        WHERE t.tutor_id = :tutor_id
        GROUP BY tutor_name, tutor_email, tutor_id, tutor_major, tutor_schedule, contact
        ORDER BY tutor_id;`, {
            type: QueryTypes.SELECT,
            replacements: {tutor_id: id}
        });

        res.status(200).json({ tutor_info });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
}

