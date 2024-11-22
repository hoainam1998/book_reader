const CategoryRouter = require('./modules/category.js');
const BookRouter = require('./modules/book.js');
const UserRouter = require('./modules/user.js');
const AuthorRouter = require('./modules/author.js');
const { PATH } = require('#constants');

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
      },
      {
        path: PATH.USER,
        route: new UserRouter(express, schema)
      },
      {
        path: PATH.AUTHOR,
        route: new AuthorRouter(express, schema)
      }
    ];
  }
}

module.exports = RouterFactory;
