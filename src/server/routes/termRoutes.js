import express from "express";
import { getSemesters, addSemester, getCurrentSemester, setCurrentSemester, deleteSemester, copySemesterFrom } from "../controllers/termsConroller.js";

const TermsRouter = express.Router();

TermsRouter.route("/")
.get(getSemesters)
.post(addSemester);

TermsRouter.route("/current")
.get(getCurrentSemester);

TermsRouter.route("/:semester_id/set-current")
.put(setCurrentSemester);

TermsRouter.route("/:semester_id/copy-from/:source_id")
.post(copySemesterFrom);

TermsRouter.route("/:semester_id")
.delete(deleteSemester);

export default TermsRouter;
