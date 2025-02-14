const { Type, Exclude } = require('class-transformer');

class CategoriesDTO {
  @Type(() => String)
  name;

  @Type(() => String)
  avatar;

  @Exclude()
  @Type(() => Number)
  count;

  @Type(() => Boolean)
  get disabled() {
    return this._count.book > 0;
  }

  @Type(() => String)
  get categoryId() {
    return this.category_id;
  }
}

class CategoryDTO {
  @Type(() => String)
  get categoryId() {
    return this.category_id;
  }

  @Type(() => String)
  name;

  @Type(() => String)
  avatar;
}

module.exports = {
  CategoriesDTO,
  CategoryDTO
};
