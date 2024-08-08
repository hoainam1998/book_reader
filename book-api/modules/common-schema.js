const {
  GraphQLString,
  GraphQLObjectType
} = require('graphql');

export const graphqlErrorOption = {
  extensions: {
    code: 'BAD_REQUEST',
    http: {
      status: 400,
    },
  }
};

export const ResponseType = new GraphQLObjectType({
  name: 'Response',
  fields: {
    message: {
      type: GraphQLString
    }
  }
});
