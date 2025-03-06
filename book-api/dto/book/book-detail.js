const { Type, Exclude } = require('class-transformer');
const BookDTO = require('./book.js');

class Introduce {
  @Type(() => String)
  html;

  @Type(() => String)
  json;
}

class Image {
  @Type(() => String)
  html;

  @Type(() => String)
  json;
}

class BookDetailDTO extends BookDTO {
  @Type(() => String)
  avatar;

  @Type(() => String)
  name;

  @Type(() => String)
  pdf;

  @Exclude()
  category_id;

  @Exclude()
  published_day;

  @Exclude()
  published_time;

  @Exclude()
  book_author;

  @Type(() => Number)
  get publishedTime() {
    return this.published_time;
  }

  @Type(() => Number)
  get publishedDay() {
    return parseInt(this.published_day);
  }

  @Type(() => String)
  get categoryId() {
    return this.category_id;
  }

  @Type(() => Introduce)
  get introduce() {
    if (this.introduce_file) {
      const [html, json] = this.introduce_file?.split(',');
      return {
        html,
        json
      };
    }
    return {
      html: '',
      json: ''
    };
  };

  @Type(() => [Image])
  get images() {
    return this.book_image;
  };

  @Type(() => [String])
  get authors() {
    return this.book_author.map((author) => author.author_id);
  }
}

module.exports = BookDetailDTO;
