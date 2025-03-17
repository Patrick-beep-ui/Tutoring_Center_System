import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/profile'); // Destination folder
    },
    filename: function (req, file, cb) {
        const tutorId = req.user.user_id;
        cb(null, `tutor${tutorId}.jpg`); // File name in the destination folder
    }
});

const upload = multer({ storage: storage });

export default upload;
