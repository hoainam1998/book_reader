const toBeBookRelationRecords = require('./utils/to-be-book-relation-records');

/**
 * Custom assertion: Validate value is book images
 *
 * @param {value} - The received value.
 * @return {{
 * message: () => string,
 * pass: boolean
 * }}
 */
module.exports = function (value) {
  return toBeBookRelationRecords(
    value,
    {
      name: expect.any(String),
      image: expect.any(String),
    },
    this
  );
};
