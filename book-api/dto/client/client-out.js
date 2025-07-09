const { Expose, Type } = require('class-transformer');
const { getGraphqlFinalData } = require('#utils');
const GraphqlResponse = require('#dto/common/graphql-response');
const { zodValidateClassWrapper } = require('#decorators');
const ClientDTO = require('./client');
const ForgetPassword = require('#dto/client/forget-password');

class ClientDetailResponse extends GraphqlResponse {
  @Expose({ toClassOnly: true })
  @Type(() => ClientDTO)
  get response() {
    return getGraphqlFinalData(this.data);
  }
}

class ForgetPasswordResponse extends GraphqlResponse {
  @Expose({ toClassOnly: true })
  @Type(() => ForgetPassword)
  get response() {
    return getGraphqlFinalData(this.data);
  }
}

class AllClientsResponse extends GraphqlResponse {
  @Expose({ toClassOnly: true })
  @Type(() => [ClientDTO])
  get response() {
    return getGraphqlFinalData(this.data);
  }
}

module.exports = {
  ClientDetailResponse: zodValidateClassWrapper(ClientDetailResponse, ClientDTO),
  ForgetPasswordResponse: zodValidateClassWrapper(ForgetPasswordResponse, ForgetPassword),
  AllClientsResponse: zodValidateClassWrapper(AllClientsResponse, ClientDTO),
};
