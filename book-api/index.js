const { config } = require('dotenv');
config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { GraphQLObjectType, GraphQLSchema } = require('graphql');
const startCategory = require('./modules/category/index.js');
const connectDataBase = require('./config.js');
const FactoryRouter = require('./routes/factory.js');

const corsOptions = {
  origin: process.env.ORIGIN_CORS,
};

const app = express();
app.use(bodyParser.json());
const PORT = 5000;
app.use(cors(corsOptions));
app.use((err, req, res, next) => {
  res.status(500).send('Something broke!')
});

connectDataBase().then(querySql => {
  const category = startCategory(querySql);

  const query = new GraphQLObjectType({
    name: 'Query',
    fields: {
      category: category.query
    }
  });

  const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      category: category.mutation
    }
  });

  const schema = new GraphQLSchema({ query, mutation });
  FactoryRouter.getRoutes(express, schema).forEach(({ route, path }) => app.use(path, route.Router));
})
.catch(() => {
  FactoryRouter.getRoutes(express, null).forEach(({ route, path }) => app.use(path, route.Router));
});

app.listen(PORT, () => console.log(`GraphQl started at ${PORT}!`));
