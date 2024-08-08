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
const { graphqlErrorOption, ResponseType } = require('../common-schema');

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
          const result = await category.create(args.category);
          if (result.affectedRows > 0) {
            return { message: 'Create category success!' };
          }
          return { message: 'Create category fail!' };
        } catch (err) {
          throw new GraphQLError(err.message, graphqlErrorOption);
        }
      }
    },
    update: {
      ...categoryMutationDeclare,
      resolve: async (category, args) => {
        try {
          const result = await category.update(args.category);
          if (result.affectedRows > 0) {
            return { message: 'Update category success!' };
          }
          return { message: 'Update category fail!' };
        } catch (err) {
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
      resolve: async (category, _) => {
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
          return {
            list: result[0],
            total: result[1][0].total
          };
        } catch (err) {
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
          const categoryFound = await category.detail(categoryId);
          return categoryFound[0];
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
          const result = await category.delete(categoryId);
          if (result.affectedRows > 0) {
            return { message: 'Delete category success!' };
          }
          return { message: 'Delete category fail!' };
        } catch (err) {
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
