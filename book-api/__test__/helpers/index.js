const path = require('path');
const { COMMON } = require('#messages');

/**
 * Get test static file.
 *
 * @param {string} filePath - The file path.
 * @return {string} - The absolute file path.
 */
const getStaticFile = (filePath) => {
  return path.join(process.cwd(), '__test__/resources/static', filePath);
};

/**
 * Get input validate message.
 *
 * @param {string} message - An error message.
 * @return {string} - The message concat with input validate error message.
 */
const getInputValidateMessage = (message) => `${message}\n${COMMON.INPUT_VALIDATE_FAIL}`;

/**
 * Get describe api test.
 *
 * @param {string} method - The request method.
 * @param {string} url - The url.
 * @return {string} - The describe api test.
 */
const createDescribeTest = (method, url) => {
  return `${method} - ${url}`;
};

module.exports = {
  getStaticFile,
  getInputValidateMessage,
  createDescribeTest,
};
