const CategoryRouter = require('./modules/category.js');

class RouterFactory {
  static getRoutes(express, schema) {
    return [
      {
        path: '/category',
        route: new CategoryRouter(express, schema)
      },
    ];
  }
}

module.exports = RouterFactory;
