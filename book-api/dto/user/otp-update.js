const { Type } = require('class-transformer');
const OutputValidate = require('#services/output-validate');

class OtpUpdate extends OutputValidate {
  @Type(() => String)
  message;

  @Type(() => String)
  otp;
};

module.exports = OtpUpdate;
