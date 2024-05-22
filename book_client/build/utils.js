const path = require('path');

/**
 * Get resolve path.
 * @param {string} filePath - file path.
 * @returns {string} - path
 */
function getResolvePath(filePath) {
  return path.resolve(__dirname, filePath);
}

/**
 * Get asset path.
 * @param {string} filePath - asset path.
 * @returns {string} - path
 */
function getAssetPath(subPath, fileName) {
  return path.posix.join(subPath, fileName);
}

module.exports = {
  getResolvePath,
  getAssetPath
};
