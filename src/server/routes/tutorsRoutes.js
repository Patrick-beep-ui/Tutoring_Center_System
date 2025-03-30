import express from "express";
import { getTutors, getTutorById, addTutor } from "../controllers/tutorsController.js";
import userCheck from "../middlewares/userCheck.js";

const TutorsRouter = express.Router();

TutorsRouter.route("/")
.get(getTutors)
.post(addTutor);

TutorsRouter.route("/:tutor_id")
.get(/*userCheck,*/ getTutorById);

export default TutorsRouter;