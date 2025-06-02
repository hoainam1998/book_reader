const DummyDataApi = require('./api');
const {
  autoGeneratePassword,
  passwordHashing,
  signClientResetPasswordToken,
  signClientLoginToken
} = require('#utils');
const randomPassword = autoGeneratePassword();

/**
 * The class store client data and behavior of them.
 *
 * @class
 * @extends DummyDataApi
 */
class ClientDummyData extends DummyDataApi {
  static default = new ClientDummyData();

  constructor() {
    super(
      {
        reader_id: Date.now().toString(),
        last_name: 'last name',
        first_name: 'first_name',
        password: passwordHashing(randomPassword),
        avatar: 'avatar',
        email: 'unknown_client@gmail.com',
        sex: 0,
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
        apiKey: expect.any(String),
        passwordMustChange: expect.any(Boolean),
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
   * Access password.
   *
   * @static
   * @return {string} - The password.
   */
  static get password() {
    return randomPassword;
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
        email: this.MockData.email,
        apiKey: signClientLoginToken(this.MockData.email),
      }
    };
  }
}

module.exports = ClientDummyData;
