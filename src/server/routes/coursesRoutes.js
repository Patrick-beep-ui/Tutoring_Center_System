import express from "express";
import passport from "passport";
import { getCourses, addCourse, getTutorCourses, getCoursesByMajor, getCoursesByUser, getSemesterCourses, getCatalogWithSemesterFlag, addCourseToSemester, removeCourseFromSemester } from "../controllers/coursesController.js";
import isAdmin from "../middlewares/admin.js";
import semesterScope from "../middlewares/semesterScope.js";

const CoursesRouter = express.Router();

// Static routes must be declared before parameterized ones
CoursesRouter.route("/major/:major_id")
.get(getCoursesByMajor);

CoursesRouter.route("/user/:user_id")
.get(getCoursesByUser);

CoursesRouter.route("/semester/:semester_id")
.get(passport.authenticate("jwt", { session: false }), semesterScope, getSemesterCourses);

CoursesRouter.route("/catalog")
.get(passport.authenticate("jwt", { session: false }), semesterScope, getCatalogWithSemesterFlag);

CoursesRouter.route("/:course_id/roster/:semester_id")
.post(passport.authenticate("jwt", { session: false }), isAdmin, addCourseToSemester)
.delete(passport.authenticate("jwt", { session: false }), isAdmin, removeCourseFromSemester);

CoursesRouter.route("/:tutor_id")
.get(getTutorCourses);

CoursesRouter.route("/")
.get(getCourses)
.post(addCourse);

export default CoursesRouter;
