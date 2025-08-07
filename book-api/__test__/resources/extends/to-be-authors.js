const toBeBookRelationRecords = require('./utils/to-be-book-relation-records');

/**
 * Custom assertion: Validate book authors
 *
 * @param {value} - The received value.
 * @return {{
 * message: () => string,
 * pass: boolean
 * }}
 */

module.exports = function(value) {
  return toBeBookRelationRecords(value, {
    authorId: expect.stringMatching(/^(\d){13}$/),
    name: expect.any(String),
    avatar: expect.any(String),
  }, this);
};
