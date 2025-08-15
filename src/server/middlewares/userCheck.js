const userCheck = (req, res, next) => {
  try {
    const user = req.user;
    const paramId = parseInt(req.params.user_id, 10);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: no user found" });
    }

    if (isNaN(paramId)) {
      return res.status(400).json({ message: "Invalid user_id parameter" });
    }

    // Normalize role just in case
    const role = user.role?.toLowerCase();

    // Allow devs and admins unconditionally
    if (role === "dev" && role === "admin") {
      return next();
    }

    // Allow if the JWT user_id matches the route parameter
    if (user.user_id === paramId) {
      return next();
    }

    // Otherwise block
    return res.status(403).json({ message: "Forbidden: access denied" });

  } catch (err) {
    console.error("Error in userCheck middleware:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default userCheck;
