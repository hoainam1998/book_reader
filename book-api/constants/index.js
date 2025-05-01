const { deepFreeze } = require('#utils');

module.exports = deepFreeze({
  UPLOAD_MODE: {
    SINGLE: 'single',
    ARRAY: 'array',
    FIELDS: 'fields'
  },
  HTTP_CODE: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    UNAUTHORIZED: 401,
    NOT_PERMISSION: 403,
    METHOD_NOT_ALLOWED: 405,
    SERVER_ERROR: 500
  },
  METHOD: {
    POST: 'POST',
    GET: 'GET',
    PUT: 'PUT',
    DELETE: 'DELETE'
  },
  PATH: {
    CATEGORY: '/category',
    BOOK: '/book',
    USER: '/user',
    AUTHOR: '/author',
    CLIENT: '/client',
  },
  REQUEST_DATA_PASSED_TYPE: {
    PARAM: 'param',
    BODY: 'body',
    QUERY: 'query',
    FILES: 'files',
  },
  POWER: {
    ADMIN: 'Admin',
    USER: 'User',
  },
  RESET_PASSWORD_URL: `${process.env.ORIGIN_CORS}/reset-password?token={0}`,
});
