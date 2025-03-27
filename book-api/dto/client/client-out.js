const { Expose, Type } = require('class-transformer');
const { getGraphqlFinalData } = require('#utils');
const GraphqlResponse = require('#dto/common/graphql-response');
const { zodValidateClassWrapper } = require('#decorators');
const ClientDTO = require('./client');

class ClientDetailResponse extends GraphqlResponse {
  @Expose({ toClassOnly: true })
  @Type(() => ClientDTO)
  get response() {
    return getGraphqlFinalData(this.data);
  }
}

module.exports = {
  ClientDetailResponse: zodValidateClassWrapper(ClientDetailResponse, ClientDTO),
};
