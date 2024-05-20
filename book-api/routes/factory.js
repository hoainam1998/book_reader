const CategoryRouter = require('./modules//category.js');

class RouterFactory {
  static getRoutes(express, schema) {
    return [
      new CategoryRouter(express, schema),
    ];
  }
}

module.exports = RouterFactory;
