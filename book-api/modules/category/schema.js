const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLID,
  GraphQLError,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLNonNull
} = require('graphql');
const { plainToInstance } = require('class-transformer');
const { graphqlErrorOption, graphqlNotFoundErrorOption, ResponseType } = require('../common-schema');
const { messageCreator } = require('#utils');
const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');
const { CategoriesDTO, CategoryDTO } = require('#dto/category/category.js');

const CategoryType = new GraphQLObjectType({
  name: 'Category',
  fields: {
    categoryId: {
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
        const categories = await category.all();
        if (categories.length === 0) {
          graphqlNotFoundErrorOption.extensions = { ...graphqlNotFoundErrorOption.extensions, response: [] };
          throw new GraphQLError('Categories not found!', graphqlNotFoundErrorOption );
        }
        return plainToInstance(CategoryDTO, categories, { excludePrefixes: ['avatar'] });
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
          type: new GraphQLNonNull(GraphQLInt)
        },
        pageSize: {
          type: new GraphQLNonNull(GraphQLInt)
        }
      },
      resolve: async (category, { pageNumber, pageSize }) => {
          const result = await category.pagination(pageSize, pageNumber);
          const response = {
            list: plainToInstance(CategoriesDTO, result[0]),
            total: parseInt(result[1] || 0)
          };
          const categories = result[0];
          if (categories.length === 0) {
            graphqlNotFoundErrorOption.extensions = { ...graphqlNotFoundErrorOption.extensions, response };
            throw new GraphQLError('Categories not found!', graphqlNotFoundErrorOption);
          }
          return response;
      }
    },
    detail: {
      type: CategoryType,
      args: {
        categoryId: {
          type: new GraphQLNonNull(GraphQLID),
        }
      },
      resolve: async (category, { categoryId }, context) => await category.detail(categoryId, context)
    },
    delete: {
      type: ResponseType,
      args: {
        categoryId: {
          type: new GraphQLNonNull(GraphQLID)
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
          throw err;
        }
      }
    }
  }
});

module.exports = {
  query,
  mutation
};
