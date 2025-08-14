/**
 * Custom assertion: Validate value relation record.
 *
 * @param {value} - The received value.
 * @param {object} expectedObj - The expected object.
 * @return {{
 * message: () => string,
 * pass: boolean
 * }}
 */
function toBeBookRelationRecord(value, expectedObject, globalJest) {
  const pass = Object.keys(value).every((key) => globalJest.equals(value[key], expectedObject[key]));

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

module.exports = toBeBookRelationRecord;
