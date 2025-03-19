const { getGraphqlFinalData } = require('#utils');
const GraphqlResponse = require('#dto/common/graphql-response.js');
const ClientDTO = require('./client');
const { Expose, Type } = require('class-transformer');

class ClientDetailResponse extends GraphqlResponse {

  @Expose({ toClassOnly: true })
  @Type(() => ClientDTO)
  get response() {
    return getGraphqlFinalData(this.data);
  }
}

module.exports = {
  ClientDetailResponse
};
