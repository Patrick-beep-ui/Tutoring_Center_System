import express from "express";
import { getSchedules } from "../controllers/schedulesController.js";

const SchedulesRouter = express.Router();
SchedulesRouter.route("/:tutor_id").get(getSchedules);

export default SchedulesRouter;