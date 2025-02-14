const { Type } = require('class-transformer');

class OtpUpdate {
  @Type(() => String)
  userId;

  @Type(() => String)
  otp;
};

module.exports = OtpUpdate;