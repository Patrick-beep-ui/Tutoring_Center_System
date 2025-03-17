import express from "express";
import {
    getSessionsByTutor,
    createSession,
    acceptSession,
    declineSession
} from "../controllers/calendarSessionsController.js";

const CalendarSessionsRouter = express.Router();

CalendarSessionsRouter.route("/:tutor_id?")
    .get(getSessionsByTutor)
    .post(createSession);

CalendarSessionsRouter.get("/accept/:session_id", acceptSession);
CalendarSessionsRouter.get("/decline/:session_id", declineSession);

export default CalendarSessionsRouter;