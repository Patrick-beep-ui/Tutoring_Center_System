import express from "express";

import { getReportData, getMajorSessions, getSessionsReport } from "../controllers/reportsController.js";

const ReportRouter = express.Router()

ReportRouter.get("/", getReportData)
ReportRouter.get("/major-sessions", getMajorSessions)

ReportRouter.get("/sessions", getSessionsReport)

export default ReportRouter;