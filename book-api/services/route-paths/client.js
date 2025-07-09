const RoutePath = require('./route-paths');
const { PATH } = require('#constants');

const createRoutePath = RoutePath.Base({ baseUrl: PATH.CLIENT });

/**
 * Storage client route path.
 * @class
 */
class ClientRoutePath {
  /**
  * Relative: /detail *Absolute: client/detail
  */
  static detail = createRoutePath({ url: 'detail' }, [process.env.CLIENT_ORIGIN_CORS]);

  /**
  * Relative: /login *Absolute: client/login
  */
  static login = createRoutePath({ url: 'login' }, [process.env.CLIENT_ORIGIN_CORS]);

  /**
  * Relative: /logout *Absolute: client/logout
  */
  static logout = createRoutePath({ url: 'logout' }, [process.env.CLIENT_ORIGIN_CORS]);

  /**
  * Relative: /reset-password *Absolute: client/reset-password
  */
  static resetPassword = createRoutePath({  url: 'reset-password' }, [process.env.CLIENT_ORIGIN_CORS]);

  /**
  * Relative: /generated-reset-password-token *Absolute: client/generated-reset-password-token
  */
  static generatedResetPasswordToken = createRoutePath({ url: 'generated-reset-password-token' }, []);

  /**
  * Relative: /forget-password *Absolute: client/forget-password
  */
  static forgetPassword = createRoutePath({ url: 'forget-password' }, [process.env.CLIENT_ORIGIN_CORS]);

  /**
  * Relative: /sign-up *Absolute: client/sign-up
  */
  static signUp = createRoutePath({ url: 'sign-up' }, [process.env.CLIENT_ORIGIN_CORS]);

  /**
  * Relative: /update-person *Absolute: client/update-person
  */
  static updatePerson = createRoutePath({ url: 'update-person' }, [process.env.CLIENT_ORIGIN_CORS]);

  /**
  * Relative: /all *Absolute: client/all
  */
  static all = createRoutePath({ url: 'all' }, [process.env.CLIENT_ORIGIN_CORS]);
}

module.exports = ClientRoutePath;
