const { Type, Exclude } = require('class-transformer');
const OutputValidate = require('#services/output-validate');
const { signClientLoginToken } = require('#utils');

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
    return this.favorite_books;
  }

  @Type(() => [Object])
  get readLate() {
    return this.read_late;
  }

  @Type(() => [Object])
  get usedRead() {
    return this.used_read;
  }
}

module.exports = ClientDTO;
