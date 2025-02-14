const {
  GraphQLString,
  GraphQLObjectType
} = require('graphql');
const { HTTP_CODE } = require('#constants');

const createGraphqlError = (code) => {
  return {
    extensions: {
      code,
      http: {
        status: HTTP_CODE[code],
      }
    }
  };
};

export const graphqlErrorOption = createGraphqlError('BAD_REQUEST');

export const graphqlNotFoundErrorOption = createGraphqlError('NOT_FOUND');

export const ResponseType = new GraphQLObjectType({
  name: 'Response',
  fields: {
    message: {
      type: GraphQLString
    }
  }
});
