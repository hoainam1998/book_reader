const RoutePath = require('./route-paths');
const { PATH } = require('#constants');

const createRoutePath = RoutePath.Base({ baseUrl: PATH.AUTHOR });

/**
 * Storage author route path.
 * @class
 */
class AuthorRoutePath {
  /**
  * Relative: /detail *Absolute: author/detail
  */
  static detail = createRoutePath({ url: 'detail' }, [process.env.ORIGIN_CORS, process.env.CLIENT_ORIGIN_CORS]);

  /**
  * Relative: /create *Absolute: author/create
  */
  static create = createRoutePath({ url: 'create' }, [process.env.ORIGIN_CORS]);

  /**
  * Relative: /create *Absolute: author/create
  */
  static update = createRoutePath({ url: 'update' }, [process.env.ORIGIN_CORS]);

  /**
  * Relative: /pagination *Absolute: author/pagination
  */
  static pagination = createRoutePath({ url: 'pagination' }, [process.env.ORIGIN_CORS]);

  /**
  * Relative: /filter *Absolute: author/filter
  */
  static filter = createRoutePath({ url: 'filter' }, [process.env.ORIGIN_CORS]);

  /**
  * Relative: /menu *Absolute: author/menu
  */
  static menu = createRoutePath({ url: 'menu' }, [process.env.CLIENT_ORIGIN_CORS]);
}

module.exports = AuthorRoutePath;
