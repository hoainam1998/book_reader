const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLID,
  GraphQLError
} = require('graphql');

const graphqlErrorOption = {
  extensions: {
    code: 'BAD_REQUEST',
    http: {
      status: 400,
    },
  }
};

const ResponseType = new GraphQLObjectType({
  name: 'Response',
  fields: {
    message: {
      type: GraphQLString
    }
  }
});

const CategoryType = new GraphQLObjectType({
  name: 'Category',
  fields: {
    category_id: {
      type: GraphQLID
    },
    name: {
      type: GraphQLString
    },
    name: {
      type: GraphQLString
    },
  }
});

const CategoryInputType = new GraphQLInputObjectType({
  name: 'CategoryInput',
  fields: {
    category_id: {
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
    detail: {
      type: CategoryType,
      args: {
        category_id: {
          type: GraphQLID
        }
      },
      resolve: async (category, { category_id }) => {
        try {
          const categoryFound = await category.detail(category_id);
          return categoryFound[0];
        } catch (err) {
          throw new GraphQLError(err.message, graphqlErrorOption);
        }
      }
    },
    delete: {
      type: ResponseType,
      args: {
        category_id: {
          type: GraphQLID
        }
      },
      resolve: async (category, { category_id }) => {
        try {
          const result = await category.delete(category_id);
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
