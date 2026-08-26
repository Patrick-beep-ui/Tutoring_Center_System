import express from "express";

import {
    getReportData, getMajorSessions, getSessionsReport, getTutorsReport, getStudentsReport, getMajorsReport, getTopTutors
 } from "../controllers/reportsController.js";
import passport from "passport";
import semesterScope from "../middlewares/semesterScope.js";

const ReportRouter = express.Router()

ReportRouter.get("/", passport.authenticate("jwt", { session: false }), semesterScope, getReportData)
ReportRouter.get("/major-sessions", passport.authenticate("jwt", { session: false }), semesterScope, getMajorSessions)

// Reports View
ReportRouter.get("/sessions", passport.authenticate("jwt", { session: false }), semesterScope, getSessionsReport);
ReportRouter.get("/tutors", passport.authenticate("jwt", { session: false }), semesterScope, getTutorsReport);
ReportRouter.get("/students", passport.authenticate("jwt", { session: false }), semesterScope, getStudentsReport);
ReportRouter.get("/majors", passport.authenticate("jwt", { session: false }), semesterScope, getMajorsReport);
ReportRouter.get("/top-tutors", passport.authenticate("jwt", { session: false }), semesterScope, getTopTutors);

export default ReportRouter;
