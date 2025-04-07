import express from "express";
import { getUsers, getUser, getUserCourses } from "../controllers/usersController.js";
import userCheck from "../middlewares/userCheck.js";

const UserRouter = express.Router();

UserRouter.route("/")
.get(getUsers);

UserRouter.route("/:user_id")
.get(userCheck, getUser);

UserRouter.route("/:user_id/:ku_id")
.get(getUserCourses);

export default UserRouter;