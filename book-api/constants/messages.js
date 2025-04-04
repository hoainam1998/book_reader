const { deepFreeze } = require('#utils');

module.exports = deepFreeze({
  COMMON: {
    INTERNAL_ERROR_MESSAGE: 'Internal server error! Please contact my admin!',
    INPUT_VALIDATE_FAIL: 'Something is not expected. Please try again or contact my admin!',
    OUTPUT_VALIDATE_FAIL: 'Output did not expect!',
    METHOD_NOT_ALLOWED: 'Method {0} not allowed for {1} url!',
    URL_INVALID: 'Can not found {0}!',
    AUTHENTICATION_TOKEN_INVALID: 'Invalid authentication token!',
  },
  USER: {
    USER_NOT_FOUND: 'User not found!',
    LOGIN_FAIL: 'Login was failed!',
    USER_NOT_PERMISSION: 'Your are not permission!',
    USER_UNAUTHORIZED: 'Your have not login yet!',
    USER_ADDED: 'Add user success! An announcement email has been sent to the user just has been created!',
  },
});
