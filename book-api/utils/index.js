const fs = require('fs');
const sendMail = require('./sendMail');
const { mkdir } = require('fs/promises');

/**
 * Return freezed object.
 *
 * @param {object} object - constant object.
 * @returns {object} - freezed object.
 */
const deepFreeze = (object) => {
  for (const key in object) {
    if (object[key] instanceof Object) {
      object[key] = deepFreeze(object[key]);
    }
  }
  return Object.freeze(object);
};

/**
 * Return message response object.
 *
 * @param {string} message - message.
 * @returns {object} - message object.
 */
const messageCreator = (message) => ({ message });

/**
 * Return otp code.
 *
 * @returns {string} - otp number.
 */
const generateOtp = () => {
  let otp = '';
  for (let i = 0; i < 6; i++) {
    otp += Math.round(Math.random() * 10);
  }
  return otp.substring(0, 6);
};

/**
 * Handle multiple promise by order.
 *
 * @param {Promise[]} promiseChain - list promise sorted by call order.
 * @param {Function} success - callback for then promise.
 * @param {Function} error - callback for catch promise.
 */
const promiseAllSettledOrder = (promiseChain, success, error) => {
  const promises = [];
  const handlePromise = (index = 0) => {
    if (index < promiseChain.length) {
      promises.push(
        promiseChain[index]()
          .catch((err) => err)
          .finally(() => handlePromise(index + 1))
      );
    } else {
      Promise.all(promises)
        .then((results) => {
          const messages = results
            .reduce((message, result) => {
              if (result instanceof Error) {
                message += result.message + "; ";
              }
              return message;
            }, '')
            .trim();

          if (messages) {
            throw new Error(messages);
          } else {
            success(results);
          }
        })
        .catch(error);
    }
  };
  handlePromise();
};

/**
 * Create folder at specific path.
 *
 * @param {string} filePath - path to stored file.
 * @return {Promise<string>} - promise contain file path.
 */
const createFolder = (path) => {
  return mkdir(path, { recursive: true });
};

/**
 * Write contents to file and save it to specific folder.
 *
 * @param {string} filePath - path to stored file.
 * @param {string} success - content of file.
 * @return {Promise<boolean>} - promise contain result.
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
          resolve(true);
        }
      }
    );
  });
};


module.exports = {
  deepFreeze,
  messageCreator,
  promiseAllSettledOrder,
  generateOtp,
  sendMail,
  saveFile,
  createFolder
};
