import express from "express";
import { getCourses, addCourse, getTutorCourses } from "../controllers/coursesController.js";

const CoursesRouter = express.Router();

CoursesRouter.route("/")
.get(getCourses)
.post(addCourse);

CoursesRouter.route("/:tutor_id")
.get(getTutorCourses);

export default CoursesRouter;