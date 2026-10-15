import express from "express";
import passport from "passport";
import isAdmin from "../middlewares/admin.js";
import {
    announcementMutationLimiter,
    announcementPublishLimiter,
    announcementReadLimiter,
} from "../middlewares/rateLimiters.js";
import {
    createAnnouncement,
    deleteAnnouncement,
    getAnnouncements,
    updateAnnouncement,
} from "../controllers/announcementsController.js";

const AnnouncementsRouter = express.Router();

// Use the shared Passport strategy so authorization uses the current database role.
AnnouncementsRouter.use(passport.authenticate("jwt", { session: false }));
AnnouncementsRouter.get("/", announcementReadLimiter, getAnnouncements);
AnnouncementsRouter.post("/", announcementPublishLimiter, isAdmin, createAnnouncement);
AnnouncementsRouter.put("/:announcement_id", announcementMutationLimiter, isAdmin, updateAnnouncement);
AnnouncementsRouter.delete("/:announcement_id", announcementMutationLimiter, isAdmin, deleteAnnouncement);

export default AnnouncementsRouter;
