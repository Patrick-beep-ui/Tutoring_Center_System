import express from "express";
import { getSchedules, updateSchedules, clearSchedules } from "../controllers/schedulesController.js";

const SchedulesRouter = express.Router();

SchedulesRouter.route("/:tutor_id")
.get(getSchedules)
.put(updateSchedules)
.delete(clearSchedules);

export default SchedulesRouter;
