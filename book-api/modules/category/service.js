const Service = require('#services/prisma.js');

class CategoryService extends Service {

  create(category) {
    return this.PrismaInstance.category.create({
      data: {
        category_id: category.categoryId,
        name: category.name,
        avatar: category.avatar
      },
    });
  }

  all() {
    return this.PrismaInstance.category.findMany();
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
      this.PrismaInstance.category.count()
    ]);
  }

  detail(id, select) {
    return this.PrismaInstance.category.findFirst({
      where: {
        category_id: id
      },
      select
    })
    .then((category) => ({ ...category, categoryId: category.category_id }));
  }

  update(category) {
    const data = {
      name: category.name,
    };

    if (category.avatar) {
      data.avatar = category.avatar;
    }

    return this.PrismaInstance.category.update({
      data,
      where: {
        category_id: category.categoryId
      },
    });
  }

  delete(id) {
    return this.PrismaInstance.category.delete({
      where: {
        category_id: id
      },
    });
  }
}

module.exports = CategoryService;
