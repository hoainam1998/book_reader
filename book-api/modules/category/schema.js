const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLID,
  GraphQLError,
  GraphQLInt,
  GraphQLBoolean
} = require('graphql');
const { graphqlErrorOption, graphqlNotFoundErrorOption, ResponseType } = require('../common-schema');
const { messageCreator } = require('#utils');
const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');

const CategoryType = new GraphQLObjectType({
  name: 'Category',
  fields: {
    category_id: {
      type: GraphQLID
    },
    name: {
      type: GraphQLString
    },
    avatar: {
      type: GraphQLString
    },
    disabled: {
      type: GraphQLBoolean
    }
  }
});

const CategoryInputType = new GraphQLInputObjectType({
  name: 'CategoryInput',
  fields: {
    categoryId: {
      type: GraphQLID
    },
    name: {
      type: GraphQLString
    },
    avatar: {
      type: GraphQLString
    }
  },
});

const categoryMutationDeclare = {
  type: ResponseType,
  args: {
    category: {
      type: CategoryInputType
    }
  }
};

const mutation = new GraphQLObjectType({
  name: 'CategoryMutation',
  fields: {
    create: {
      ...categoryMutationDeclare,
      resolve: async (category, args) => {
        try {
          await category.create(args.category);
          return messageCreator('Create category success!');
        } catch (err) {
          if (err instanceof PrismaClientKnownRequestError) {
            throw new GraphQLError(err.meta.cause, graphqlErrorOption);
          }
          throw new GraphQLError(err.message, graphqlErrorOption);
        }
      }
    },
    update: {
      ...categoryMutationDeclare,
      resolve: async (category, args) => {
        try {
          await category.update(args.category);
          return messageCreator('Update category success!');
        } catch (err) {
          if (err instanceof PrismaClientKnownRequestError) {
            throw new GraphQLError(err.meta.cause, graphqlErrorOption);
          }
          throw new GraphQLError(err.message, graphqlErrorOption);
        }
      }
    }
  }
});

const query = new GraphQLObjectType({
  name: 'CategoryQuery',
  fields: {
    all: {
      type: new GraphQLList(CategoryType),
      resolve: async (category) => {
        try {
          return await category.all();
        } catch (err) {
          throw new GraphQLError(err.message, graphqlErrorOption);
        }
      },
    },
    pagination: {
      type: new GraphQLObjectType({
        name: 'CategoryPagination',
        fields: {
          list: {
            type: new GraphQLList(CategoryType)
          },
          total: {
            type: GraphQLInt
          }
        }
      }),
      args: {
        pageNumber: {
          type: GraphQLInt
        },
        pageSize: {
          type: GraphQLInt
        }
      },
      resolve: async (category, { pageNumber, pageSize }) => {
        try {
          const result = await category.pagination(pageSize, pageNumber);
          const categories = result[0];
          if (categories.length === 0) {
            const response = {
              list: [],
              total: 0
            };
            graphqlNotFoundErrorOption.extensions = { ...graphqlNotFoundErrorOption.extensions, response };
            throw new GraphQLError('Categories not found!', graphqlNotFoundErrorOption);
          }
          return {
            list: categories,
            total: parseInt(result[1][0].total || 0)
          };
        } catch (err) {
          if (err instanceof GraphQLError) {
            throw err;
          }
          throw new GraphQLError(err.message, graphqlErrorOption);
        }
      }
    },
    detail: {
      type: CategoryType,
      args: {
        categoryId: {
          type: GraphQLID
        }
      },
      resolve: async (category, { categoryId }) => {
        try {
          return await category.detail(categoryId);
        } catch (err) {
          throw new GraphQLError(err.message, graphqlErrorOption);
        }
      }
    },
    delete: {
      type: ResponseType,
      args: {
        categoryId: {
          type: GraphQLID
        }
      },
      resolve: async (category, { categoryId }) => {
        try {
          await category.delete(categoryId);
          return messageCreator('Delete category success!');
        } catch (err) {
          if (err instanceof PrismaClientKnownRequestError) {
            throw new GraphQLError(err.meta.cause, graphqlErrorOption);
          }
          throw new GraphQLError(err.message, graphqlErrorOption);
        }
      }
    }
  }
});

module.exports = {
  query,
  mutation
};
