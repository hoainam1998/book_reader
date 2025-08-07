const toBeBookRelationRecord = require('./utils/to-be-book-relation-record');

/**
 * @typedef Category
 * @type {object}
 * @property {string} [categoryId] - category id
 * @property {string} [name] - category name
 * @property {string} [avatar] - category avatar
 */

/**
 * Custom assertion: Validate book category.
 *
 * @param {Category} value - The received value.
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
