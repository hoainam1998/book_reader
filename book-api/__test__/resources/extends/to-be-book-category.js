const toBeBookRelationRecord = require('./utils/to-be-book-relation-record');

/**
 * Custom assertion: Validate book category.
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
      categoryId: expect.stringMatching(/^(\d){13}$/),
      name: expect.any(String),
      avatar: expect.any(String),
    },
    this
  );
};
