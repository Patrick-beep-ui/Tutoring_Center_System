import express from "express";
import passport from "passport";
import {
    getSessionsByTutor,
    createSession,
    acceptSession,
    declineSession,
    sendDeclineJustification
} from "../controllers/calendarSessionsController.js";
import semesterScope from "../middlewares/semesterScope.js";

const CalendarSessionsRouter = express.Router();

CalendarSessionsRouter.route("/:tutor_id?")
    .get(passport.authenticate("jwt", { session: false }), semesterScope, getSessionsByTutor)
    .post(createSession);

CalendarSessionsRouter.get("/accept/:session_id", acceptSession);
CalendarSessionsRouter.get("/decline/:session_id", declineSession);
CalendarSessionsRouter.post("/decline/justification/:session_id", sendDeclineJustification);

export default CalendarSessionsRouter;