import express from "express";
import { 
    getSessions, 
    getSessionsByTutor, 
    getSessionsByTutorCourse, 
    getTutorSessionById, 
    getSessionDetails, 
    getScheduledSessionsCount,
    getScheduledSessionsItems,
    addSession, 
    editSession,
    cancelSession } from "../controllers/sessionsController.js";
import passport from "passport";

const SessionsRouter = express.Router();

SessionsRouter.route("/").get(passport.authenticate("jwt", { session: false }), getSessions); // get sessions on sessions pool
SessionsRouter.route("/:tutor_id").get(getSessionsByTutor);
SessionsRouter.route("/session/:session_id") // This is for session details on the Tutor Sessions part
.get(getTutorSessionById)
.put(editSession)
.patch(cancelSession);
//Future .delete for session deletion

SessionsRouter.route("/session_details/:session_id") // This is for session details on sessions screen
.get(getSessionDetails);

SessionsRouter.route("/session_status/:tutor_id") // This is for the scheduled sessions alert in the tutor Profile
.get(getScheduledSessionsCount);

// This can be refactor
SessionsRouter.route('/session_status/:tutor_id/:scheduled') // This is for showing the scheduled sessions table after clicking on the alert
.get(getScheduledSessionsItems);

SessionsRouter.route("/:tutor_id/:course_id")
.get(getSessionsByTutorCourse)
.post(addSession);

export default SessionsRouter;