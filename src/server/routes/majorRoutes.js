import express from "express";
import { getMajors, addMajor } from "../controllers/majorController.js";

const MajorRouter = express.Router();

MajorRouter.route("/")
.get(getMajors)
.post(addMajor);

export default MajorRouter;