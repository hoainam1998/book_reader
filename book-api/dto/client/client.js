const { Type, Exclude } = require('class-transformer');
const OutputValidate = require('#services/output-validate');

class ClientDTO extends OutputValidate {
  @Exclude()
  @Type(() => String)
  first_name;

  @Exclude()
  @Type(() => String)
  last_name;

  @Exclude()
  @Type(() => String)
  login_token;

  @Type(() => String)
  avatar;

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
    return this.login_token;
  }
}

module.exports = ClientDTO;
