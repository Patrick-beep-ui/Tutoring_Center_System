import express from "express";
import { getUsers, getUser, getUserCourses, editUser } from "../controllers/usersController.js";
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
  ).put(
    /*passport.authenticate("jwt", { session: false }),
    userCheck,*/
    editUser
  );

UserRouter.route("/:user_id/:ku_id")
.get(getUserCourses);

export default UserRouter;