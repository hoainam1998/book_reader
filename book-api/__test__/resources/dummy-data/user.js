const DummyDataApi = require('./api');
const { mockUser } = require('../auth');

/**
 * The class store user data and behavior of them.
 *
 * @class
 * @extends DummyDataApi
 */
class UserDummyData extends DummyDataApi {
  static default = new UserDummyData();

  /**
   * Create user dummy data instance.
   *
   * @param {object} mockData - The mocking data.
   * @param {object} expectedTypes - Expected type of mock data.
   */
  constructor() {
    super(
      mockUser,
      {
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
      }
    );
  }

  static get MockData() {
    return UserDummyData.default.MockData;
  }

  /**
  * Return query object with type accord with expected types.
  *
  * @static
  * @param {object} query - The requirement query object.
  * @param {array} [excludeFields=[]] - The fields should be remove.
  * @return {object} - The expected object.
  */
  static generateExpectedObject(query, excludeFields = []) {
    return UserDummyData.default.generateExpectedObject(query, excludeFields);
  }

  /**
   * Create the expected user list.
   *
   * @static
   * @param {object} requestBodyQuery - The request body query.
   * @param {number} length - The number user create.
   * @param {string[]} [excludeFields=[]] - The fields should remove.
   * @return {object[]} - The expected user list.
   */
  static generateUserExpectedList(requestBodyQuery, length, excludeFields = []) {
    return Array.apply(null, Array(length)).map(() => {
      return UserDummyData.generateExpectedObject(requestBodyQuery, excludeFields);
    });
  };

  /**
   * Create the user list for test.
   *
   * @static
   * @param {number} length - The number of users who want to create.
   * @return {object[]} - The user list.
   */
  static createMockUserList (length) {
    return Array.apply(null, Array(length)).map(() => UserDummyData.MockData);
  };
}

module.exports = UserDummyData;
