const { Expose, Type } = require('class-transformer');
const GraphqlResponse = require('#dto/common/graphql-response.js');
const PaginationResponse = require('#dto/common/pagination-response.js');
const User = require('#dto/user/user.js');
const OtpVerify = require('#dto/user/otp-verify.js');
const OtpUpdate = require('#dto/user/otp-update.js');
const PersonUpdate = require('#dto/user/person-update.js');
const { getGraphqlFinalData } = require('#utils');

class UserPagination extends GraphqlResponse {
  @Expose({ toClassOnly: true })
  @Type(() => PaginationResponse)
  get response() {
    return getGraphqlFinalData(this.data);
  }
}

class LoginResponse extends GraphqlResponse {
  @Expose({ toClassOnly: true })
  @Type(() => User)
  get response() {
    return getGraphqlFinalData(this.data);
  }
}

class OtpVerifyResponse extends GraphqlResponse {
  @Expose({ toClassOnly: true })
  @Type(() => OtpVerify)
  get response() {
    return getGraphqlFinalData(this.data);
  }
}

class OtpUpdateResponse extends GraphqlResponse {
  @Expose({ toClassOnly: true })
  @Type(() => OtpUpdate)
  get response() {
    return getGraphqlFinalData(this.data);
  }
}

class EmailsResponse extends GraphqlResponse {
  @Expose({ toClassOnly: true })
  @Type(() => [String])
  get response() {
    return getGraphqlFinalData(this.data);
  }
}

class UserDetailResponse extends GraphqlResponse {
  @Expose({ toClassOnly: true })
  @Type(() => User)
  get response() {
    return getGraphqlFinalData(this.data);
  }
}

class PersonUpdateResponse extends GraphqlResponse {
  @Expose({ toClassOnly: true })
  @Type(() => PersonUpdate)
  get response() {
    return getGraphqlFinalData(this.data);
  }
};

module.exports = {
  UserPagination,
  LoginResponse,
  OtpVerifyResponse,
  OtpUpdateResponse,
  EmailsResponse,
  UserDetailResponse,
  PersonUpdateResponse
};
