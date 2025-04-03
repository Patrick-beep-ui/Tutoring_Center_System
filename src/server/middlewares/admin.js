export default function isAdmin(req, res, next) {
    if(req.user.role === 'admin') {
        console.log("User is admin")
        return next();
    }
    else {
        return res.status(401).send('Unauthorized'); 
    }
}