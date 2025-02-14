const { Type } = require('class-transformer');

class OtpVerify {
  @Type(() => Boolean)
  verify;

  @Type(() => String)
  apiKey;
};

module.exports = OtpVerify;
