const multer = require('multer');
const path = require('path');
const { UPLOAD_MODE } = require('../constants/index.js');

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100000,
    files: 10
  },
  fileFilter: (_, file, cb) => {
    const extensionFileIsValid = /.jpg|.jpeg|.png|.pdf/.test(path.extname(file.originalname));
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
 * @param {String} - field name.
 * @param {Number} - maximum files.
 * @returns {Function} - upload decorator function.
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
          res.status(400).json({ message: err.message });
        } else {
          switch (mode) {
            case UPLOAD_MODE.SINGLE:
              args[0].body[fields] = request.file ? `data:${request.file.mimetype};base64,${request.file.buffer.toString('base64')}` : null;
              break;
            case UPLOAD_MODE.ARRAY:
              args[0].body[fields] = req.files.map(file => `data:${file.mimetype};base64,${file.buffer.toString('base64')}`);
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
