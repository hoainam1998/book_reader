const fs = require('fs');
const { mkdir } = require('fs/promises');

/**
 * Write contents to file and save it to specific folder.
 *
 * @param {string} filePath - path to stored file.
 * @param {string} success - content of file.
 * @return {Promise<string>} - promise contain file path.
 */
const saveFile = (filePath, content) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(
      filePath,
      content,
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(path.resolve(filePath));
        }
      }
    );
  });
};

/**
 * Create folder at specific path.
 *
 * @param {string} filePath - path to stored file.
 * @return {Promise<string>} promise contain file path.
 */
const createFolder = (path) => {
  return mkdir(path, { recursive: true });
};

/**
 * Delete file asynchronous.
 *
 * @async
 * @param {string} filePath - The file path.
 * @return {Promise<boolean>} - The promise result.
 */
const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
};

module.exports = {
  saveFile,
  createFolder,
  deleteFile,
};
