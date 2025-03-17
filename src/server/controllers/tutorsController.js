import User from "../models/User.js";
import Contact from "../models/Contact.js";
import TutorCourse from "../models/TutorCourse.js";
import Tutor from "../models/Tutor.js";
import connection from "../connection.js";
import {QueryTypes} from "sequelize";

export const getTutors = async (req, res) => {
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
}

export const addTutor = async (req, res) => {
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

        console.log("User Id:" + userId);

        const tutor = new Tutor({
            tutor_id: userId,
            user_id: userId,
            official_schedule: req.body.schedule,
            major_id: req.body.major

        });

        await tutor.save();
        const tutorId = tutor.tutor_id; 

                
        const phone = new Contact({
            tutor_id: tutorId,
            phone_number: req.body.phone_number
        })

        await phone.save();

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
}

export const getTutorById = async (req, res) => {
    try {
        const id  = req.params.tutor_id;
        const tutor_info = await connection.query(`SELECT CONCAT(u.first_name, ' ', u.last_name) as 'tutor_name', u.email as 'tutor_email', u.ku_id as 'tutor_id', m.major_name as 'tutor_major', t.official_schedule as 'tutor_schedule', c.phone_number as 'contact'
        FROM users u JOIN tutors t ON u.user_id = t.user_id
        JOIN majors m ON t.major_id = m.major_id
        JOIN contacts c ON t.tutor_id = c.tutor_id
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
}