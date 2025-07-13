const { Type } = require('class-transformer');
const OutputValidate = require('#services/output-validate');

class ForgetPassword extends OutputValidate {
  @Type(() => String)
  reset_password_token;

  @Type(() => String)
  password;

  get resetPasswordToken() {
    return this.reset_password_token;
  }
}

module.exports = ForgetPassword;
