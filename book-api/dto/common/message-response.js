const { Type } = require('class-transformer');
const ErrorCode = require('#services/error-code');
const OutputValidate = require('#services/output-validate');

class MessageResponse extends OutputValidate {
  @Type(() => String)
  message;

  @Type(() => String)
  errorCode = ErrorCode.ALL_FINE;
}

module.exports = MessageResponse;
