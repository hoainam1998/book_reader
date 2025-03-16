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
    SERVER_ERROR: 500
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
  INTERNAL_ERROR_MESSAGE: 'Internal server error! Please contact my admin!'
});
