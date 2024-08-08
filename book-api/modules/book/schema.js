const { GraphQLInputObjectType, GraphQLString, GraphQLObjectType } = require('graphql');
const { graphqlErrorOption } = require('../common-schema.js');

const BookIntroduceInputType = new GraphQLInputObjectType({
  name: 'BookIntroduceInput',
  fields: {
    name: {
      type: GraphQLString
    },
    html: {
      type: GraphQLString
    }
  },
});

const BookIntroduceResponseType = new GraphQLObjectType({
  name: 'BookIntroduceResponseType',
  fields: {
    html: {
      type: GraphQLString
    },
    fileName: {
      type: GraphQLString
    }
  },
});

const mutation = new GraphQLObjectType({
  name: 'BookMutation',
  fields: {
    saveIntroduce: {
      type: BookIntroduceResponseType,
      args: {
        type: BookIntroduceInputType
      },
      resolve: (book, args) => {
        try {
          book.saveIntroduceHtmlFile(args);
          return {
            message: 'Html file created!'
          };
        } catch (err) {
          throw new GraphQLError(err.message, graphqlErrorOption);
        }
      }
    }
  }
});

const query = new GraphQLObjectType({
  name: 'BookCategory',
  fields: {}
});

export {
  mutation,
  query
};
