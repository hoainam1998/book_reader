const { GraphQLInputObjectType, GraphQLString, GraphQLObjectType, GraphQLError } = require('graphql');
const { graphqlErrorOption, ResponseType } = require('../common-schema.js');

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

const mutation = new GraphQLObjectType({
  name: 'BookMutation',
  fields: {
    saveIntroduce: {
      type: ResponseType,
      args: {
        introduce: {
          type: BookIntroduceInputType
        }
      },
      resolve: async (book, args) => {
        const { name, html } = args.introduce;
        try {
          const isSaved = await book.saveIntroduceHtmlFile(name, html);
          if (isSaved) {
            return { message: 'Html file created!' };
          }
        } catch (err) {
          throw new GraphQLError(err.message, graphqlErrorOption);
        }
      }
    }
  }
});

const query = new GraphQLObjectType({
  name: 'BookQuery',
  fields: {
    all: {
      type: GraphQLString,
      resolve: () => {}
    }
  }
});

export {
  mutation,
  query
};
