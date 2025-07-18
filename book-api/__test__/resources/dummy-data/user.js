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
   */
  constructor() {
    super(mockUser, null, {
      userId: expect.any(String),
      name: expect.any(String),
      firstName: expect.any(String),
      lastName: expect.any(String),
      email: expect.any(String),
      avatar: expect.any(String),
      phone: expect.any(String),
      sex: expect.any(Number),
      role: expect.any(String),
      power: expect.any(Number),
      isAdmin: expect.any(Boolean),
      mfaEnable: expect.any(Boolean),
    });
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
  }

  /**
   * Create the user list for test.
   *
   * @static
   * @param {number} length - The number of users who want to create.
   * @return {object[]} - The user list.
   */
  static createMockUserList(length) {
    return Array.apply(null, Array(length)).map(() => UserDummyData.MockData);
  }
}

module.exports = UserDummyData;
