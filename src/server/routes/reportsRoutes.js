import express from "express";

import { 
    getReportData, getMajorSessions, getSessionsReport, getTutorsReport, getStudentsReport, getMajorsReport
 } from "../controllers/reportsController.js";
import passport from "passport";

const ReportRouter = express.Router()

ReportRouter.get("/", getReportData)
ReportRouter.get("/major-sessions", getMajorSessions)

// Reports View
ReportRouter.get("/sessions",passport.authenticate("jwt", { session: false }), getSessionsReport);
ReportRouter.get("/tutors", passport.authenticate("jwt", { session: false }), getTutorsReport);
ReportRouter.get("/students", passport.authenticate("jwt", { session: false }),  getStudentsReport);
ReportRouter.get("/majors", passport.authenticate("jwt", { session: false }), getMajorsReport);

export default ReportRouter;