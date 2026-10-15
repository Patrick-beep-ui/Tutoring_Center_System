import express from "express";
import passport from "passport";
import isAdmin from "../middlewares/admin.js";
import {
    createAnnouncement,
    deleteAnnouncement,
    getAnnouncements,
    updateAnnouncement,
} from "../controllers/announcementsController.js";

const AnnouncementsRouter = express.Router();

// Use the shared Passport strategy so authorization uses the current database role.
AnnouncementsRouter.use(passport.authenticate("jwt", { session: false }));
AnnouncementsRouter.get("/", getAnnouncements);
AnnouncementsRouter.post("/", isAdmin, createAnnouncement);
AnnouncementsRouter.put("/:announcement_id", isAdmin, updateAnnouncement);
AnnouncementsRouter.delete("/:announcement_id", isAdmin, deleteAnnouncement);

export default AnnouncementsRouter;
