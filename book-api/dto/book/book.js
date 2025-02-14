const { Type, Exclude } = require('class-transformer');

class BookDTO {
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

  @Type(() => String)
  category;

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

  @Type(() => Number)
  get publishedDay() {
    return parseInt(this.published_day);
  }

  @Type(() => Number)
  get publishedTime() {
    return this.published_time;
  }

  @Type(() => String)
  get categoryId() {
    return this.category_id;
  }

};

module.exports = BookDTO;
