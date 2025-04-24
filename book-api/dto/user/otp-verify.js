const { Type } = require('class-transformer');
const OutputValidate = require('#services/output-validate');

class OtpVerify extends OutputValidate {
  @Type(() => String)
  apiKey;
};

module.exports = OtpVerify;
