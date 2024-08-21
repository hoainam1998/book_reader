const multer = require('multer');
const path = require('path');
const { HTTP_CODE } = require('../constants/index.js');

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
 * @param {String} - field name.
 * @returns {Function} - upload decorator function.
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
          response.status(HTTP_CODE.BAD_REQUEST).json({ message: err.message });
        } else {
          if (request.file) {
            request.body[field] = request.file.filename;
          }
          originalMethod.apply(null, args);
        }
      });
    }
    return target;
  };
};
