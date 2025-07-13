/**
 * jsonwebtoken error mocking class.
 * @class
 * @extends Error
 */
class JsonWebTokenErrorMockClass extends Error {
  /**
   * Create error mocking instance.
   *
   * @constructs
   * @param {string} message - An error message.
   */
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * jsonwebtoken common error mocking class.
 * @class
 * @extends JsonWebTokenErrorMockClass
 */
class JsonWebTokenError extends JsonWebTokenErrorMockClass {}

/**
 * jsonwebtoken token expired error mocking class.
 * @class
 * @extends JsonWebTokenErrorMockClass
 */
class TokenExpiredError extends JsonWebTokenErrorMockClass {}

module.exports = {
  JsonWebTokenError,
  TokenExpiredError,
};
