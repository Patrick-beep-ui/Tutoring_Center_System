import express from "express";
import passport from "passport";
import { getAllSchedules, getSchedules, updateSchedules, clearSchedules } from "../controllers/schedulesController.js";
import semesterScope from "../middlewares/semesterScope.js";

const SchedulesRouter = express.Router();

SchedulesRouter.route("/")
.get(passport.authenticate("jwt", { session: false }), semesterScope, getAllSchedules);

SchedulesRouter.route("/:tutor_id")
.get(getSchedules)
.put(updateSchedules)
.delete(clearSchedules);

export default SchedulesRouter;
