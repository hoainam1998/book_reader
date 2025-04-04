const { Type } = require('class-transformer');
const OutputValidate = require('#services/output-validate');

class UserCreated extends OutputValidate {
  @Type(() => Boolean)
  plain_password;

  @Type(() => String)
  reset_password_token;

  @Type(() => String)
  get password() {
    return this.plain_password;
  }

  @Type(() => String)
  get resetPasswordToken() {
    return this.reset_password_token;
  }
};

module.exports = UserCreated;
