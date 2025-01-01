const Service = require('../service');

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
      this.PrismaInstance.$queryRaw`SELECT *, IF((SELECT COUNT(*) FROM book AS bo WHERE ca.category_id LIKE bo.category_id > 0), true, false) AS disabled
      FROM CATEGORY as ca ORDER BY CATEGORY_ID DESC LIMIT ${pageSize} OFFSET ${offset};`,
      this.PrismaInstance.$queryRaw`SELECT COUNT(*) AS total FROM CATEGORY;`
    ]);
  }

  detail(id) {
    return this.PrismaInstance.category.findFirst({
      where: {
        category_id: id
      },
    });
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
