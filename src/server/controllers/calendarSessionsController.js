import { QueryTypes } from "sequelize";
import connection from "../connection.js";
import SessionDetail from "../models/SessionDetail.js";
import TutorSession from "../models/TutorSession.js";
import Tutor from "../models/Tutor.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Semester from "../models/Semester.js";
import { sendEmail, sendSessionRequestEmail } from "../mail.js";
import { sanitizeUserInput } from "../utils/sanitize.js";
import { sendSessionCancelationEmail } from "../mail.js";

import jwt from "jsonwebtoken";
import { tokenStore } from "../utils/tokenStore.js";

export const getSessionsByTutor = async (req, res) => {
    try {
        const tutor_id = req.params.tutor_id;

        const sanitizedTutorId = sanitizeUserInput(tutor_id);

        if (!Number.isInteger(Number(sanitizedTutorId))) {
            return res.status(400).json({ error: 'Invalid tutor ID' });
        }   

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
            JOIN semester sem ON s.semester_id = sem.semester_id
            WHERE t.tutor_id = :tutor_id AND sd.session_status = 'scheduled' AND sem.is_current = true
            GROUP BY session_id, course_name, scheduled_by, session_time, session_duration, session_date, session_status, tutor, sd.createdBy;`,
            { 
                type: QueryTypes.SELECT,
                replacements: { tutor_id: sanitizedTutorId }
             }
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
        
        const current_semester = await Semester.findOne({
            where: {
                is_current: true
            }
        })

        const session = new TutorSession({
            tutor_id:tutor_id,
            student_id: req.body.student_id,
            course_id: req.body.course,
            semester_id: current_semester.semester_id,
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
        
        console.log("Session request email sent to tutor:", tutor_user.email);
        console.log("Session has been created");
        console.log("Waiting for sending email...")

        // Generate a one-time-use JWT token
        const token = jwt.sign(
            { sid: session.session_id, tutor_id: tutor.tutor_id },
            process.env.SESSION_SECRET,
            { expiresIn: "7d" } // valid for a week
        );
    
        // Store token for one-time validation
        tokenStore.add(token);

        await sendSessionRequestEmail(tutor_user.email, {
            tutorName: `${tutor_user.first_name} ${tutor_user.last_name}`,
            studentName: `${student.first_name} ${student.last_name}`,
            courseName: course_name,
            date: req.body.session_date,
            time: req.body.session_time,
            hours: req.body.session_hours, 
            topics: req.body.session_topics,
            acceptUrl: `http://localhost:3000/api/calendar-session/accept/${session.session_id}?token=${token}`,
            declineUrl: `http://localhost:3000/api/calendar-session/decline/${session.session_id}?token=${token}`
        });

        console.log("Email sent to tutor:", tutor_user.email);
        

        res.status(201).json({
            msg: 'Session request sent to the tutor. Waiting for acceptance.',
        });
    }
    catch(e) {
        console.error(e);
        
    }
};

export const acceptSession = async (req, res) => {
    try {
        const session_id = req.params.session_id;
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ msg: "Missing token" });
        }

        if (!tokenStore.has(token)) {
            return res.status(403).json({ msg: "Token already used or invalid" });
        }

        const decoded = jwt.verify(token, process.env.SESSION_SECRET);

        
        if (decoded.sid !== parseInt(session_id)) {
            return res.status(403).json({ msg: "Token does not match session" });
          }
      
        tokenStore.delete(token);

        const session = await SessionDetail.findByPk(session_id);

        if (!session) {
            return res.status(404).json({ msg: "Session not found" });
        }

        await session.update({
            session_status: "scheduled"
        });

        //res.json({ msg: "Session accepted successfully" });
        return res.redirect('http://localhost:3000/session-accepted');

    } catch (e) {
        console.error(e);
        return res.redirect('http://localhost:3000/server-error-505');
    }
};

export const declineSession = async (req, res) => {
    try {
        const session_id = req.params.session_id;
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ msg: "Missing token" });
          }

          if (!tokenStore.has(token)) {
            return res.status(403).json({ msg: "Token already used or invalid" });
          }
        
          const decoded = jwt.verify(token, process.env.SESSION_SECRET);

          if (decoded.sid !== parseInt(session_id)) {
            return res.status(403).json({ msg: "Token does not match session" });
          }
      
          tokenStore.delete(token);

        const session = await TutorSession.findByPk(session_id);
        const session_detail = await SessionDetail.findByPk(session_id);

        if (!session) {
            return res.status(404).json({ msg: "Session not found" });
        }

        const tutor_id = session.tutor_id;

        session.tutor_id = null;
        session_detail.session_status = "canceled";
        
        await session.save();
        await session_detail.save();

        //res.json({ msg: "Session declined successfully" });
        return res.redirect(`http://localhost:3000/session-declined?sid=${session_id}&tid=${tutor_id}`);
    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: "Error declining the session" });
    }
};

export const sendDeclineJustification = async (req, res) => {
    try {
      const { session_id } = req.params;
      const { message, tutorName } = req.body;

      console.log("Received justification message:", message);
      console.log("For session ID:", session_id);
  
      if (!message || message.trim().length === 0) {
        return res.status(400).json({ msg: "Message cannot be empty." });
      }
  
      const session = await TutorSession.findByPk(session_id);
      const session_detail = await SessionDetail.findByPk(session_id);
  
      if (!session || !session_detail) {
        return res.status(404).json({ msg: "Session not found." });
      }

      console.log("Fetched session:", session);
  
      const student = await User.findOne({ where: { ku_id: session.student_id } });
      const course = await Course.findOne({ where: { course_id: session.course_id } });

      console.log("Fetched student:", student);
        console.log("Fetched course:", course);
  
      // Send email
      await sendSessionCancelationEmail(student.email, {
        tutorName: `${tutorName}`,
        studentName: `${student.first_name} ${student.last_name}`,
        courseName: course.course_name,
        date: new Date(session.session_date).toLocaleDateString("en-US", { timeZone: "UTC" }),
        time: session_detail.session_time,
        cancellationNote: message
      });
  
      res.status(200).json({ msg: "Justification email sent successfully." });
    } catch (e) {
      console.error(e);
      res.status(500).json({ msg: "Internal server error while sending justification." });
    }
  };
  