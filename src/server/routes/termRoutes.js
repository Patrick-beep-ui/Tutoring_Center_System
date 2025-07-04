import express from "express";
import { getSemesters, addSemester, getCurrentSemester } from "../controllers/termsConroller.js";

const TermsRouter = express.Router();

TermsRouter.route("/")
.get(getSemesters)
.post(addSemester);

TermsRouter.route("/current")
.get(getCurrentSemester);

export default TermsRouter;