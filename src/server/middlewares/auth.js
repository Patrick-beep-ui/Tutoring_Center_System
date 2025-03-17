export default function isAuth(req, res, next){
    if (req?.session?.name) {
        console.log("User is authenticated")
        return next(); 
      } else {
        return res.status(401).send('Unauthorized'); 
      }
}