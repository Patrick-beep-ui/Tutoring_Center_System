export default function userCheck(req, res, next) {
    if (req?.session?.passport?.user) {
        console.log("User ID:", req.session.passport.user); 
        const paramId = req.params.user_id || req.params.tutor_id;

        if (req.session.passport.user == paramId) { 
            return next();
        } else {
            console.log("Access Denied: You do not have permission to view this page.");
            return res.status(403).json("Access Denied: You do not have permission to view this page.");
        }
    } else {
        return res.status(401).json("Unauthorized: Please log in first.");
    }
}
