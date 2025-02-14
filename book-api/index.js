const { config } = require('dotenv');
require('reflect-metadata');
config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const { GraphQLObjectType, GraphQLSchema } = require('graphql');
const startCategory = require('./modules/category/index.js');
const startBook = require('./modules/book/index.js');
const startUser = require('./modules/user/index.js');
const startAuthor = require('./modules/author/index.js');
const FactoryRouter = require('./routes/factory.js');
const validateUrl = require('#middlewares/validate-url.js');
const unknownError = require('#middlewares/unknown-error.js');
const Logger = require('#services/logger.js');

const corsOptions = {
  origin: process.env.ORIGIN_CORS,
  methods: ['GET', 'PUT', 'POST', 'DELETE']
};

const layers = [];

const app = express();
const PORT = process.env.PORT;
app.use(cors(corsOptions));
app.use(express.static('public'));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(unknownError);
app.use((req, res, next, layers) => validateUrl(req, res, next, layers));

try {
  const prismaClient = new PrismaClient();
  const category = startCategory(prismaClient);
  const book = startBook(prismaClient);
  const user = startUser(prismaClient);
  const author = startAuthor(prismaClient);

  const query = new GraphQLObjectType({
    name: 'Query',
    fields: {
      category: category.query,
      book: book.query,
      user: user.query,
      author: author.query
    }
  });

  const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      category: category.mutation,
      book: book.mutation,
      user: user.mutation,
      author: author.mutation
    },
  });
  FactoryRouter.getRoutes(express, new GraphQLSchema({ query, mutation })).forEach(({ route, path }) => app.use(path, route.Router));
} catch (err) {
  Logger.error('Book api building schema', err.message);
  FactoryRouter.getRoutes(express).forEach(({ route, path }) => app.use(path, route.Router))
} finally {
  app._router.stack.forEach(parentLayer => {
    (parentLayer.handle.stack || []).forEach(childLayer => {
      if (parentLayer.name === 'router' && childLayer.route && !childLayer.route.methods._all) {
        layers.push({ route: parentLayer.regexp, endpoint: childLayer.regexp, methods: childLayer.route.methods });
      }
    });
  });
}

app.listen(PORT, () => Logger.log('Book api bootstrap', `Your application started at ${PORT}!`));
