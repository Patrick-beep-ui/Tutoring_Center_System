import sharp from 'sharp';

/**
 * Resize an image buffer to 400x400 and convert to WebP
 * @param {Buffer} buffer - Original image buffer
 * @returns {Promise<Buffer>} - Processed WebP buffer
 */
export const convertToWebp = async (buffer) => {
  return sharp(buffer)
    .resize(400, 400)
    .webp({ quality: 80 })
    .toBuffer();
};
