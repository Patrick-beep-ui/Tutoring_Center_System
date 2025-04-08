import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/profile'); // Destination folder
    },
    filename: function (req, file, cb) {
        const {role} = req.params;
        console.log("Role:", role);
        const tutorId = req.user.user_id;
        cb(null, `${role}${tutorId}.jpg`); // File name in the destination folder
    }
});

const upload = multer({ storage: storage });

export default upload;
