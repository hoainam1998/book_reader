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
  if (data && typeof data === 'object') {
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
      if (context.value instanceof Promise) {
        finalResult = context.value;
      }
      done = context.done;
    }
    return finalResult;
  }
  return generator;
};

const convertFileToBase64 = (file) => `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

const getExtName = (file) => path.extname(file.originalname);

const createFile = (file) => new File([file.buffer], file.originalname, { type: file.mimetype });

const fetchHelper = (url, method, body) => fetch(url, { method, body });

async function promiseAll(promisesFn) {
  const arr = [];
  for (const fn of promisesFn) {
    arr.push(await fn());
  }
  return arr;
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
};
