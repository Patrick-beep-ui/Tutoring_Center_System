import express from 'express';
import {QueryTypes} from "sequelize";
import connection from "./connection.js";
import isAuth from './modules/auth.js';
import isAdmin from './modules/admin.js';
import upload from './modules/uploadMiddleware.js';
import { sendEmail } from './mail.js';

import Course from "./models/Course.js";
import Contact from "./models/Contact.js";
import Major from "./models/Major.js";
import Semester from "./models/Semester.js";
import Student from "./models/Student.js";
import Tutor from "./models/Tutor.js";
import TutorCourse from "./models/TutorCourse.js";
import TutorSession from "./models/TutorSession.js"
import User from "./models/User.js";
import SessionDetail from './models/SessionDetail.js';
import Comment from './models/Comment.js';
import SessionRating from './models/SessionRating.js';

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

api.post('/send-email', async (req, res) => {
    const { to, subject, text } = req.body;
  
    try {
      sendEmail(to, subject, text);
      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to send email', error: error.message });
    }
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
})

api.route("/tutors/:tutor_id")
.get(async (req, res) => {
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
});

api.route("/courses/:tutor_id")
.get(async (req, res) => {
    try {
        const id  = req.params.tutor_id;
        const tutor_classes = await connection.query(`SELECT c.course_name as 'course_name', c.course_code as 'course_code', tc.tutor_id as 'tutor_id', c.course_id as 'course_id', COUNT(CASE WHEN sd.session_status = 'completed' THEN s.course_id END) AS 'sessions'
        FROM courses c JOIN tutor_courses tc ON c.course_id = tc.course_id
        JOIN tutors t ON t.tutor_id = tc.tutor_id
        LEFT JOIN sessions s ON s.course_id = c.course_id
        LEFT JOIN session_details sd ON s.session_id = sd.session_id
        WHERE tc.tutor_id = ${id}
        GROUP BY course_name, course_code, tutor_id, course_id;`, {
            type: QueryTypes.SELECT
        });

        res.status(200).json({ tutor_classes });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Profile Session Data
api.route("/session-status/:tutor_id/:scheduled?")
.get(async (req, res) => {
    try {
        const scheduled = req.params.scheduled
        const id = req.params.tutor_id;

        if(scheduled) {
            const scheduled_sessions = await connection.query(` SELECT s.session_id as 'session_id', CONCAT(u.first_name, ' ', u.last_name) as 'tutor_name', s.student_id as 'student',  c.course_name as 'course_name', s.session_totalhours as 'total_hours', s.session_date as 'session_date'
            FROM sessions s JOIN tutors t on s.tutor_id = t.tutor_id
            JOIN users u ON u.user_id = t.user_id
            JOIN courses c ON s.course_id = c.course_id
            JOIN session_details sd ON s.session_id = sd.session_id
            WHERE t.tutor_id = ${id} AND sd.session_status = 'scheduled'
            GROUP BY session_id, tutor_name, student, total_hours
            ORDER BY course_name;`, {
                type: QueryTypes.SELECT
            })

            res.status(200).json({ scheduled_sessions });
        }
        else {
            const scheduled_sessions = await SessionDetail.count({
                distinct: true,
                col: 'session_id',
                include: [{
                    model: TutorSession,
                    where: { tutor_id: id }
                }],
                where: {
                    session_status: 'scheduled'
                }
            });

            res.status(200).json({
                scheduled_sessions
            });
        }
        
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

api.route("/edit-session/:session_id")
.get(async (req, res) => {
    try {
        const session_id = req.params.session_id

        const session = await connection.query(`SELECT s.session_id as 'session_id', c.course_name as 'course_name', CONCAT(u.first_name, ' ', u.last_name) as 'scheduled_by', sd.session_time as 'session_time', FORMAT(s.session_totalhours, 0) as 'session_durarion' ,s.session_date as 'session_date', sd.session_status as 'session_status'
            FROM sessions s JOIN tutors t on s.tutor_id = t.tutor_id
            JOIN courses c ON s.course_id = c.course_id
            JOIN session_details sd ON s.session_id = sd.session_id
            JOIN users u ON u.user_id = sd.createdBy
            WHERE s.session_id = ${session_id}
            GROUP BY session_id, course_name, scheduled_by, session_time, session_date, session_status;`, {
                type: QueryTypes.SELECT
            })

            res.status(200).json({ session });

    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
})
.put(async (req, res) => {
    try {
        const session_id = req.params.session_id
        const {session_date, session_hours, feedback, session_time} = req.body;
        
        const session = await TutorSession.findOne({
            where: {
                session_id: session_id
            }
        })

        await session.update({
            session_date: session_date,
            session_totalhours: session_hours,
            feedback: feedback

        })

        const session_detail = await SessionDetail.findOne({
            where: {
                session_id: session_id
            }
        })

        await session_detail.update({
            session_time: session_time,
            session_status: 'completed',
            updatedAt: new Date()
        })

        res.json({
            message: 'Session updated successfully'
        })
    }
    catch(e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
})

//session_details
api.route("/session/details/:session_id")
.get(async (req, res) => {
    try {
        const session_id = req.params.session_id

        if(session_id) {
            const session = await connection.query(`SELECT CONCAT(u.first_name, ' ', u.last_name) as 'tutor_name', c.course_name as 'course_name', s.session_date as 'session_date', s.student_id as 'student_id', FORMAT(s.session_totalhours, 0) as 'session_hours', 
            s.feedback as 'session_feedback', sd.session_time as 'session_time', su.user_id AS 'student_user_id',
            CONCAT(su.first_name, ' ', su.last_name) AS 'student_name'
            FROM sessions s LEFT JOIN session_details sd ON s.session_id = sd.session_id
            JOIN courses c ON s.course_id = c.course_id
            JOIN tutors t ON s.tutor_id = t.tutor_id
            JOIN users u ON u.user_id = t.user_id
            LEFT JOIN users su ON su.ku_id = s.student_id
            WHERE s.session_id = ${session_id}
            GROUP BY tutor_name, course_name, session_date, student_id, session_hours, session_time, student_user_id, student_name;`, {
                type: QueryTypes.SELECT
            })
            res.status(200).json({ session });
        }
    }
    catch(e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
})

api.route("/comments/:session_id/:comment_id?")
.get(async (req, res) => {
    try {
        const session_id = req.params.session_id

        if(session_id) {
            const comments = await connection.query(`SELECT c.comment_id, CONCAT(u.first_name, ' ', u.last_name) as 'student_name', c.content as 'comment', c.created_at as 'creation_date', u.user_id as 'user_id'
            FROM comments c JOIN users u ON c.user_id = u.user_id
            JOIN sessions s ON s.session_id = c.session_id
            WHERE c.session_id = ${session_id}
            GROUP BY c.comment_id, student_name, comment, u.user_id;`, {
                type: QueryTypes.SELECT
            })

            res.status(200).json({comments})
        }
    }
    catch(e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
})
.post(async (req, res) => {
    try {
        const session_id = req.params.session_id

        const comment = new Comment({
            session_id: session_id,
            user_id: req.body.user_id,
            content: req.body.content
        })

        await comment.save();

        const comments = await connection.query(`SELECT c.comment_id, CONCAT(u.first_name, ' ', u.last_name) as 'student_name', c.content as 'comment', c.created_at as 'creation_date', u.user_id as 'user_id'
            FROM comments c JOIN users u ON c.user_id = u.user_id
            JOIN sessions s ON s.session_id = c.session_id
            WHERE c.session_id = ${session_id}
            GROUP BY c.comment_id, student_name, comment, u.user_id;`, {
                type: QueryTypes.SELECT
            })

            res.status(200).json({comments})
    }
    catch(e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
})
.delete(async (req, res) =>{
    try {
        const comment_id = req.params.comment_id

        const comment = await Comment.findByPk(comment_id);

        if (!comment) {
            return res.status(404).json({ msg: 'Comment not found' });
          }

        await comment.destroy();

        res.status(200).json({msg: 'Comment Deleted Successfully'});
    }
    catch(e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
})

//tutor_sessions
api.route('/sessions/:tutor_id?/:course_id?')
.get([isAuth], async (req, res) => {
    try {
        const id = req.params.tutor_id
        const course = req.params.course_id

        if(id && course) {
             const sessions = await connection.query(` SELECT s.session_id as 'session_id', CONCAT(u.first_name, ' ', u.last_name) as 'tutor_name', s.student_id as 'student',  c.course_name as 'course_name', s.session_totalhours as 'total_hours', s.session_date as 'session_date'
        FROM sessions s JOIN tutors t on s.tutor_id = t.tutor_id
        JOIN users u ON u.user_id = t.user_id
        JOIN courses c ON s.course_id = c.course_id
        JOIN session_details sd ON s.session_id = sd.session_id
        WHERE t.tutor_id = ${id} AND s.course_id = ${course} AND sd.session_status = 'completed'
        GROUP BY session_id, tutor_name, student, total_hours
        ORDER BY course_name;`, {
            type: QueryTypes.SELECT
        })

        res.status(200).json({ sessions });
        } 
        else if(id) {
            const sessions = await connection.query(` SELECT s.session_id as 'session_id', CONCAT(u.first_name, ' ', u.last_name) as 'tutor_name', s.student_id as 'student',  c.course_name as 'course_name', s.session_totalhours as 'total_hours', s.session_date as 'session_date'
            FROM sessions s JOIN tutors t on s.tutor_id = t.tutor_id
            JOIN users u ON u.user_id = t.user_id
            JOIN courses c ON s.course_id = c.course_id
            WHERE t.tutor_id = ${id}
            GROUP BY session_id, tutor_name, student, total_hours
            ORDER BY course_name;`, {
                type: QueryTypes.SELECT
            })
    
            res.status(200).json({ sessions });
        }
        
        else {
            const sessions = await connection.query(` SELECT s.session_id as 'session_id', CONCAT(u.first_name, ' ', u.last_name) as 'tutor_name', s.student_id as 'student',  c.course_name as 'course_name', s.session_totalhours as 'total_hours', t.tutor_id as 'tutor_id', s.session_date as 'session_date'
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
    try {
        
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

})


//calendar_sessions
api.route("/calendar-sessions/:tutor_id?")
.get(async (req, res) => {
    try {
        const tutor_id = req.params.tutor_id

        const sessions = await connection.query(`SELECT s.session_id as 'session_id', c.course_name as 'course_name', CONCAT(student.first_name, ' ', student.last_name) as 'scheduled_by', sd.session_time as 'session_time', FORMAT(s.session_totalhours, 0) as 'session_duration' ,s.session_date as 'session_date', sd.session_status as 'session_status', CONCAT(u.first_name, ' ', u.last_name) as 'tutor', sd.createdBy as 'student_id'
        FROM sessions s JOIN tutors t on s.tutor_id = t.tutor_id
        JOIN users u ON u.user_id = t.user_id
        JOIN courses c ON s.course_id = c.course_id
        JOIN session_details sd ON s.session_id = sd.session_id
        JOIN users student ON student.user_id = sd.createdBy
        WHERE t.tutor_id = ${tutor_id}
        GROUP BY session_id, course_name, scheduled_by, session_time, session_duration, session_date, session_status, tutor, sd.createdBy 
        ;`, {
            type: QueryTypes.SELECT
        })

        res.status(200).json({ sessions });
    }
    catch(e) {
        console.error(e)
        res.status(500).json({ error: 'Internal server error' });
    }
})
.post(async (req, res) => {
    try {
        const tutor_id = req.params.tutor_id

        const session = new TutorSession({
            tutor_id:tutor_id,
            student_id: req.body.student_id,
            course_id: req.body.course,
            semester_id: req.body.semester_id,
            session_date: req.body.session_date,
            session_totalhours: req.body.session_hours
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

        const emailText = `
            Hey ${tutor_user.first_name} ${tutor_user.last_name},

            You've received a session request from ${student.first_name} ${student.last_name}.

            Session Details:
            - Course: ${req.body.course}
            - Date: ${req.body.session_date}
            - Time: ${req.body.session_time}
            - Hours: ${req.body.session_hours}

            Please click on the links below to accept or decline the session:

            Accept: http://localhost:3000/api/calendar-session/accept/${session.session_id}
            Decline: http://localhost:3000/api/calendar-session/decline/${session.session_id}
        `;

        await sendEmail(tutor_user.email, 'New Session Request', emailText);

        res.status(201).json({
            msg: 'Session request sent to the tutor. Waiting for acceptance.',
        });

        /*
        const sessions = await TutorSession.findAll({
            where: {
                tutor_id: tutor_id
            }
        })

        

        res.status(201).json({
            msg: 'Session Scheduled Successfully',
            sessions
        })

        */
    }
    catch(e) {

    }
})

api.route("/calendar-session/accept/:session_id")
.get(async (req, res) => {
    try {
        const session_id = req.params.session_id;

        // Find the session
        const session = await SessionDetail.findByPk(session_id);

        if (!session) {
            return res.status(404).json({ msg: 'Session not found' });
        }

        await session.update({
            session_status: 'scheduled'
        });

        res.json({ msg: 'Session accepted successfully' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: 'Error accepting the session' });
    }
});

api.route("/calendar-session/decline/:session_id")
.get(async (req, res) => {
    try {
        const session_id = req.params.session_id;

        // Find the session
        const session = await TutorSession.findByPk(session_id);
        const session_detail = await SessionDetail.findByPk(session_id);

        if (!session) {
            return res.status(404).json({ msg: 'Session not found' });
        }

        // Update the session status to declined or delete the session
        
        session.tutor_id = null;
        await session.save();

        res.json({ msg: 'Session declined successfully' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: 'Error declining the session' });
    }
});

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

api.post('/uploadProfilePic', upload.single('profilePic'), (req, res) => {
    console.log('File received:', req.file);
    res.status(200).json({
        message: 'Profile picture uploaded successfully'
    });
});





export default api