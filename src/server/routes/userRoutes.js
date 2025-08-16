import express from "express";
import { getUsers, getUser, getUserCourses } from "../controllers/usersController.js";
import passport from "passport";

import userCheck from "../middlewares/userCheck.js";

const UserRouter = express.Router();

UserRouter.route("/")
.get(getUsers);

UserRouter.route("/:user_id")
  .get(
    /*passport.authenticate("jwt", { session: false }),
    userCheck,*/
    getUser
  );

UserRouter.route("/:user_id/:ku_id")
.get(getUserCourses);

export default UserRouter;