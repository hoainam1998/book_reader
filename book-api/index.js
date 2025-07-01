const { config } = require('dotenv');
require('reflect-metadata');
require('./global/index');
config({ path: '.env' });
const express = require('express');
const session = require('express-session');
const { RedisStore } = require('connect-redis');
const cors = require('cors');
const bodyParser = require('body-parser');
const { GraphQLObjectType, GraphQLSchema } = require('graphql');
const startCategory = require('./modules/category');
const startBook = require('./modules/book');
const startUser = require('./modules/user');
const startAuthor = require('./modules/author');
const startClient = require('./modules/client');
const FactoryRouter = require('./routes/factory');
const { REDIS_PREFIX } = require('#constants');
const validateUrl = require('#middlewares/validate-url');
const unknownError = require('#middlewares/unknown-error');
const signedTestCookie = require('#middlewares/test/signed-test-cookie');
const destroySession = require('#middlewares/test/destroy-session');
const clearAllSession = require('#middlewares/test/clear-all-session');
const corsOptionsDelegate = require('#middlewares/cors');
const PrismaClient = require('#services/prisma-client');
const Logger = require('#services/logger');
const RedisClient = require('#services/redis');


const PORT = process.env.NODE_ENV === 'test' ? process.env.TEST_PORT : process.env.PORT;
const layers = [];

const app = express();
app.use(session({
  store: new RedisStore({
    client: RedisClient,
    prefix: REDIS_PREFIX,
  }),
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESSION_ID_TOKEN,
  cookie: { maxAge: +process.env.SESSION_EXPIRES }
}));
app.use(cors(corsOptionsDelegate));
app.use(express.static('public'));
app.use(bodyParser.json({ limit: '5mb' }));
if (process.env.NODE_ENV === 'test') {
  app.post('/signed-test-cookie', signedTestCookie);
  app.get('/destroy-session', destroySession);
  app.get('/clear-all-session', clearAllSession);
}
app.use(unknownError);
app.use((req, res, next) => validateUrl(req, res, next, layers));

try {
  const category = startCategory(PrismaClient);
  const book = startBook(PrismaClient);
  const user = startUser(PrismaClient);
  const author = startAuthor(PrismaClient);
  const client = startClient(PrismaClient);

  const query = new GraphQLObjectType({
    name: 'Query',
    fields: {
      category: category.query,
      book: book.query,
      user: user.query,
      author: author.query,
      client: client.query,
    }
  });

  const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      category: category.mutation,
      book: book.mutation,
      user: user.mutation,
      author: author.mutation,
      client: client.mutation,
    }
  });

  FactoryRouter.RedisClient = RedisClient;
  FactoryRouter.PrismaClient = PrismaClient;
  FactoryRouter.getRoutes(express, new GraphQLSchema({ query, mutation })).forEach(({ route, path }) => app.use(path, route.Router));
} catch (err) {
  Logger.error('Book api building schema', err.message);
  FactoryRouter.getRoutes(express).forEach(({ route, path }) => app.use(path, route.Router));
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

module.exports = app;
