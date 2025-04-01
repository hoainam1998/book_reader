const { deepFreeze } = require('#utils');

module.exports = deepFreeze({
  COMMON: {
    INTERNAL_ERROR_MESSAGE: 'Internal server error! Please contact my admin!',
    INPUT_VALIDATE_FAIL: 'Something is not expected. Please try again or contact my admin!',
    OUTPUT_VALIDATE_FAIL: 'Output did not expect!',
    METHOD_NOT_ALLOWED: 'Method {1} not allowed for {2} url!',
    URL_INVALID: 'Can not found {1}!'
  },
  USER: {
    USER_NOT_FOUND: 'User not found!',
    LOGIN_FAIL: 'Login was failed!'
  },
});
