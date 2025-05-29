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
const { graphqlNotFoundErrorOption, ResponseType } = require('../common-schema');
const { messageCreator, convertDtoToZodObject } = require('#utils');
const handleResolveResult = require('#utils/handle-resolve-result');
const { CategoriesDTO, CategoryDTO } = require('#dto/category/category');
const PaginationResponse = require('#dto/common/pagination-response');
const { CATEGORY } = require('#messages');

const CATEGORY_TYPE = new GraphQLObjectType({
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

const CATEGORY_INPUT_TYPE = new GraphQLInputObjectType({
  name: 'CategoryInput',
  fields: {
    categoryId: {
      type: GraphQLID
    },
    name: {
      type: new GraphQLNonNull(GraphQLString)
    },
    avatar: {
      type: new GraphQLNonNull(GraphQLString)
    }
  },
});

const CATEGORY_MUTATION_DECLARE = {
  type: ResponseType,
  args: {
    category: {
      type: new GraphQLNonNull(CATEGORY_INPUT_TYPE),
    }
  }
};

const mutation = new GraphQLObjectType({
  name: 'CategoryMutation',
  fields: {
    create: {
      ...CATEGORY_MUTATION_DECLARE,
      resolve: async (service, { category }) => {
        await service.create(category);
        return messageCreator(CATEGORY.CREATE_CATEGORY_SUCCESS);
      }
    },
    update: {
      ...CATEGORY_MUTATION_DECLARE,
      resolve: async (service, { category }) => {
        return handleResolveResult(async () => {
          await service.update(category);
          return messageCreator(CATEGORY.UPDATE_CATEGORY_SUCCESS);
        }, {
          RECORD_NOT_FOUND: CATEGORY.CATEGORY_NOT_FOUND,
        });
      }
    }
  }
});

const query = new GraphQLObjectType({
  name: 'CategoryQuery',
  fields: {
    all: {
      type: new GraphQLList(CATEGORY_TYPE),
      resolve: async (category, args, context) => {
        const categories = await category.all(context);
        if (categories.length === 0) {
          graphqlNotFoundErrorOption.extensions = { ...graphqlNotFoundErrorOption.extensions, response: [] };
          throw new GraphQLError('Categories not found!', graphqlNotFoundErrorOption );
        }
        return convertDtoToZodObject(CategoryDTO, categories);
      },
    },
    pagination: {
      type: new GraphQLObjectType({
        name: 'CategoryPagination',
        fields: {
          list: {
            type: new GraphQLNonNull(new GraphQLList(CATEGORY_TYPE))
          },
          total: {
            type: new GraphQLNonNull(GraphQLInt)
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
        const [categories, total] = await category.pagination(pageSize, pageNumber);
        const response = convertDtoToZodObject(PaginationResponse, {
          list: plainToInstance(CategoriesDTO, categories),
          total: parseInt(total || 0)
        });
        if (categories.length === 0) {
          graphqlNotFoundErrorOption.extensions = { ...graphqlNotFoundErrorOption.extensions, response };
          throw new GraphQLError('Categories not found!', graphqlNotFoundErrorOption);
        }
        return response;
      }
    },
    detail: {
      type: CATEGORY_TYPE,
      args: {
        categoryId: {
          type: new GraphQLNonNull(GraphQLID),
        }
      },
      resolve: async (service, { categoryId }, context) => {
        return handleResolveResult(async () => {
          return convertDtoToZodObject(CategoryDTO, await service.detail(categoryId, context));
        }, {
          RECORD_NOT_FOUND: CATEGORY.CATEGORY_NOT_FOUND,
        });
      }
    },
    delete: {
      type: ResponseType,
      args: {
        categoryId: {
          type: new GraphQLNonNull(GraphQLID)
        }
      },
      resolve: async (category, { categoryId }) => {
        return handleResolveResult(async () => {
          await category.delete(categoryId);
          return messageCreator('Delete category success!');
        }, {
          RECORD_NOT_FOUND: 'Category not found!'
        });
      }
    }
  }
});

module.exports = {
  query,
  mutation
};
