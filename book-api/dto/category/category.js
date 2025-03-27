const { Type, Exclude } = require('class-transformer');
const OutputValidate = require('#services/output-validate');

class CategoriesDTO extends OutputValidate {
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

class CategoryDTO extends OutputValidate {
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
