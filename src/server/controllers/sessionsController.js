import TutorSession from "../models/TutorSession.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import SessionDetail from "../models/SessionDetail.js";
import Semester from "../models/Semester.js";
import connection from "../connection.js";
import { sendFeedbackEmail } from "../mail.js";
import { QueryTypes } from "sequelize";
import { sanitizeUserInput } from "../utils/sanitize.js";

import os from 'os';

function getLocalIPAddress() {
    const interfaces = os.networkInterfaces();
    for (const iface of Object.values(interfaces)) {
        for (const details of iface) {
            if (details.family === 'IPv4' && !details.internal) {
                return details.address;
            }
        }
    }
    return 'localhost'; // fallback
}

export const getSessions = async (req, res) => {
    try {
        const sessions = await connection.query(`
            SELECT
                s.session_id AS 'session_id',
                    CONCAT(tutor.first_name, ' ', tutor.last_name) AS 'tutor_name',
                    s.student_id AS 'student_id',
                    CONCAT(student.first_name, ' ', student.last_name) AS 'student_name',
                    c.course_name AS 'course_name',
                    s.session_totalhours AS 'total_hours',
                    t.tutor_id AS 'tutor_id',
                    CONCAT(
                        TIME_FORMAT(sd.session_time, '%h:%i %p'),
                            ' - ',
                            TIME_FORMAT(ADDTIME(sd.session_time, SEC_TO_TIME(s.session_totalhours * 3600)), '%h:%i %p')
                        ) AS 'session_duration',
                    s.session_date AS 'session_date',
                    sd.session_status AS 'session_status',
                    WEEK(s.session_date, 1) - WEEK(semester.start_date, 1) + 1 AS 'week_number',
                    s.topics AS 'session_topics',
                    s.feedback AS 'session_feedback',
                    IFNULL(fe.rating, 0) AS 'rating'
            FROM sessions s
                     JOIN session_details sd ON s.session_id = sd.session_id
                     JOIN tutors t ON s.tutor_id = t.tutor_id
                     JOIN users tutor ON tutor.user_id = t.user_id  -- Get tutor's name
                     JOIN users student ON student.ku_id = s.student_id  -- Get student's name
                     JOIN courses c ON s.course_id = c.course_id
                     JOIN semester semester ON semester.semester_id = s.semester_id  -- Join with semester table
                     LEFT JOIN session_feedback as fe ON s.session_id = fe.session_id
            WHERE semester.is_current = TRUE 
            ORDER BY week_number, session_date;
        `, {
            type: QueryTypes.SELECT
        });
        
        res.status(200).json({ sessions });
    }
    catch(e) {
        console.error("Error getting sessions:",e);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const getSessionsByTutor = async (req, res) => {
    try {
        const id = req.params.tutor_id

        // Validate and sanitize tutor_id
        const sanitizedId = sanitizeUserInput(id);

        if (!Number.isInteger(Number(sanitizedId))) {
            return res.status(400).json({ error: 'Invalid tutor ID' });
        } 

        const sessions = await connection.query(`SELECT s.session_id as 'session_id', CONCAT(u.first_name, ' ', u.last_name) as 'tutor_name', s.student_id as 'student',  c.course_name as 'course_name', s.session_totalhours as 'total_hours', s.session_date as 'session_date'
            FROM sessions s JOIN tutors t on s.tutor_id = t.tutor_id
            JOIN users u ON u.user_id = t.user_id
            JOIN courses c ON s.course_id = c.course_id
            JOIN semester semester ON semester.semester_id = s.semester_id
            WHERE t.tutor_id = :id AND semester.is_current = TRUE
            GROUP BY session_id, tutor_name, student, total_hours
            ORDER BY course_name;`, {
                type: QueryTypes.SELECT,
                replacements: { id: sanitizedId }
            })
    
            res.status(200).json({ sessions });
    }
    catch(e) {
        console.error("Error getting tutor sessions:",e);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const getSessionsByTutorCourse = async (req, res) => {
    try {
        const tutor_id = req.params.tutor_id;
        const course_id = req.params.course_id;

        // Validate and sanitize tutor_id and course_id
        const sanitizedTutorId = sanitizeUserInput(tutor_id);
        const sanitizedCourseId = sanitizeUserInput(course_id);

        if (!Number.isInteger(Number(sanitizedTutorId)) || !Number.isInteger(Number(sanitizedCourseId))) {
            return res.status(400).json({ error: 'Invalid tutor ID or course ID' });
        }

        const sessions = await connection.query(` SELECT s.session_id as 'session_id', CONCAT(u.first_name, ' ', u.last_name) as 'tutor_name', s.student_id as 'student',  c.course_name as 'course_name', s.session_totalhours as 'total_hours', s.session_date as 'session_date'
            FROM sessions s JOIN tutors t on s.tutor_id = t.tutor_id
            JOIN users u ON u.user_id = t.user_id
            JOIN courses c ON s.course_id = c.course_id
            JOIN session_details sd ON s.session_id = sd.session_id
            JOIN semester se ON s.semester_id = se.semester_id
            WHERE t.tutor_id = :tutor_id AND s.course_id = :course_id AND sd.session_status = 'completed' AND se.is_current = TRUE
            GROUP BY session_id, tutor_name, student, total_hours
            ORDER BY course_name;`, {
                type: QueryTypes.SELECT,
                replacements: { tutor_id: sanitizedTutorId, course_id: sanitizedCourseId }
            })
    
            res.status(200).json({ sessions });
    }
    catch(e) {
        console.error("Error getting tutor course sessions:",e);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Get Session details on the Tutor Sessions part
export const getTutorSessionById = async (req, res) => {
    try {
        const session_id = req.params.session_id

         // Validate and sanitize tutor_id and course_id
        const sanitizedSessionId = sanitizeUserInput(session_id);

        if (!Number.isInteger(Number(sanitizedSessionId))) {
            return res.status(400).json({ error: 'Invalid session ID' });
        }

        const session = await connection.query(`SELECT s.session_id as 'session_id', c.course_name as 'course_name', CONCAT(u.first_name, ' ', u.last_name) as 'scheduled_by', sd.session_time as 'session_time', FORMAT(s.session_totalhours, 0) as 'session_durarion' ,s.session_date as 'session_date', sd.session_status as 'session_status', s.topics as 'session_topics', s.feedback as 'session_feedback'
            FROM sessions s JOIN tutors t on s.tutor_id = t.tutor_id
            JOIN courses c ON s.course_id = c.course_id
            JOIN session_details sd ON s.session_id = sd.session_id
            JOIN users u ON u.user_id = sd.createdBy
            WHERE s.session_id = :session_id
            GROUP BY session_id, course_name, scheduled_by, session_time, session_date, session_status, session_topics;`, {
                type: QueryTypes.SELECT,
                replacements: { session_id: sanitizedSessionId }
            })

            res.status(200).json({ session });

    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
}


// Get Sessions Details on sessions screen
export const getSessionDetails = async (req, res) => {
    try {
        const session_id = req.params.session_id

        // Validate and sanitize tutor_id and course_id
        const sanitizedSessionId = sanitizeUserInput(session_id);

        if (!Number.isInteger(Number(sanitizedSessionId))) {
            return res.status(400).json({ error: 'Invalid session ID' });
        }

        if(session_id) {
            const session = await connection.query(`SELECT CONCAT(u.first_name, ' ', u.last_name) as 'tutor_name', c.course_name as 'course_name', s.session_date as 'session_date', s.student_id as 'student_id', FORMAT(s.session_totalhours, 0) as 'session_hours', 
            s.feedback as 'session_feedback', sd.session_time as 'session_time', su.user_id AS 'student_user_id',
            CONCAT(su.first_name, ' ', su.last_name) AS 'student_name', s.topics as 'session_topics'
            FROM sessions s LEFT JOIN session_details sd ON s.session_id = sd.session_id
            JOIN courses c ON s.course_id = c.course_id
            JOIN tutors t ON s.tutor_id = t.tutor_id
            JOIN users u ON u.user_id = t.user_id
            LEFT JOIN users su ON su.ku_id = s.student_id
            WHERE s.session_id = :session_id
            GROUP BY tutor_name, course_name, session_date, student_id, session_hours, session_time, student_user_id, student_name, session_status, session_topics;`, 
            {
                type: QueryTypes.SELECT,
                replacements: { session_id: sanitizedSessionId }
            })
            res.status(200).json({ session });
        }
    }
    catch(e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
}


// Get Scheduled Sessions for the Tutor scheduled sessions alert in the tutor Profile
export const getScheduledSessionsCount = async (req, res) => {
    try {
        const id = req.params.tutor_id;

        const scheduled_sessions = await SessionDetail.count({
            distinct: true,
            col: 'session_id',
            include: [
                {
                    model: TutorSession,
                    where: { tutor_id: id },
                    include: [
                        {
                            model: Semester,
                            where: { is_current: true }
                        }
                    ]
                },
            ],
            where: {
                session_status: 'scheduled'
            }
        });

        res.status(200).json({
            scheduled_sessions
        });
    }
    catch(e) {
        console.error("Error fetching scheduled sessions:",e);
        res.status(500).json({ error: 'Internal server error' });
    }
}


// Get Scheduled Sessions for the Tutor scheduled sessions table after clicking on the alert in the tutor profile
export const getScheduledSessionsItems = async (req, res) => {
    try {
        const scheduled = req.params.scheduled
        const id = req.params.tutor_id;

        // Validate and sanitize tutor_id
        const sanitizedId = sanitizeUserInput(id);

        if (!Number.isInteger(Number(sanitizedId))) {
            return res.status(400).json({ error: 'Invalid tutor ID' });
        }        

        const scheduled_sessions = await connection.query(` SELECT s.session_id as 'session_id', CONCAT(u.first_name, ' ', u.last_name) as 'tutor_name', s.student_id as 'student',  c.course_name as 'course_name', s.session_totalhours as 'total_hours', s.session_date as 'session_date'
            FROM sessions s JOIN tutors t on s.tutor_id = t.tutor_id
            JOIN users u ON u.user_id = t.user_id
            JOIN courses c ON s.course_id = c.course_id
            JOIN session_details sd ON s.session_id = sd.session_id
            JOIN semester se ON s.semester_id = se.semester_id
            WHERE t.tutor_id = :id AND sd.session_status = 'scheduled' AND se.is_current = TRUE
            GROUP BY session_id, tutor_name, student, total_hours
            ORDER BY course_name;`, {
                replacements: { id: sanitizedId },
                type: QueryTypes.SELECT
            })

            res.status(200).json({ scheduled_sessions });
    }
    catch(e) {
        console.error("Error fetching scheduled session items:",e);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Add a new session from tutor profile
export const addSession = async (req, res) => {
    try {
        const current_semester = await Semester.findOne({
            where: {
                is_current: true
            }
        })
        
        const tutor_id = req.params.tutor_id
        const course_id = req.params.course_id
    
        const session = new TutorSession({
            tutor_id: tutor_id,
            student_id: req.body.student_id,
            course_id: course_id,
            semester_id: current_semester.semester_id,
            session_date: req.body.session_date,
            session_totalhours: req.body.session_hours,
            feedback: req.body.feedback
        })
    
        await session.save();
    
        const session_detail = new SessionDetail({
            session_id: session.session_id,
            session_time: req.body.session_time,
            session_status: 'completed',
            createdBy:tutor_id,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
    
        await session_detail.save();
    
        const sessions = await TutorSession.findAll()
    
        res.status(201).json({
            msg: 'Session added successfully',
            sessions
        });
        }
        catch(e) {
            console.error(e)
        }
}

//Update Session from tutor profile
export const editSession = async (req, res) => {
    try {
        const session_id = req.params.session_id
        const {session_date, session_hours, feedback, session_time, topics, source} = req.body;
        
        const session = await TutorSession.findOne({
            where: {
                session_id: session_id
            }
        })

        console.log("Source Status Reached:", source)

        await session.update({
            session_date: session_date,
            session_totalhours: session_hours,
            feedback: feedback,
            topics: topics

        })

        const session_detail = await SessionDetail.findOne({
            where: {
                session_id: session_id
            }
        })

        // Change logic based on source status
        if (source === 'scheduled') {
            await session_detail.update({
                session_time,
                session_status: 'completed',
                updatedAt: new Date()
            });
        } else {
            await session_detail.update({
                session_time,
                updatedAt: new Date()  
            });
        }

        const student = await User.findOne({
            where: {
                ku_id: session.student_id
            }
        })

        if(source === 'scheduled' && student) {
            const tutor = await User.findOne({
                where: {
                    user_id: session.tutor_id
                }
            })

            const course = await Course.findOne({
                where: {
                    course_id: session.course_id
                }
            })

            //const protocol = req.protocol;
            //const host = req.get('host');
            //const feedbackUrl = `${protocol}://${host}/feedback/${session.session_id}/${student.user_id}`;

            const localIP = getLocalIPAddress();
            const feedbackUrl = `http://${localIP}:3000/feedback/${session.session_id}/${student.ku_id}`;

            await sendFeedbackEmail(student.email, {
                tutorName: `${tutor.first_name} ${tutor.last_name}`,
                studentName: `${student.first_name} ${student.last_name}`,
                courseName: course.course_name,
                topics: session.topics,
                date: new Date(session.session_date).toLocaleDateString('en-US', { timeZone: 'UTC' }),
                time: session_time,
                duration: session_hours,
                //feedbackUrl: `http://localhost:3000/feedback/${session.session_id}/${student.user_id}`,
                feedbackUrl: feedbackUrl,
            })
        }

        res.json({
            message: 'Session updated successfully'
        })
    }
    catch(e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
}