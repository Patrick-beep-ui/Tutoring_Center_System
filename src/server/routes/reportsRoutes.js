import express from "express";

import { getReportData, getMajorSessions, getSessionsReport, getTutorsReport, getStudentsReport, getMajorsReport } from "../controllers/reportsController.js";

const ReportRouter = express.Router()

ReportRouter.get("/", getReportData)
ReportRouter.get("/major-sessions", getMajorSessions)

// Reports View
ReportRouter.get("/sessions", getSessionsReport);
ReportRouter.get("/tutors", getTutorsReport);
ReportRouter.get("/students", getStudentsReport);
ReportRouter.get("/majors", getMajorsReport);

export default ReportRouter;