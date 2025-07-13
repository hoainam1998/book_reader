const Service = require('#services/prisma');
const { calcPages } = require('#utils');

class CategoryService extends Service {
  create(category) {
    return this.PrismaInstance.category.create({
      data: {
        category_id: Date.now().toString(),
        name: category.name,
        avatar: category.avatar,
      },
    });
  }

  all(hasRelation, select) {
    const condition = hasRelation
      ? {
          where: {
            book: {
              some: {},
            },
          },
        }
      : {};

    return this.PrismaInstance.category.findMany({
      ...condition,
      select,
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
      const total = results[1];
      const pages = calcPages(pageSize, total);
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
    });
  }

  delete(id) {
    return this.PrismaInstance.category.delete({
      where: {
        category_id: id,
      },
    });
  }
}

module.exports = CategoryService;
