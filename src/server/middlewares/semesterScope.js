import { getCurrentSemesterId } from "../utils/currentSemester.js";

// Blocks non-admin users from reading data of semesters other than the
// current one. Must run AFTER passport.authenticate('jwt') so req.user
// is populated. Requests without ?semester_id pass through (they resolve
// to the current semester anyway).
export default async function semesterScope(req, res, next) {
    try {
        const requested = req.query.semester_id;
        if (!requested) return next();

        const currentId = await getCurrentSemesterId();
        if (Number(requested) === currentId) return next();

        if (req.user && (req.user.role === "admin" || req.user.role === "dev")) {
            return next();
        }

        return res.status(403).json({ msg: "Only admins can view data from other semesters" });
    }
    catch (e) {
        if (e.message === 'No current semester is set') {
            return res.status(404).json({ error: e.message });
        }
        console.error("Error in semesterScope middleware:", e);
        res.status(500).json({ msg: "Internal server error" });
    }
}
