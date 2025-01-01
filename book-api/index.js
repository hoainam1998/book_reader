const { config } = require('dotenv');
config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { GraphQLObjectType, GraphQLSchema } = require('graphql');
const startCategory = require('./modules/category/index.js');
const startBook = require('./modules/book/index.js');
const startUser = require('./modules/user/index.js');
const startAuthor = require('./modules/author/index.js');
const { HTTP_CODE } = require('#constants');
const FactoryRouter = require('./routes/factory.js');
const { PrismaClient } = require('@prisma/client');

const corsOptions = {
  origin: process.env.ORIGIN_CORS,
};

const app = express();
const PORT = process.env.PORT;
app.use(cors(corsOptions));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use((err, req, res, next) => {
  res.status(HTTP_CODE.SERVER_ERROR).send('Something broke!')
});

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
    }
  });

  const schema = new GraphQLSchema({ query, mutation });
  FactoryRouter.getRoutes(express, schema).forEach(({ route, path }) => app.use(path, route.Router));
} catch {
  FactoryRouter.getRoutes(express).forEach(({ route, path }) => app.use(path, route.Router))
}

app.listen(PORT, () => console.log(`GraphQl started at ${PORT}!`));
