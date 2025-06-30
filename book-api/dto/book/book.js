const { Type, Exclude } = require('class-transformer');
const OutputValidate = require('#services/output-validate');

class BookDTO extends OutputValidate {
  @Exclude()
  book_id;

  @Exclude()
  published_day;

  @Exclude()
  published_time;

  @Exclude()
  category_id;

  @Type(() => String)
  avatar;

  @Type(() => Object)
  _category;

  set category(value) {
    this._category = {
      ...value,
      categoryId: value.category_id
    };
  }

  @Type(() => Object)
  get category() {
    return this._category;
  }

  @Exclude()
  introduce_file;

  @Type(() => String)
  get introduce() {
    return this.introduce_file?.split(',')[0] || '';
  };

  @Type(() => String)
  get bookId() {
    return this.book_id;
  }

  @Type(() => String)
  get publishedDay() {
    return this.published_day;
  }

  @Type(() => Number)
  get publishedTime() {
    return this.published_time;
  }

  @Type(() => String)
  get categoryId() {
    return this.category_id;
  }

  @Type(() => Array)
  get authors() {
    return this.book_author
      .map(({ author }) => ({ ...author, authorId: author.author_id }));
  }
};

module.exports = BookDTO;
