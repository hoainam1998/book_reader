const { Type } = require('class-transformer');

class OtpUpdate {
  @Type(() => String)
  message;

  @Type(() => String)
  otp;
};

module.exports = OtpUpdate;
