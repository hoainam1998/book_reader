const toBeBookRelationRecords = require('./utils/to-be-book-relation-records');

/**
 * @typedef Author
 * @type {object}
 * @property {string} [authorId] - author id
 * @property {string} [name] - author name
 * @property {string} [avatar] - author avatar
 */

/**
 * Custom assertion: Validate book authors
 *
 * @param {Author[]} value - The received value.
 * @return {{
 * message: () => string,
 * pass: boolean
 * }}
 */
module.exports = function (value) {
  return toBeBookRelationRecords(
    value,
    {
      authorId: expect.stringMatching(/^(\d){13}$/),
      name: expect.any(String),
      avatar: expect.any(String),
    },
    this
  );
};
