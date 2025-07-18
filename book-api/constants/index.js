const { deepFreeze } = require('#utils');

module.exports = deepFreeze({
  UPLOAD_MODE: {
    SINGLE: 'single',
    ARRAY: 'array',
    FIELDS: 'fields',
  },
  HTTP_CODE: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    UNAUTHORIZED: 401,
    NOT_PERMISSION: 403,
    METHOD_NOT_ALLOWED: 405,
    SERVER_ERROR: 500,
  },
  METHOD: {
    POST: 'POST',
    GET: 'GET',
    PUT: 'PUT',
    DELETE: 'DELETE',
    OPTIONS: 'OPTIONS',
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
    SUPER_ADMIN: 'Super Admin',
  },
  REGEX: {
    PASSWORD: /[A-Za-z0-9@$#%!^&*()]{8}/,
  },
  PRISMA_ERROR_CODE: {
    RECORD_NOT_FOUND: 'P2025',
    UNIQUE_DUPLICATE: 'P2002',
    UNAUTHORIZED: 'P2025',
    FOREIGN_KEY_CONFLICT: 'P2003',
  },
  REDIS_PREFIX: 'book-app:',
});
