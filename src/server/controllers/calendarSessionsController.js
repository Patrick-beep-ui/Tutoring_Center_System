import { QueryTypes } from "sequelize";
import connection from "../connection.js";
import SessionDetail from "../models/SessionDetail.js";
import TutorSession from "../models/TutorSession.js";
import Tutor from "../models/Tutor.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import { sendEmail, sendSessionRequestEmail } from "../mail.js";

export const getSessionsByTutor = async (req, res) => {
    try {
        const tutor_id = req.params.tutor_id;

        const sessions = await connection.query(
            `SELECT s.session_id as 'session_id', c.course_name as 'course_name',
                    CONCAT(student.first_name, ' ', student.last_name) as 'scheduled_by',
                    sd.session_time as 'session_time',
                    FORMAT(s.session_totalhours, 0) as 'session_duration',
                    s.session_date as 'session_date',
                    sd.session_status as 'session_status',
                    CONCAT(u.first_name, ' ', u.last_name) as 'tutor',
                    sd.createdBy as 'student_id'
            FROM sessions s
            JOIN tutors t on s.tutor_id = t.tutor_id
            JOIN users u ON u.user_id = t.user_id
            JOIN courses c ON s.course_id = c.course_id
            JOIN session_details sd ON s.session_id = sd.session_id
            JOIN users student ON student.user_id = sd.createdBy
            WHERE t.tutor_id = ${tutor_id}
            GROUP BY session_id, course_name, scheduled_by, session_time, session_duration, session_date, session_status, tutor, sd.createdBy;`,
            { type: QueryTypes.SELECT }
        );

        res.status(200).json({ sessions });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const createSession = async (req, res) => {
    try {
        const tutor_id = req.params.tutor_id

        const session = new TutorSession({
            tutor_id:tutor_id,
            student_id: req.body.student_id,
            course_id: req.body.course,
            semester_id: req.body.semester_id,
            session_date: req.body.session_date,
            session_totalhours: req.body.session_hours,
            topics: req.body.session_topics,
        })

        await session.save()

        const session_detail = new SessionDetail({
            session_id: session.session_id,
            session_time: req.body.session_time,
            session_status: 'pending',
            createdBy: req.body.created_by,
            createdAt: new Date(),
            updatedAt: new Date(),
        })

        await session_detail.save()

        const tutor = await Tutor.findByPk(tutor_id);
        const tutor_user = await User.findByPk(tutor.user_id);
        const student = await User.findByPk(req.body.created_by)

        const { course_name } = await Course.findByPk(req.body.course, {
            attributes: ['course_name']
        });

        /*
        const emailText = `
            Hey ${tutor_user.first_name} ${tutor_user.last_name},

            You've received a session request from ${student.first_name} ${student.last_name}.

            Session Details:
            - Course: ${course_name}
            - Date: ${req.body.session_date}
            - Time: ${req.body.session_time}
            - Hours: ${req.body.session_hours}

            - Topics: ${req.body.session_topics}

            Please click on the links below to accept or decline the session:

            Accept: http://localhost:3000/api/calendar-session/accept/${session.session_id}
            Decline: http://localhost:3000/api/calendar-session/decline/${session.session_id}
        `;

        await sendEmail(tutor_user.email, 'New Session Request', emailText);
        */

        await sendSessionRequestEmail(tutor_user.email, {
            tutorName: `${tutor_user.first_name} ${tutor_user.last_name}`,
            studentName: `${student.first_name} ${student.last_name}`,
            courseName: course_name,
            date: req.body.session_date,
            time: req.body.session_time,
            hours: req.body.session_hours, 
            topics: req.body.session_topics,
            acceptUrl: `http://localhost:3000/api/calendar-session/accept/${session.session_id}`,
            declineUrl: `http://localhost:3000/api/calendar-session/decline/${session.session_id}`
        });

        res.status(201).json({
            msg: 'Session request sent to the tutor. Waiting for acceptance.',
        });
    }
    catch(e) {

    }
};

export const acceptSession = async (req, res) => {
    try {
        const session_id = req.params.session_id;

        const session = await SessionDetail.findByPk(session_id);

        if (!session) {
            return res.status(404).json({ msg: "Session not found" });
        }

        await session.update({
            session_status: "scheduled"
        });

        res.json({ msg: "Session accepted successfully" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: "Error accepting the session" });
    }
};

export const declineSession = async (req, res) => {
    try {
        const session_id = req.params.session_id;

        const session = await TutorSession.findByPk(session_id);
        const session_detail = await SessionDetail.findByPk(session_id);

        if (!session) {
            return res.status(404).json({ msg: "Session not found" });
        }

        session.tutor_id = null;
        await session.save();

        res.json({ msg: "Session declined successfully" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: "Error declining the session" });
    }
};