const Service = require('#services/prisma');
const { GraphQLError } = require('graphql');
const { checkArrayHaveValues, calcPages } = require('#utils');
const { graphqlNotFoundErrorOption } = require('../common-schema');
const { CATEGORY } = require('#messages');
const { REDIS_KEYS } = require('#constants');

class CategoryService extends Service {
  create(category) {
    return this.PrismaInstance.category.create({
      data: {
        category_id: Date.now().toString(),
        name: category.name,
        avatar: category.avatar,
      },
    }).then(async (result) => {
      await this.RedisClient.Client.del(REDIS_KEYS.CATEGORIES);
      return result;
    });
  }

  async all(used, select) {
    const condition = used
      ? {
          where: {
            book: {
              some: {},
            },
          },
        }
      : {};

    if (!used) {
      const cachingCategories = await this.RedisClient.Client.lRange(REDIS_KEYS.CATEGORIES, 0, -1);
      if (cachingCategories.length) {
        return cachingCategories.map((category) => JSON.parse(category));
      }
    }

    return this.PrismaInstance.category.findMany({
      ...condition,
      select,
    }).then(async(categories) => {
      if (!checkArrayHaveValues(categories)) {
        graphqlNotFoundErrorOption.response = [];
        throw new GraphQLError(CATEGORY.CATEGORIES_EMPTY, graphqlNotFoundErrorOption);
      }

      if (!used) {
        const jsonCategories = categories.map((category) => JSON.stringify(category));
        await this.RedisClient.Client.rPush(REDIS_KEYS.CATEGORIES, jsonCategories);
      }

      return categories;
    });
  }

  pagination(pageSize, pageNumber) {
    const offset = (pageNumber - 1) * pageSize;
    return this.PrismaInstance.$transaction([
      this.PrismaInstance.category.findMany({
        take: pageSize,
        skip: offset,
        orderBy: {
          category_id: 'desc',
        },
        include: {
          _count: {
            select: { book: true },
          },
        },
      }),
      this.PrismaInstance.category.count(),
    ]).then((results) => {
      const categories = results[0];
      const total = results[1];
      const pages = calcPages(pageSize, total);

      if (!checkArrayHaveValues(categories)) {
        graphqlNotFoundErrorOption.response = {
          list: [],
          total: 0,
          page: pageNumber,
          pages,
          pageSize,
        };
        throw new GraphQLError(CATEGORY.CATEGORIES_EMPTY, graphqlNotFoundErrorOption);
      }
      results.push(pages);
      return results;
    });
  }

  detail(id, select) {
    return this.PrismaInstance.category.findUniqueOrThrow({
      where: {
        category_id: id,
      },
      select,
    });
  }

  update(category) {
    return this.PrismaInstance.category.update({
      data: {
        avatar: category.avatar,
        name: category.name,
      },
      where: {
        category_id: category.categoryId,
      },
    }).then(async (result) => {
      await this.RedisClient.Client.del(REDIS_KEYS.CATEGORIES);
      return result;
    });
  }

  delete(id) {
    return this.PrismaInstance.category.delete({
      where: {
        category_id: id,
      },
    }).then(async (result) => {
      await this.RedisClient.Client.del(REDIS_KEYS.CATEGORIES);
      return result;
    });
  }
}

module.exports = CategoryService;
