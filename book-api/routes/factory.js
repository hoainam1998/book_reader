const CategoryRouter = require('./modules/category.js');
const BookRouter = require('./modules/book.js');
const { PATH } = require('../constants/index.js');

class RouterFactory {
  static getRoutes(express, schema = null) {
    return [
      {
        path: PATH.CATEGORY,
        route: new CategoryRouter(express, schema)
      },
      {
        path: PATH.BOOK,
        route: new BookRouter(express, schema)
      }
    ];
  }
}

module.exports = RouterFactory;
