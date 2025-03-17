import express from "express";

import { getReportData, getMajorSessions } from "../controllers/reportsController.js";

const ReportRouter = express.Router()

ReportRouter.get("/", getReportData)
ReportRouter.get("/major-sessions", getMajorSessions)

export default ReportRouter;