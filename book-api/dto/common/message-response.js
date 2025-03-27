const { Type } = require('class-transformer');
const OutputValidate = require('#services/output-validate');

class MessageResponse extends OutputValidate {
  @Type(() => String)
  message;
};

module.exports = MessageResponse;
