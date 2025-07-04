const RoutePath = require('./route-paths');
const { PATH } = require('#constants');

const createRoutePath = RoutePath.Base({ baseUrl: PATH.USER });

/**
 * Storage user route path.
 * @class
 */
class UserRoutePath {
  /**
  * Relative: /user-detail *Absolute: user/user-detail
  */
  static userDetail = createRoutePath({ url: 'user-detail' }, [process.env.ORIGIN_CORS]);

  /**
  * Relative: /login *Absolute: user/login
  */
  static login = createRoutePath({ url: 'login' }, [process.env.ORIGIN_CORS]);

  /**
  * Relative: /login-process *Absolute: user/login-process
  */
  static loginProcess = createRoutePath({ url: 'login-process' }, []);

  /**
  * Relative: /logout *Absolute: user/logout
  */
  static logout = createRoutePath({ url: 'logout' }, [process.env.ORIGIN_CORS]);

  /**
  * Relative: /delete *Absolute: user/delete
  */
  static delete = createRoutePath({ url: 'delete', subUrl: ':id' }, [process.env.ORIGIN_CORS]);

  /**
  * Relative: /create-user *Absolute: user/create-user
  */
  static createUser = createRoutePath({ url: 'create-user' }, [process.env.ORIGIN_CORS]);

  /**
  * Relative: /add *Absolute: user/add
  */
  static add = createRoutePath({ url: 'add' }, []);

  /**
  * Relative: /update-user *Absolute: user/update-user
  */
  static updateUser = createRoutePath({ url: 'update-user' }, [process.env.ORIGIN_CORS]);

  /**
  * Relative: /verify-otp *Absolute: user/verify-otp
  */
  static verifyOtp = createRoutePath({ url: 'verify-otp' }, [process.env.ORIGIN_CORS]);

  /**
  * Relative: /verify-otp-process *Absolute: user/verify-otp-process
  */
  static verifyOtpProcess = createRoutePath({ url: 'verify-otp-process' }, []);

  /**
  * Relative: /forget-password *Absolute: user/forget-password
  */
  static forgetPassword = createRoutePath({ url: 'forget-password' }, [process.env.ORIGIN_CORS]);

  /**
  * Relative: /forget-password-process *Absolute: user/forget-password-process
  */
  static forgetPasswordProcess = createRoutePath({ url: 'forget-password-process' }, []);

  /**
  * Relative: /all *Absolute: user/all
  */
  static all = createRoutePath({ url: 'all' }, [process.env.ORIGIN_CORS]);

  /**
  * Relative: /send-otp *Absolute: user/send-otp
  */
  static sendOtp = createRoutePath({ url: 'send-otp' }, [process.env.ORIGIN_CORS]);

  /**
  * Relative: /update-otp *Absolute: user/update-otp
  */
  static updateOtp = createRoutePath({ url: 'update-otp' }, []);

  /**
  * Relative: /update-person *Absolute: user/update-person
  */
  static updatePerson = createRoutePath({ url: 'update-person' }, [process.env.ORIGIN_CORS]);

  /**
  * Relative: /pagination *Absolute: user/pagination
  */
  static pagination = createRoutePath({ url: 'pagination' }, [process.env.ORIGIN_CORS]);

  /**
  * Relative: /reset-password *Absolute: user/reset-password
  */
  static resetPassword = createRoutePath({ url: 'reset-password' }, [process.env.ORIGIN_CORS]);

  /**
  * Relative: /update-mfa *Absolute: user/update-mfa
  */
  static updateMfa = createRoutePath({ url: 'update-mfa' }, [process.env.ORIGIN_CORS]);

  /**
  * Relative: /update-power *Absolute: user/update-power
  */
  static updatePower = createRoutePath({ url: 'update-power' }, [process.env.ORIGIN_CORS]);
}

module.exports = UserRoutePath;
