const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLID,
  GraphQLError,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLNonNull,
} = require('graphql');
const { plainToInstance } = require('class-transformer');
const { graphqlNotFoundErrorOption, ResponseType } = require('../common-schema');
const { messageCreator, convertDtoToZodObject, checkArrayHaveValues } = require('#utils');
const handleResolveResult = require('#utils/handle-resolve-result');
const { CategoriesDTO, CategoryDTO } = require('#dto/category/category');
const PaginationResponse = require('#dto/common/pagination-response');
const { CATEGORY } = require('#messages');

const CATEGORY_TYPE = new GraphQLObjectType({
  name: 'Category',
  fields: {
    categoryId: {
      type: GraphQLID,
    },
    name: {
      type: GraphQLString,
    },
    avatar: {
      type: GraphQLString,
    },
    disabled: {
      type: GraphQLBoolean,
    },
  },
});

const CATEGORY_INPUT_TYPE = new GraphQLInputObjectType({
  name: 'CategoryInput',
  fields: {
    categoryId: {
      type: GraphQLID,
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
    },
    avatar: {
      type: new GraphQLNonNull(GraphQLString),
    },
  },
});

const CATEGORY_MUTATION_DECLARE = {
  type: ResponseType,
  args: {
    category: {
      type: new GraphQLNonNull(CATEGORY_INPUT_TYPE),
    },
  },
};

const mutation = new GraphQLObjectType({
  name: 'CategoryMutation',
  fields: {
    create: {
      ...CATEGORY_MUTATION_DECLARE,
      resolve: async (service, { category }) => {
        await service.create(category);
        return messageCreator(CATEGORY.CREATE_CATEGORY_SUCCESS);
      },
    },
    update: {
      ...CATEGORY_MUTATION_DECLARE,
      resolve: async (service, { category }) => {
        return handleResolveResult(
          async () => {
            await service.update(category);
            return messageCreator(CATEGORY.UPDATE_CATEGORY_SUCCESS);
          },
          {
            RECORD_NOT_FOUND: CATEGORY.CATEGORY_NOT_FOUND,
          }
        );
      },
    },
  },
});

const query = new GraphQLObjectType({
  name: 'CategoryQuery',
  fields: {
    all: {
      type: new GraphQLList(CATEGORY_TYPE),
      args: {
        haveValue: {
          type: new GraphQLNonNull(GraphQLBoolean),
        },
      },
      resolve: async (category, { haveValue }, context) => {
        const categories = await category.all(haveValue, context);
        if (!checkArrayHaveValues(categories)) {
          graphqlNotFoundErrorOption.extensions = { ...graphqlNotFoundErrorOption.extensions, response: [] };
          throw new GraphQLError(CATEGORY.CATEGORIES_EMPTY, graphqlNotFoundErrorOption);
        }
        return convertDtoToZodObject(CategoryDTO, categories);
      },
    },
    pagination: {
      type: new GraphQLObjectType({
        name: 'CategoryPagination',
        fields: {
          list: {
            type: new GraphQLNonNull(new GraphQLList(CATEGORY_TYPE)),
          },
          total: {
            type: new GraphQLNonNull(GraphQLInt),
          },
          pageSize: {
            type: new GraphQLNonNull(GraphQLInt),
          },
          page: {
            type: new GraphQLNonNull(GraphQLInt),
          },
          pages: {
            type: new GraphQLNonNull(GraphQLInt),
          },
        },
      }),
      args: {
        pageNumber: {
          type: new GraphQLNonNull(GraphQLInt),
        },
        pageSize: {
          type: new GraphQLNonNull(GraphQLInt),
        },
      },
      resolve: async (service, { pageNumber, pageSize }) => {
        const [categories, total, pages] = await service.pagination(pageSize, pageNumber);
        const response = convertDtoToZodObject(PaginationResponse, {
          list: plainToInstance(CategoriesDTO, categories),
          total: parseInt(total || 0),
          page: pageNumber,
          pageSize,
          pages,
        });

        if (!checkArrayHaveValues(categories)) {
          graphqlNotFoundErrorOption.response = response;
          throw new GraphQLError(CATEGORY.CATEGORIES_EMPTY, graphqlNotFoundErrorOption);
        }
        return response;
      },
    },
    detail: {
      type: CATEGORY_TYPE,
      args: {
        categoryId: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      resolve: async (service, { categoryId }, context) => {
        return handleResolveResult(
          async () => {
            return convertDtoToZodObject(CategoryDTO, await service.detail(categoryId, context));
          },
          {
            RECORD_NOT_FOUND: CATEGORY.CATEGORY_NOT_FOUND,
          }
        );
      },
    },
    delete: {
      type: ResponseType,
      args: {
        categoryId: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      resolve: async (service, { categoryId }) => {
        return handleResolveResult(
          async () => {
            await service.delete(categoryId);
            return messageCreator(CATEGORY.DELETE_CATEGORY_SUCCESS);
          },
          {
            RECORD_NOT_FOUND: CATEGORY.CATEGORY_NOT_FOUND,
            FOREIGN_KEY_CONFLICT: CATEGORY.CATEGORY_USED,
          }
        );
      },
    },
  },
});

module.exports = {
  query,
  mutation,
};
