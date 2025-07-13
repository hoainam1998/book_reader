const { plainToInstance } = require('class-transformer');
const { saveFile, createFolder, deleteFile } = require('./handle-file');
const { convertFileToBase64, getExtName, createFile, isEmptyFile } = require('./handle-file-buffer');
const {
  signingResetPasswordToken,
  verifyResetPasswordToken,
  passwordHashing,
  autoGeneratePassword,
  generateOtp,
  signLoginToken,
  verifyLoginToken,
  verifyClientResetPasswordToken,
  signClientResetPasswordToken,
  signClientLoginToken,
  verifyClientLoginToken,
  getResetPasswordLink,
  getClientResetPasswordLink,
} = require('./auth');
const MessageResponse = require('#dto/common/message-response');

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
 * Get final result from generator function return.
 *
 * @param {class} dtoClass - The dto class.
 * @param {Object} value - The value to plain.
 * @return {Object} - The value converted.
 */
const convertDtoToZodObject = (dtoClass, value) => {
  // plain value.
  const result = plainToInstance(dtoClass, value);
  // prepare parse function for validate output phase.
  dtoClass.prepare(result);
  return result;
};

/**
 * Return message response object.
 *
 * @param {string} message - message.
 * @returns {Object} - message object.
 */
const messageCreator = (message, errorCode) => convertDtoToZodObject(MessageResponse, { message, errorCode });

/**
 * Check array is empty or not.
 *
 * @param {*} obj - The object checking.
 * @returns {boolean} - The checking result.
 */
const checkArrayHaveValues = (array) => Array.isArray(array) && array.length > 0;

/**
 * Calculator number of page.
 *
 * @param {number} pageSize - Page size.
 * @param {total} total - Total of page.
 * @returns {number} - The pages.
 */
const calcPages = (pageSize, total) => {
  const originPages = Math.floor(+total / +pageSize);
  const remainPages = +total % +pageSize;
  return originPages + (remainPages > 0 ? 1 : 0);
};

/**
 * Parse graphql select object to selected string.
 *
 * @param {Object} graphqlSelectObject - ex({ userId: true, name: true, json: { field1: true, field2: false } }).
 * @return {string} select formatted to string - ex({ userId, name, json: { field1 } }).
 */
const graphqlQueryParser = (select) => {
  const queryParser = (selected, tab = 0) => {
    const tabs = Array(tab ? tab + 1 : tab)
      .fill(' ')
      .join('');
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
 * Return origin internal server url.
 *
 * @param {Express.Request} request - The express request.
 * @return {string} - The url.
 */
const getOriginInternalServerUrl = (request) => `${request.protocol}:${request.get('host')}${request.baseUrl}`;

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
 * @return {Promise<[*]>} - The promise result.
 */
async function promiseAll(promisesFn) {
  const arr = [];
  for (const fn of promisesFn) {
    arr.push(await fn());
  }
  return arr;
}

/**
 * Prevent modify util functions when development phase.
 *
 * @param {Object} utilsObject - The utils object.
 * @return {Object} - The utils object was freezed.
 */
const freezing = (utilsObject) => {
  return process.env.NODE_ENV === 'test' ? utilsObject : Object.freeze(utilsObject);
};

module.exports = freezing({
  deepFreeze,
  calcPages,
  messageCreator,
  graphqlQueryParser,
  getGraphqlFinalData,
  getGeneratorFunctionData,
  convertFileToBase64,
  getExtName,
  isEmptyFile,
  saveFile,
  createFolder,
  createFile,
  promiseAll,
  deleteFile,
  fetchHelper,
  getOriginInternalServerUrl,
  convertDtoToZodObject,
  checkArrayHaveValues,
  passwordHashing,
  signingResetPasswordToken,
  verifyResetPasswordToken,
  autoGeneratePassword,
  generateOtp,
  signLoginToken,
  verifyLoginToken,
  verifyClientResetPasswordToken,
  signClientResetPasswordToken,
  signClientLoginToken,
  verifyClientLoginToken,
  getResetPasswordLink,
  getClientResetPasswordLink,
});
