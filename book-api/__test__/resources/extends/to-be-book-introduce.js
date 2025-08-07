const toBeBookRelationRecord = require('./utils/to-be-book-relation-record');

/**
 * @typedef Introduce
 * @type {object}
 * @property {string} [html] - html file
 * @property {string} [json] - json file.
 */

/**
 * Custom assertion: Validate book introduce.
 *
 * @param {Introduce} value - The received value.
 * @return {{
 * message: () => string,
 * pass: boolean
 * }}
 */
module.exports = function (value) {
  return toBeBookRelationRecord(
    value,
    {
      html: expect.any(String),
      json: expect.any(String),
    },
    this
  );
};
