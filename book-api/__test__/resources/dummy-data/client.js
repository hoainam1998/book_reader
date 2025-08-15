const DummyDataApi = require('./api');
const { autoGeneratePassword, passwordHashing, signClientResetPasswordToken, signClientLoginToken } = require('#utils');
const { BLOCK, SEX } = require('#constants');
const randomPassword = autoGeneratePassword();

/**
 * Create a book list.
 *
 * @param {number} amount - The book amount.
 * @return {*[]} - The book list.
 */
const createBooks = (amount) => {
  return Array.apply(null, Array(amount)).map((_, index) => ({
    book: {
      name: `book ${index}`,
      book_id: Date.now().toString(),
      avatar: `avatar ${index}`,
      authors: [],
    },
    added_at: Date.now().toString(),
  }));
};

/**
 * The class store client data and behavior of them.
 *
 * @class
 * @extends DummyDataApi
 */
class ClientDummyData extends DummyDataApi {
  static default = new ClientDummyData();

  /**
   * Access password.
   *
   * @static
   * @return {string} - The password.
   */
  static password = randomPassword;

  constructor() {
    super(
      {
        reader_id: Date.now().toString(),
        last_name: 'last name',
        first_name: 'first_name',
        password: passwordHashing(randomPassword),
        avatar: 'avatar',
        email: 'unknown_client@gmail.com',
        sex: SEX.MALE,
        blocked: BLOCK.OFF,
        phone: '0987654321',
        favorite_books: createBooks(2),
        read_late: createBooks(2),
        used_read: createBooks(2),
      },
      null,
      {
        clientId: expect.any(String),
        lastName: expect.any(String),
        firstName: expect.any(String),
        password: expect.any(String),
        avatar: expect.any(String),
        email: expect.any(String),
        sex: expect.any(Number),
        blocked: expect.any(Number),
        phone: expect.any(String),
        name: expect.any(String),
        apiKey: expect.any(String),
        passwordMustChange: expect.any(Boolean),
        favoriteBooks: expect.toBeRelateBooks(),
        readLate: expect.toBeRelateBooks(),
        usedRead: expect.toBeRelateBooks(),
      }
    );
  }

  /**
   * Access reset password token.
   *
   * @static
   * @return {string} - The reset password token.
   */
  static get resetPasswordToken() {
    return signClientResetPasswordToken(this.MockData.email);
  }

  /**
   * Access api key.
   *
   * @static
   * @return {string} - The api key.
   */
  static get apiKey() {
    return signClientLoginToken(this.MockData.email);
  }

  /**
   * Create the expected client list.
   *
   * @static
   * @param {object} requestBodyQuery - The request body query.
   * @param {number} length - The number client create.
   * @param {string[]} [excludeFields=[]] - The fields should remove.
   * @return {object[]} - The expected client list.
   */
  static generateClientExpectedList(requestBodyQuery, length, excludeFields = []) {
    return Array.apply(null, Array(length)).map(() => {
      return ClientDummyData.generateExpectedObject(requestBodyQuery, excludeFields);
    });
  }

  /**
   * Create the client list for test.
   *
   * @static
   * @param {number} length - The number of clients who want to create.
   * @return {object[]} - The client list.
   */
  static createMockClientList(length) {
    return Array.apply(null, Array(length)).map(() => ClientDummyData.MockData);
  }

  /**
   * Access session data.
   *
   * @static
   * @return {{
   * client: {
   * email: string,
   * apiKey: string
   * }
   * }} - The session data.
   */
  static get session() {
    return {
      client: {
        clientId: this.MockData.reader_id,
        email: this.MockData.email,
        apiKey: signClientLoginToken(this.MockData.email),
      },
    };
  }
}

module.exports = ClientDummyData;
