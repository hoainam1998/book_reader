const multer = require('multer');
const path = require('path');
const { UPLOAD_MODE, HTTP_CODE } = require('#constants');
const { COMMON } = require('#messages');
const { convertFileToBase64, messageCreator, isEmptyFile } = require('#utils');
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
      cb(new Error(COMMON.FILE_NOT_IMAGE));
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
          Logger.error('Upload file!', err.message);
          return response.status(HTTP_CODE.BAD_REQUEST).json(messageCreator(err.message));
        } else {
          // run by mode, and convert file to base64 string.
          switch (mode) {
            case UPLOAD_MODE.SINGLE:
              if (request.file) {
                if (isEmptyFile(request.file)) {
                  return response.status(HTTP_CODE.BAD_REQUEST)
                    .json(messageCreator(COMMON.FILE_IS_EMPTY));
                } else {
                  args[0].body[fields] = convertFileToBase64(request.file);
                }
              } else {
                args[0].body[fields] = request.body[fields];
              }
              break;
            case UPLOAD_MODE.ARRAY:
              let haveEmptyFile = false;
              args[0].body[fields] = request.files.map(file => {
                if (isEmptyFile(file)) {
                  haveEmptyFile = true;
                } else {
                  return convertFileToBase64(file);
                }
              });
              if (haveEmptyFile) {
                return response.status(HTTP_CODE.BAD_REQUEST)
                  .json(messageCreator(COMMON.FILE_FIELD_EMPTY.format(fields)));
              }
              break;
            case UPLOAD_MODE.FIELDS:
              let nameOfFieldHaveEmptyFile = '';
              if (request.files) {
                const fieldName = fields.find(({ name }) => {
                  if (request.files[name]) {
                    request.body[name] = request.files[name].map(file => {
                      if (isEmptyFile(file)) {
                        nameOfFieldHaveEmptyFile = name;
                      } else {
                        return convertFileToBase64(file);
                      }
                    });
                    return false;
                  } else {
                    return true;
                  }
                });

                if (nameOfFieldHaveEmptyFile) {
                  return response.status(HTTP_CODE.BAD_REQUEST)
                    .json(messageCreator(COMMON.FILE_FIELD_EMPTY.format(nameOfFieldHaveEmptyFile)));
                }

                if (fieldName) {
                  return response.status(HTTP_CODE.BAD_REQUEST)
                    .json(messageCreator(COMMON.FIELD_NOT_PROVIDE.format(fieldName.name)));
                }
              } else {
                return response.status(HTTP_CODE.BAD_REQUEST)
                  .json(messageCreator(COMMON.FILE_IS_EMPTY));
              }
              break;
            default: break;
          }
          originalMethod.apply(null, args);
        }
      });
    };
    return target;
  }
};
