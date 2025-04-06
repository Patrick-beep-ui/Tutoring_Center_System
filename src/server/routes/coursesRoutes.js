import express from "express";
import { getCourses, addCourse, getTutorCourses, getCoursesByMajor } from "../controllers/coursesController.js";

const CoursesRouter = express.Router();

CoursesRouter.route("/")
.get(getCourses)
.post(addCourse);

CoursesRouter.route("/major/:major_id")
.get(getCoursesByMajor);

CoursesRouter.route("/:tutor_id")
.get(getTutorCourses);

export default CoursesRouter;