const { Type, Expose } = require('class-transformer');
const GraphqlResponse = require('#dto/common/graphql-response.js');
const MessageResponse = require('#dto/common/message-response.js');
const { getGraphqlFinalData } = require('#utils');

class MessageSerializerResponse extends GraphqlResponse {
  @Expose({ toClassOnly: true })
  @Type(() => MessageResponse)
  get response() {
    return getGraphqlFinalData(this.data);
  }
}

module.exports = MessageSerializerResponse;
