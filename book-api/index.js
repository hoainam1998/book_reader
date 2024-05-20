const { config } = require('dotenv');
config();
const express = require('express');
const bodyParser = require('body-parser');
const { GraphQLObjectType, GraphQLSchema } = require('graphql');
const startCategory = require('./modules/category/index.js');
const connectDataBase = require('./config.js');
const FactoryRouter = require('./routes/factory.js');

const app = express();
app.use(bodyParser.json());
const PORT = 5000;

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
  FactoryRouter.getRoutes(express, schema).forEach(route => app.use('/category', route.Router));
});

app.listen(PORT, () => console.log(`GraphQl started at ${PORT}!`));
