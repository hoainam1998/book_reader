const fs = require('fs');
const path = require('path');
const sendMail = require('./sendMail');
const { mkdir } = require('fs/promises');
const { plainToInstance } = require('class-transformer');
const MessageResponse = require('#dto/common/message-response.js');

/**
 * Return freezed object.
 *
 * @param {Object} object - constant object.
 * @returns {Object} - freezed object.
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
 * @returns {Object} - message object.
 */
const messageCreator = (message) => plainToInstance(MessageResponse, { message });

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
 * Create folder at specific path.
 *
 * @param {string} filePath - path to stored file.
 * @return {Promise<string>} promise contain file path.
 */
const createFolder = (path) => {
  return mkdir(path, { recursive: true });
};

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
 * Parse graphql select object to selected string.
 *
 * @param {Object} graphqlSelectObject - ex({ userId: true, name: true, json: { field1: true, field2: false } }).
 * @return {string} select formatted to string - ex({ userId, name, json: { field1 } }).
 */
const graphqlQueryParser = (select) => {
  const queryParser = (selected, tab = 0) => {
    const tabs = Array(tab ? tab + 1 : tab).fill(' ').join('');
    const queryStr = Object.keys(selected).reduce((query, key) => {
      if (selected[key]) {
        if (tab) {
          query += `${tabs} ${key}\n`;
        } else {
          query += ` ${key}\n`;
        }

        if (typeof selected[key] === 'object') {
          query += queryParser(selected[key], tab > 0 ? tab + 2 : tab + 1);
        }
      }
      return query;
    }, '');
    return `${tabs}{\n${queryStr.trimEnd()}\n${tabs}}`;
  };
  return queryParser(select);
};

/**
 * Get final result from graphql result.
 *
 * @param {Object} generator - The graphql response (ex: data { user: { email, apiKey } } to { email, apiKey }).
 * @return {Object} The final result.
 */
const getGraphqlFinalData = (data) => {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const keys = Object.keys(data);
    if (keys.length > 0) {
      if (keys.length > 1) {
        return data;
      } else {
        if (typeof data[keys[0]] !== 'object') {
          return data;
        }
        return getGraphqlFinalData(data[keys[0]]);
      }
    }
    return data;
  }
  return data;
};

/**
 * Get final result from generator function return.
 *
 * @param {Object} generator - The generator result.
 * @return {Object} The final result.
 */
const getGeneratorFunctionData = (generator) => {
  if (generator && generator.next) {
    let finalResult;
    let done = false;

    while (!done) {
      const context = generator.next();
      if (context.value instanceof Promise || Object.hasOwn(context.value || {}, 'errors')) {
        finalResult = context.value;
      }
      done = context.done;
    }
    return finalResult;
  }

  return generator;
};

/**
 * Convert file to base64 image file string.
 *
 * @param {File} file - The file object.
 * @return {string} The image base64 string.
 */
const convertFileToBase64 = (file) => `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

/**
 * Get extension name of file.
 *
 * @param {File} file - The file object.
 * @return {string} The extension name.
 */
const getExtName = (file) => path.extname(file.originalname);

/**
 * Convert a multer file to new file.
 *
 * @param {Object} multerFile - The multerFile object.
 * @return {File} The file object.
 */
const createFile = (file) => new File([file.buffer], file.originalname, { type: file.mimetype });

/**
 * Fetch helper to call api internally.
 *
 * @param {[ url: string, method: string, header: Object | undefined, body: Object ]} args - The fetch api props.
 * @return {Promise} - The promise result.
 */
const fetchHelper = (...args) => {
  let headers;
  const url = args[0];
  const method = args[1];
  headers = args.length === 4 ? args[2] : headers;
  const body = args.length === 4 ? args[3] : args[2];

  return fetch(url, { method, headers, body });
};

/**
 * Run all promise.
 *
 * @async
 * @param {[Promise]} promises - The array of promises.
 * @return {Promise<[*]>} The promise result.
 */
async function promiseAll(promisesFn) {
  const arr = [];
  for (const fn of promisesFn) {
    arr.push(await fn());
  }
  return arr;
};

/**
 * Delete file asynchronous.
 *
 * @async
 * @param {string} filePath - The file path.
 * @return {Promise<[*]>} The promise result.
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
  deepFreeze,
  messageCreator,
  generateOtp,
  sendMail,
  saveFile,
  createFolder,
  graphqlQueryParser,
  getGraphqlFinalData,
  getGeneratorFunctionData,
  convertFileToBase64,
  getExtName,
  createFile,
  fetchHelper,
  promiseAll,
  deleteFile,
};
