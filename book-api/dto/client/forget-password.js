const { Type } = require('class-transformer');
const MessageResponse = require('#dto/common/message-response');

class ForgetPassword extends MessageResponse {
  @Type(() => String)
  reset_password_token;

  @Type(() => String)
  plain_password;

  @Type(() => String)
  get password() {
    return this.plain_password;
  }

  @Type(() => String)
  get resetPasswordToken() {
    return this.reset_password_token;
  }
}

module.exports = ForgetPassword;
