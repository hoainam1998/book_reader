const { mockUser } = require('./auth');

const userQueryFieldExpectedTypes = {
  userId: expect.any(String),
  name: expect.any(String),
  firstName: expect.any(String),
  lastName: expect.any(String),
  email: expect.any(String),
  avatar: expect.any(String),
  phone: expect.any(String),
  sex: expect.any(Number),
  role: expect.any(String),
  power: expect.any(Boolean),
  isAdmin: expect.any(Boolean),
  mfaEnable: expect.any(Boolean),
};

/**
 * Create the user list for test.
 *
 * @param {number} length - The number of users who want to create.
 * @return {object[]} - The user list.
 */
const createMockUserList = (length) => {
 return Array.apply(null, Array(length)).map(() => mockUser);
};

/**
 * Create expected object.
 *
 * @param {object} requestBodyQuery - The request body query.
 * @param {object} queryFieldExpectedTypes - The expected type of query.
 * @param {string[]} [excludeFields=[]] - The fields should remove.
 * @return {object} - The expected object.
 */
const generateExpectedObject = (requestBodyQuery, queryFieldExpectedTypes, excludeFields = []) => {
  return Object.keys(requestBodyQuery).reduce((queryExpected, field) => {
    if (excludeFields.length) {
      if (excludeFields.includes(field)) {
        return queryExpected;
      }
    }
    queryExpected[field] = queryFieldExpectedTypes[field];
    return queryExpected;
  }, {});
};

/**
 * Create the expected user list.
 *
 * @param {object} requestBodyQuery - The request body query.
 * @param {number} length - The number user create.
 * @param {string[]} [excludeFields=[]] - The fields should remove.
 * @return {object[]} - The expected user list.
 */
const generateUserExpectedList = (requestBodyQuery, length, excludeFields= []) => {
  return Array.apply(null, Array(length)).map(() => {
    return generateExpectedObject(requestBodyQuery, userQueryFieldExpectedTypes, excludeFields);
  });
};

module.exports = {
  createMockUserList,
  generateExpectedObject,
  generateUserExpectedList,
  userQueryFieldExpectedTypes,
};
