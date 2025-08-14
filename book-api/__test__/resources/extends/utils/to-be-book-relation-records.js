/**
 * Custom assertion: Validate value relation records
 *
 * @param {value} - The received value.
 * @param {object} expectedObj - The expected object.
 * @return {{
 * message: () => string,
 * pass: boolean
 * }}
 */
function toBeBookRelationRecords(value, expectedObject, globalJest) {
  const pass = value.every((record) => {
    return Object.keys(record).every((key) => globalJest.equals(record[key], expectedObject[key]));
  });

  const message = pass
    ? () =>
        `expected ${globalJest.utils.printReceived(value)} not match with ${globalJest.utils.printExpected(expectedObject)}`
    : () =>
        `expected ${globalJest.utils.printReceived(value)} match with ${globalJest.utils.printExpected(expectedObject)}`;

  return {
    pass,
    message,
  };
}

module.exports = toBeBookRelationRecords;
