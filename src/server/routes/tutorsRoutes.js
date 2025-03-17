import express from "express";
import { getTutors, getTutorById, addTutor } from "../controllers/tutorsController.js";

const TutorsRouter = express.Router();

TutorsRouter.route("/")
.get(getTutors)
.post(addTutor);

TutorsRouter.route("/:tutor_id")
.get(getTutorById);

export default TutorsRouter;