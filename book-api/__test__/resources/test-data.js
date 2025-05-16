const { mockUser } = require('./auth');

/**
 * Create the user list for test.
 * @param {number} length - The number of users who want to create.
 * @return {Object[]} - The user list.
 */
const createMockUserList = (length) => {
 return Array.apply(null, Array(length)).map(() => mockUser);
};

module.exports = {
  createMockUserList,
};
