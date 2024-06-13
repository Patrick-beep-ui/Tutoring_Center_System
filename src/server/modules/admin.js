export default function isAdmin(req, res, next) {
    if(req.user.is_admin === 'yes') {
        console.log("User is admin")
        return next();
    }
    else {
        return res.status(401).send('Unauthorized'); 
    }
}