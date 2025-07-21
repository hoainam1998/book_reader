const { POWER } = require('#constants');

/**
 * Custom assertion: Validate received list will match with expected list.
 *
 * @param {*[]} - The received list.
 * @param {string} id - Your id.
 * @param {string} role - Your role.
 * @param {object} expectedObj - The expected object.
 * @return {{
 * message: () => string,
 * pass: boolean
 * }}
 */
function toBeMatchList(receivedList, id, role, expectedObj) {
  let pass = true;
  if (role === POWER.ADMIN) {
    pass = receivedList.every((user) => {
      const matchWithExpected = this.equals(user, expect.objectContaining(expectedObj));
      if (user.userId === id || ([POWER.ADMIN, POWER.SUPER_ADMIN].includes(user.role) && user.userId !== id)) {
        return matchWithExpected && this.equals(user, { ...user, mfaEnable: null, userId: null });
      }
    });
  }

  const message = pass
    ? () =>
        `expected ${this.utils.printReceived(receivedList)} not to be within range ${this.utils.printExpected(
          expectedObj
        )}`
    : () =>
        `expected ${this.utils.printReceived(receivedList)} to be within range ${this.utils.printExpected(
          expectedObj
        )}`;

  return {
    pass,
    message,
  };
}

module.exports = toBeMatchList;
