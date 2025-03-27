const multer = require('multer');
const path = require('path');
const { UPLOAD_MODE, HTTP_CODE } = require('#constants');
const { convertFileToBase64 } = require('#utils');
const Logger = require('#services/logger');

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1000000,
    files: 10
  },
  fileFilter: (_, file, cb) => {
    const extensionFileIsValid = /.jpg|.jpeg|.png/.test(path.extname(file.originalname));
    if (extensionFileIsValid) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

/**
 * Enum for upload mode.
 * @readonly
 * @enum {String}
 */
UPLOAD_MODE

/**
 * Return upload file helper decorator.
 *
 * @param {UPLOAD_MODE} - mode name (single, array, fields).
 * @param {string} - field name.
 * @param {number} - maximum files.
 * @returns {function} - upload decorator function.
 */
module.exports = (mode, fields, maxCount) => {
  const uploadHandle = upload[mode](fields, maxCount);
  return (target) => {
    const originalMethod = target.descriptor.value;
    target.descriptor.value = (...args) => {
      const request = args[0];
      const response = args[1];
      uploadHandle(request, response, (err) => {
        if (err) {
          Logger.error('Upload file', err.message);
          response.status(HTTP_CODE.BAD_REQUEST).json({ message: err.message });
        } else {
          // run by mode, and convert file to base64 string.
          switch (mode) {
            case UPLOAD_MODE.SINGLE:
              args[0].body[fields] = request.file
                ? convertFileToBase64(request.file)
                : request.body[fields];
              break;
            case UPLOAD_MODE.ARRAY:
              args[0].body[fields] = request.files.map(file => convertFileToBase64(file));
              break;
            case UPLOAD_MODE.FIELDS:
              fields.forEach(({ name }) => {
                if (request.files[name]) {
                  request.body[name] = request.files[name].map(file => convertFileToBase64(file));
                }
              });
              break;
            default:
              break;
          }
          originalMethod.apply(null, args);
        }
      });
    }
    return target;
  }
};
