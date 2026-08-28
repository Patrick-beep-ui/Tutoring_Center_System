import express from "express";
import passport from "passport";
import semesterScope from "../middlewares/semesterScope.js";
import isAdmin from "../middlewares/admin.js";
import { getAlerts, evaluateAlerts, markAlertRead } from "../controllers/alertController.js";

const AlertRouter = express.Router();

AlertRouter.get("/", passport.authenticate("jwt", { session: false }), semesterScope, getAlerts);
AlertRouter.get("/evaluate", passport.authenticate("jwt", { session: false }), semesterScope, evaluateAlerts);
AlertRouter.put("/:id/read", passport.authenticate("jwt", { session: false }), isAdmin, markAlertRead);

export default AlertRouter;
