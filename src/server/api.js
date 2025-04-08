import express from 'express';
//import isAuth from './middlewares/auth.js';
import isAdmin from './middlewares/admin.js';
import upload from './middlewares/uploadMiddleware.js';
import { sendEmail } from './mail.js';
import jwtAuth from './middlewares/jwtAuth.js';
import passport from 'passport';

// Association Models
import Major from "./models/Major.js";
import Tutor from "./models/Tutor.js";
import TutorSession from "./models/TutorSession.js"

import User from "./models/User.js";

import "./models/associations.js"; // Check routes and controllers in case something goes wrong with some of the Models

import CalendarSessionsRouter from './routes/calendarSessionsRoutes.js';
import ReportRouter from './routes/reportsRoutes.js';
import TutorsRouter from './routes/tutorsRoutes.js';
import TermsRouter from './routes/termRoutes.js';
import MajorRouter from './routes/majorRoutes.js';
import CoursesRouter from './routes/coursesRoutes.js';
import CommentsRouter from './routes/commentsRoutes.js';
import SessionsRouter from './routes/sessionRoutes.js';
import UserRouter from './routes/userRoutes.js';
import FeedbackRouter from './routes/feedbackRoutes.js';
import SchedulesRouter from './routes/schedulesRoutes.js';
import StudentRouter from './routes/studentRoutes.js';

const api = express.Router({mergeParams: true});

api.use("/calendar-session", CalendarSessionsRouter);
api.use("/report", ReportRouter)
api.use("/tutors", TutorsRouter);
api.use("/terms", TermsRouter);
api.use("/majors", MajorRouter);
api.use("/courses", CoursesRouter);
api.use("/comments", CommentsRouter);
api.use("/sessions", SessionsRouter);
api.use("/users", UserRouter);
api.use("/feedback", FeedbackRouter);
api.use("/schedules", SchedulesRouter);
api.use("/students", StudentRouter);


// Endpoint to check authentication
api.route('/auth')
.get(passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const id = req.user.user_id;
    console.log('User ID on auth:', id);
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' }); 
    }

    res.status(200).json({
        user
    });
  }
  catch(e) {
    console.error(e);
    res.status(500).json({ message: 'Internal server error' });
  }
});
//Future .post for storing sessions in a MongoDB database

//Prueba branch


api.post('/send-email', async (req, res) => {
    const { to, subject, text } = req.body;
  
    try {
      sendEmail(to, subject, text);
      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to send email', error: error.message });
    }
  });

api.post('/uploadProfilePic/:role?', upload.single('profilePic'), (req, res) => {
    console.log('File received:', req.file);
    res.status(200).json({
        message: 'Profile picture uploaded successfully'
    });
});





export default api