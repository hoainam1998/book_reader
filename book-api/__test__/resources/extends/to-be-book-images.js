const toBeBookRelationRecords = require('./utils/to-be-book-relation-records');

/**
 * @typedef Image
 * @type {object}
 * @property {string} [name] - name
 * @property {string} [image] - image
 */

/**
 * Custom assertion: Validate value is book images
 *
 * @param {Image[]} value - The received value.
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
