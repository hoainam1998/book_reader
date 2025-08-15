const toBeBookRelationRecords = require('./utils/to-be-book-relation-records');

/**
 * @typedef ReadLateBook
 * @type {object}
 * @property {string} [bookId] - book id
 * @property {string} [name] - book name
 * @property {string} [avatar] - avatar
 * @property {{
 * name: string,
 * authorId: string
 * }[]} [authors] - authors
 * @property {string} [createAt] - The create time.
 */

/**
 * Custom assertion: Validate relate books.
 *
 * @param {ReadLateBook[]} value - The received value.
 * @return {{
 * message: () => string,
 * pass: boolean
 * }}
 */
module.exports = function (value) {
  return toBeBookRelationRecords(
    value,
    {
      bookId: expect.any(String),
      name: expect.any(String),
      authors: expect.toBeBookAuthors(),
      avatar: expect.any(String),
      createAt: expect.any(String),
    },
    this
  );
};
