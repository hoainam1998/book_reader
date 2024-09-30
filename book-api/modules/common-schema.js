const {
  GraphQLString,
  GraphQLObjectType
} = require('graphql');
const { HTTP_CODE } = require('#constants');

export const graphqlErrorOption = {
  extensions: {
    code: 'BAD_REQUEST',
    http: {
      status: HTTP_CODE.BAD_REQUEST,
    }
  }
};

export const graphqlNotFoundErrorOption = {
  extensions: {
    code: 'NOT_FOUND',
    http: {
      status: HTTP_CODE.NOT_FOUND,
    }
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
