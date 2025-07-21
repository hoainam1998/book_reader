const { GraphQLString, GraphQLObjectType } = require('graphql');
const { HTTP_CODE } = require('#constants');

/**
 * Create graphql error option.
 *
 * @param {('BAD_REQUEST' | 'NOT_FOUND' | 'UNAUTHORIZED' | 'NOT_PERMISSION')} code - The file object.
 * @return {{
 * extensions: {
 *  code: 'BAD_REQUEST' | 'NOT_FOUND' | 'UNAUTHORIZED' | 'NOT_PERMISSION',
 *  http: {
 *    status: number
 *  }
 * }}} The extension name.
 */
const createGraphqlError = (code) => {
  return Object.defineProperties(
    {
      extensions: {
        code,
        http: {
          status: HTTP_CODE[code],
        },
      },
    },
    {
      error_code: {
        set(value) {
          this.extensions.http.error_code = value;
        },
      },
      response: {
        set(value) {
          this.extensions.response = value;
        },
      },
    }
  );
};

const graphqlErrorOption = createGraphqlError('BAD_REQUEST');

const graphqlNotFoundErrorOption = createGraphqlError('NOT_FOUND');

const graphqlUnauthorizedErrorOption = createGraphqlError('UNAUTHORIZED');

const graphqlNotPermissionErrorOption = createGraphqlError('NOT_PERMISSION');

const ResponseType = new GraphQLObjectType({
  name: 'Response',
  fields: {
    message: {
      type: GraphQLString,
    },
  },
});

module.exports = {
  ResponseType,
  graphqlNotFoundErrorOption,
  graphqlErrorOption,
  graphqlUnauthorizedErrorOption,
  graphqlNotPermissionErrorOption,
};
