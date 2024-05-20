"use strict";

const {
  config
} = require('dotenv');
config();
const express = require('express');
const bodyParser = require('body-parser');
const {
  GraphQLObjectType,
  GraphQLSchema,
} = require('graphql');
const startCategory = require('./modules/category/index.js');
const connectDataBase = require('./config.js');
const CategoryRouter = require('./routes/category.js');
const app = express();
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
  const schema = new GraphQLSchema({
    query,
    mutation
  });

  const categoryRouter = new CategoryRouter(express);
  app.use('/category', categoryRouter.Router);
});
app.listen(PORT, () => console.log(`GraphQl started at ${PORT}`));