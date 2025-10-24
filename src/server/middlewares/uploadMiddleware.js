import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { convertToWebp } from '../utils/convertToWebp.js';

const storage = multer.memoryStorage(); // Keep file in memory
const upload = multer({ storage });

export const processProfileImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const { role, user_id } = req.params;

    // Call helper to resize and convert
    const processedBuffer = await convertToWebp(req.file.buffer);

    // Save processed image
    const savePath = path.join('public', 'profile', `${role}${user_id}.webp`);
    fs.writeFileSync(savePath, processedBuffer);

    console.log('Profile image processed and saved:', savePath);

    next();
  } catch (error) {
    console.error('Error processing profile image:', error);
    next(error);
  }
};

export default upload;
