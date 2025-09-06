import express from "express";
import { getTutors, getTutorById, addTutor, getTutorsByUser } from "../controllers/tutorsController.js";
import userCheck from "../middlewares/userCheck.js";

const TutorsRouter = express.Router();

TutorsRouter.route("/")
.get(getTutors)
.post(addTutor);

TutorsRouter.route("/:tutor_id")
.get(getTutorById);

TutorsRouter.route('/user/:user_id')
.get(getTutorsByUser)

export default TutorsRouter;