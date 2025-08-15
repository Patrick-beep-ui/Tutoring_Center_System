// middlewares/admin.js
export default function isAdmin(req, res, next) {
    try {
        console.log("REQ.USER on Admin bro:", req.user);
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
  
      // Allow both admin and tutor roles
      if (req.user.role !== "admin" && req.user.role !== "dev") {
        return res.status(403).json({ message: "Access denied. Admins or tutors only." });
      }
  
      next();
    } catch (err) {
      console.error("Error in isAdmin middleware:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  