const toBeBookRelationRecord = require('./utils/to-be-book-relation-record');

/**
 * Custom assertion: Validate book introduce.
 *
 * @param {value} - The received value.
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
