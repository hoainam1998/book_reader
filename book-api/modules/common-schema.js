const {
  GraphQLString,
  GraphQLObjectType
} = require('graphql');
const { HTTP_CODE } = require('#constants');

/**
 * Create graphql error option.
 *
 * @param {('BAD_REQUEST' | 'NOT_FOUND' | 'UNAUTHORIZED')} code - The file object.
 * @return {{
 * extensions: {
 *  code: 'BAD_REQUEST' | 'NOT_FOUND' | 'UNAUTHORIZED',
 *  http: {
 *    status: number
 *  }
 * }}} The extension name.
 */
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

const graphqlErrorOption = createGraphqlError('BAD_REQUEST');

const graphqlNotFoundErrorOption = createGraphqlError('NOT_FOUND');

const graphqlUnauthorizedErrorOption = createGraphqlError('UNAUTHORIZED');

const ResponseType = new GraphQLObjectType({
  name: 'Response',
  fields: {
    message: {
      type: GraphQLString
    }
  }
});

module.exports = {
  ResponseType,
  graphqlNotFoundErrorOption,
  graphqlErrorOption,
  graphqlUnauthorizedErrorOption,
};
