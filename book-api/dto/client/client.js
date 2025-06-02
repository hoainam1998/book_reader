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

  @Type(() => Boolean)
  get passwordMustChange() {
    return !!this.reset_password_token;
  }
}

module.exports = ClientDTO;
