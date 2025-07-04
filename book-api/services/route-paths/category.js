const RoutePath = require('./route-paths');
const { PATH } = require('#constants');

const createRoutePath = RoutePath.Base({ baseUrl: PATH.CATEGORY });

/**
 * Storage category route path.
 * @class
 */
class CategoryRoutePath {
  /**
  * Relative: /detail *Absolute: category/detail
  */
  static detail = createRoutePath({ url: 'detail' }, [process.env.ORIGIN_CORS]);

  /**
  * Relative: /update *Absolute: category/update
  */
  static update = createRoutePath({ url: 'update' }, [process.env.ORIGIN_CORS]);

  /**
  * Relative: /create *Absolute: category/create
  */
  static create = createRoutePath({ url: 'create' }, [process.env.ORIGIN_CORS]);

  /**
  * Relative: /create/:id *Absolute: category/create/:id
  */
  static delete = createRoutePath({ url: 'delete', subUrl: ':id' }, [process.env.ORIGIN_CORS]);

  /**
  * Relative: /pagination *Absolute: category/pagination
  */
  static pagination = createRoutePath({ url: 'pagination' }, [process.env.ORIGIN_CORS]);

  /**
  * Relative: /all *Absolute: category/all
  */
  static all = createRoutePath({ url: 'all' }, [process.env.ORIGIN_CORS]);

  /**
  * Relative: /menu *Absolute: category/menu
  */
  static menu = createRoutePath({ url: 'menu' }, [process.env.ORIGIN_CORS]);
}

module.exports = CategoryRoutePath;
