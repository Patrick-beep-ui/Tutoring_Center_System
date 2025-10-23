import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/profile'); // Destination folder
    },
    filename: function (req, file, cb) {
        const {role, user_id} = req.params;
        cb(null, `${role}${user_id}.webp`); 
    }
});

const upload = multer({ storage: storage });

export default upload;
