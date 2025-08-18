const { Type, Expose } = require('class-transformer');
const GraphqlResponse = require('#dto/common/graphql-response');
const MessageResponse = require('#dto/common/message-response');
const { zodValidateClassWrapper } = require('#decorators');
const { getGraphqlFinalData } = require('#utils');

class MessageSerializerResponse extends GraphqlResponse {
  @Expose({ toClassOnly: true })
  @Type(() => MessageResponse)
  get response() {
    if (this.data) {
      return getGraphqlFinalData(this.data);
    } else if (this.message) {
      return { message: this.message };
    } else {
      return this;
    }
  }
}

module.exports = zodValidateClassWrapper(MessageSerializerResponse, MessageResponse);
