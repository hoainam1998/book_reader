const path = require('path');
/**
 * Convert file to base64 image file string.
 *
 * @param {File} file - The file object.
 * @return {string} The image base64 string.
 */
const convertFileToBase64 = (file) => `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

/**
 * Get extension name of file.
 *
 * @param {File} file - The file object.
 * @return {string} The extension name.
 */
const getExtName = (file) => path.extname(file.originalname);

/**
 * Convert a multer file to new file.
 *
 * @param {Object} multerFile - The multerFile object.
 * @return {File} The file object.
 */
const createFile = (file) => new File([file.buffer], file.originalname, { type: file.mimetype });

/**
 * Check file is empty or not.
 *
 * @param {multer.File} file - The multer file.
 * @returns {boolean} - True if file is empty, other false.
 */
const isEmptyFile = (file) => file.size === 0;

module.exports = {
  convertFileToBase64,
  getExtName,
  createFile,
  isEmptyFile,
};
