const multer = require('multer');
const path = require('path');
const { HTTP_CODE } = require('#constants');
const Logger = require('#services/logger');

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    const fileName = req.body.name.replace(/\s/, '-');
    const extName = path.extname(file.originalname);
    cb(null, `${fileName}${extName}`);
  },
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/pdf'))
  }
});

const upload = multer({
  storage,
  fileFilter: (_, file, cb) => {
    const extensionFileIsValid = /.pdf/.test(path.extname(file.originalname));
    if (extensionFileIsValid) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

/**
 * Return upload pdf file helper decorator.
 *
 * @param {string} field - field name.
 * @returns {function} - upload decorator function.
 */
module.exports = (field) => {
  const uploadHandle = upload.single(field);
  return (target) => {
    const originalMethod = target.descriptor.value;
    target.descriptor.value = (...args) => {
      const request = args[0];
      const response = args[1];
      uploadHandle(request, response, (err) => {
        if (err) {
          Logger.error('Upload Pdf', err.message);
          response.status(HTTP_CODE.BAD_REQUEST).json({ message: err.message });
        } else {
          request.body[field] = request.file ? `${field}/${request.file.filename}` : undefined;
          originalMethod.apply(null, args);
        }
      });
    }
    return target;
  };
};
