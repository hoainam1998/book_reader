const multer = require('multer');
const path = require('path');
const { HTTP_CODE } = require('#constants');
const { COMMON } = require('#messages');
const { messageCreator, isEmptyFile } = require('#utils');
const Logger = require('#services/logger');

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    const fileName = req.body.name.replace(/\s/, '-');
    const extName = path.extname(file.originalname);
    cb(null, `${fileName}${extName}`);
  },
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/pdf'));
  }
});

const upload = multer({
  storage,
  fileFilter: (_, file, cb) => {
    const extensionFileIsValid = /.pdf/.test(path.extname(file.originalname));
    if (extensionFileIsValid) {
      cb(null, true);
    } else {
      cb(new Error(COMMON.FILE_NOT_PDF));
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
          return response.status(HTTP_CODE.BAD_REQUEST).json(messageCreator(err.message));
        } else {
          if (request.file) {
            if (isEmptyFile(request.file)) {
              return response.status(HTTP_CODE.BAD_REQUEST)
                .json(messageCreator(COMMON.FILE_IS_EMPTY));
            }
            request.body[field] = `${field}/${request.file.filename}`;
          } else {
            if (Object.prototype.isEmpty.call(request.body)) {
              originalMethod.apply(null, args);
              return;
            }
            return response.status(HTTP_CODE.BAD_REQUEST)
              .json(messageCreator(COMMON.FIELD_NOT_PROVIDE.format(field)));
          }
          originalMethod.apply(null, args);
        }
      });
    };
    return target;
  };
};
