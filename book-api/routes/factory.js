const CategoryRouter = require('./modules/category.js');
const BookRouter = require('./modules/book.js');

class RouterFactory {
  static getRoutes(express, schema) {
    return [
      {
        path: '/category',
        route: new CategoryRouter(express, schema)
      },
      {
        path: '/book',
        route: new BookRouter(express, schema)
      }
    ];
  }
}

module.exports = RouterFactory;
