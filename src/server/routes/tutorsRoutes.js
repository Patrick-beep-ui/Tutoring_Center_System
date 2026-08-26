import express from "express";
import passport from "passport";
import { getTutors, getTutorById, addTutor, getTutorsByUser, updateTutorCourses } from "../controllers/tutorsController.js";
import userCheck from "../middlewares/userCheck.js";
import semesterScope from "../middlewares/semesterScope.js";

const TutorsRouter = express.Router();

TutorsRouter.route("/")
.get(passport.authenticate("jwt", { session: false }), semesterScope, getTutors)
.post(addTutor);

TutorsRouter.route("/:tutor_id/courses")
.put(updateTutorCourses);

TutorsRouter.route("/:tutor_id")
.get(getTutorById);

TutorsRouter.route('/user/:user_id')
.get(passport.authenticate("jwt", { session: false }), semesterScope, getTutorsByUser)

export default TutorsRouter;
