const { Type, Expose } = require('class-transformer');
const GraphqlResponse = require('#dto/common/graphql-response');
const MessageResponse = require('#dto/common/message-response');
const { zodValidateClassWrapper } = require('#decorators');
const { getGraphqlFinalData } = require('#utils');

class MessageSerializerResponse extends GraphqlResponse {
  @Expose({ toClassOnly: true })
  @Type(() => MessageResponse)
  get response() {
    return this.data ? getGraphqlFinalData(this.data) : { message: this.message };
  }
}

module.exports = zodValidateClassWrapper(MessageSerializerResponse, MessageResponse);
