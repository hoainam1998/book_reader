const { Type } = require('class-transformer');

class MessageResponse {
  @Type(() => String)
  message;
};

module.exports = MessageResponse;
