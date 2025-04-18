const { Type, Exclude } = require('class-transformer');
const OutputValidate = require('#services/output-validate');

class UserDTO extends OutputValidate {
  @Type(() => String)
  user_id;

  @Exclude()
  @Type(() => String)
  first_name;

  @Exclude()
  @Type(() => String)
  last_name;

  @Type(() => String)
  avatar;

  @Type(() => Boolean)
  mfa_enable;

  @Type(() => String)
  login_token;

  @Type(() => String)
  email;

  @Type(() => String)
  reset_password_token;

  @Type(() => String)
  get resetPasswordToken() {
    return this.reset_password_token;
  }

  @Type(() => String)
  get name() {
    return `${this.first_name} ${this.last_name}`;
  }

  @Type(() => String)
  get userId() {
    return this.user_id;
  }

  @Type(() => Boolean)
  get mfaEnable() {
    return this.mfa_enable;
  }

  @Type(() => String)
  get firstName() {
    return this.first_name;
  }

  @Type(() => String)
  get lastName() {
    return this.last_name;
  }

  @Type(() => Boolean)
  get passwordMustChange() {
    return !!this.reset_password_token;
  }

  @Type(() => String)
  get apiKey() {
    let apiKey = null;
    if (!this.resetPasswordToken) {
      if (!this.mfaEnable) {
        apiKey = this.login_token;
      }
    }
    return apiKey;
  }
}

module.exports = UserDTO;
