const { graphqlExecuteWrapper, loggerWrapper } = require('#decorators');
const GraphqlExecute = require('#services/graphql-execute');
const UserPrismaField = require('#services/prisma-fields/user');
const CategoryPrismaField = require('#services/prisma-fields/category');
const BookPrismaField = require('#services/prisma-fields/book');
const AuthorPrismaField = require('#services/prisma-fields/author');
const ClientPrismaField = require('#services/prisma-fields/client');
const CategoryRouter = graphqlExecuteWrapper(loggerWrapper(require('./modules/category')));
const BookRouter = graphqlExecuteWrapper(loggerWrapper(require('./modules/book')));
const UserRouter = graphqlExecuteWrapper(loggerWrapper(require('./modules/user')));
const AuthorRouter = graphqlExecuteWrapper(loggerWrapper(require('./modules/author')));
const ClientRouter = graphqlExecuteWrapper(loggerWrapper(require('./modules/client')));
const { PATH } = require('#constants');

/**
* Organize all router instance.
* @class
*/
class RouterFactory {
  /**
  * Return all router instance.
  *
  * @static
  * @param {object} express - The express object.
  * @param {GraphQLSchema} schema - The graphql schema instance.
  */
  static getRoutes(express, schema) {
    return [
      {
        path: PATH.CATEGORY,
        route: new CategoryRouter(express, new GraphqlExecute(schema, CategoryPrismaField))
      },
      {
        path: PATH.BOOK,
        route: new BookRouter(express, new GraphqlExecute(schema, BookPrismaField))
      },
      {
        path: PATH.USER,
        route: new UserRouter(express, new GraphqlExecute(schema, UserPrismaField))
      },
      {
        path: PATH.AUTHOR,
        route: new AuthorRouter(express, new GraphqlExecute(schema, AuthorPrismaField))
      },
      {
        path: PATH.CLIENT,
        route: new ClientRouter(express, new GraphqlExecute(schema, ClientPrismaField))
      }
    ];
  }
}

module.exports = RouterFactory;
