const { Type } = require('class-transformer');

class EmailDTO {
  @Type(() => String)
  email;
}

module.exports = EmailDTO;
