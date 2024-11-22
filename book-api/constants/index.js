const { deepFreeze } = require('#utils');

module.exports = deepFreeze({
  UPLOAD_MODE: {
    SINGLE: 'single',
    ARRAY: 'array',
    FIELDS: 'fields'
  },
  HTTP_CODE: {
    OK: 200,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    CREATED: 201,
    UNAUTHORIZED: 401
  },
  PATH: {
    CATEGORY: '/category',
    BOOK: '/book',
    USER: '/user',
    AUTHOR: '/author'
  }
});
