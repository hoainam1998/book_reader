/**
 * Additional error code for http code.
 * @class
 */
class ErrorCode {
  /**
   * Not error happen.
   * @static
   */
  static ALL_FINE = 'ALL_FINE';

  /**
   * Url not found.
   * @static
   */
  static URL_NOT_FOUND = 'URL_NOT_FOUND';

  /**
   * Login information not found.
   * @static
   */
  static CREDENTIAL_NOT_MATCH = 'CREDENTIAL_NOT_MATCH';

  /**
   * User have not login yet.
   * @static
   */
  static HAVE_NOT_LOGIN = 'HAVE_NOT_LOGIN';

  /**
   * User already logged.
   * @static
   */
  static ALREADY_LOGGED = 'ALREADY_LOGGED';

  /**
   * Authentication token was expired.
   * @static
   */
  static TOKEN_EXPIRED = 'TOKEN_EXPIRED';

  /**
   * Authentication token are invalid.
   * @static
   */
  static TOKEN_INVALID = 'TOKEN_INVALID';

  /**
   * Working session ended.
   * @static
   */
  static WORKING_SESSION_ENDED = 'WORKING_SESSION_ENDED';

  /**
   * Mfa turn off.
   * @static
   */
  static MFA_TURN_OFF = 'MFA_TURN_OFF';

  /**
   * Some data is duplicate.
   * @static
   */
  static DATA_IS_DUPLICATE = 'DATA_IS_DUPLICATE';

  /**
   * Only allow the one user on the one device.
   * @static
   */
  static ONLY_ALLOW_ONE_DEVICE = 'ONLY_ALLOW_ONE_DEVICE';

  /**
   * Already have admin user.
   * @static
   */
  static ALREADY_HAVE_ADMIN = 'ALREADY_HAVE_ADMIN';
}

module.exports = ErrorCode;
