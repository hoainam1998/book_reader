const { Type } = require('class-transformer');
const OutputValidate = require('#services/output-validate');

class CategoryDTO extends OutputValidate {
  @Type(() => Number)
  category_id;

  @Type(() => String)
  name;

  @Type(() => String)
  avatar;

  @Type(() => Number)
  count;

  @Type(() => String)
  get categoryId() {
    return this.category_id;
  }

  @Type(() => Boolean)
  get disabled() {
    if (this._count) {
      return this._count.book > 0;
    }
    return false;
  }
}

module.exports = CategoryDTO;
