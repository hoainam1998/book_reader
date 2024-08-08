const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    const fileName = req.name.replace(/\s/, '-');
    const extName = path.extname(file.originalname);
    cb(null, `${fileName}${extName}`);
  },
});

const upload = multer({
  storage,
  dest: '../public/html',
  fileFilter: (_, file, cb) => {
    const extensionFileIsValid = /.pdf/.test(path.extname(file.originalname));
    if (extensionFileIsValid) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
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
          response.status(400).json({ message: err.message });
        } else {
          originalMethod.apply(null, args);
        }
      });
    }
    return target;
  };
};
