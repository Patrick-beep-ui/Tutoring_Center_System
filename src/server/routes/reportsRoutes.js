import express from "express";

import { getReportData, getMajorSessions, getSessionsReport, getTutorsReport } from "../controllers/reportsController.js";

const ReportRouter = express.Router()

ReportRouter.get("/", getReportData)
ReportRouter.get("/major-sessions", getMajorSessions)

// Reports View
ReportRouter.get("/sessions", getSessionsReport)
ReportRouter.get("/tutors", getTutorsReport)

export default ReportRouter;