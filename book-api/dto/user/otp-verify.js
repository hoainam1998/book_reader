const { Type } = require('class-transformer');
const OutputValidate = require('#services/output-validate');
const { signLoginToken } = require('#utils');

class OtpVerify extends OutputValidate {
  @Type(() => String)
  user_id;

  @Type(() => String)
  email;

  @Type(() => Boolean)
  power;

  @Type(() => String)
  get apiKey() {
    return signLoginToken(this.user_id, this.email, this.power);
  }
};

module.exports = OtpVerify;
