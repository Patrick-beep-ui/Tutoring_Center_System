import express from "express";
import { getCourses, addCourse, getTutorCourses, getCoursesByMajor, getCoursesByUser, getSemesterCourses, getCatalogWithSemesterFlag, addCourseToSemester, removeCourseFromSemester } from "../controllers/coursesController.js";

const CoursesRouter = express.Router();

// Static routes must be declared before parameterized ones
CoursesRouter.route("/major/:major_id")
.get(getCoursesByMajor);

CoursesRouter.route("/user/:user_id")
.get(getCoursesByUser);

CoursesRouter.route("/semester/:semester_id")
.get(getSemesterCourses);

CoursesRouter.route("/catalog")
.get(getCatalogWithSemesterFlag);

CoursesRouter.route("/:course_id/roster/:semester_id")
.post(addCourseToSemester)
.delete(removeCourseFromSemester);

CoursesRouter.route("/:tutor_id")
.get(getTutorCourses);

CoursesRouter.route("/")
.get(getCourses)
.post(addCourse);

export default CoursesRouter;
