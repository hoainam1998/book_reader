const { Type, Exclude } = require('class-transformer');
const OutputValidate = require('#services/output-validate');
const { signClientLoginToken } = require('#utils');

/**
 * Convert the books to books dto.
 * @param {*[]} items - The books.
 * @returns {*[]} - The books after converted.
 */
const convertToRelateBook = (items) => {
  return items.map(({ book, added_at }) => ({
    bookId: book.book_id || null,
    avatar: book.avatar || null,
    name: book.name || null,
    createAt: added_at || null,
    authors: book.book_author
      ? book.book_author.map(({ author }) => ({ name: author.name, authorId: author.author_id }))
      : [],
  }));
};

class ClientDTO extends OutputValidate {
  @Exclude()
  @Type(() => String)
  reader_id;

  @Exclude()
  @Type(() => String)
  first_name;

  @Exclude()
  @Type(() => String)
  last_name;

  @Exclude()
  @Type(() => String)
  reset_password_token;

  @Type(() => String)
  email;

  @Type(() => String)
  avatar;

  @Type(() => [Object])
  favorite_books;

  @Type(() => [Object])
  read_late;

  @Type(() => [Object])
  used_read;

  @Type(() => String)
  get clientId() {
    return this.reader_id;
  }

  @Type(() => String)
  get firstName() {
    return this.first_name;
  }

  @Type(() => String)
  get lastName() {
    return this.last_name;
  }

  @Type(() => String)
  get name() {
    return `${this.first_name} ${this.last_name}`;
  }

  @Type(() => String)
  get apiKey() {
    if (this.passwordMustChange) {
      return null;
    }
    return signClientLoginToken(this.email);
  }

  @Type(() => String)
  get resetPasswordToken() {
    return this.reset_password_token;
  }

  @Type(() => Boolean)
  get passwordMustChange() {
    return !!this.reset_password_token;
  }

  @Type(() => [Object])
  get favoriteBooks() {
    return convertToRelateBook(this.favorite_books);
  }

  @Type(() => [Object])
  get readLate() {
    return convertToRelateBook(this.read_late);
  }

  @Type(() => [Object])
  get usedRead() {
    return convertToRelateBook(this.used_read);
  }
}

module.exports = ClientDTO;
