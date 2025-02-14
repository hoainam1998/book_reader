const { Type } = require('class-transformer');

class PersonUpdate {
  @Type(() => String)
  message;

  @Type(() => Boolean)
  reLoginFlag;
};

module.exports = PersonUpdate;
