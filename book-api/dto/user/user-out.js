const { Expose, Type } = require('class-transformer');
const GraphqlResponse = require('#dto/common/graphql-response');
const PaginationResponse = require('#dto/common/pagination-response');
const UserDTO = require('#dto/user/user');
const OtpVerify = require('#dto/user/otp-verify');
const OtpUpdate = require('#dto/user/otp-update');
const UserCreated = require('#dto/user/user-created');
const { getGraphqlFinalData } = require('#utils');
const { zodValidateClassWrapper } = require('#decorators');

class UserPagination extends GraphqlResponse {
  @Expose({ toClassOnly: true })
  @Type(() => PaginationResponse)
  get response() {
    return getGraphqlFinalData(this.data);
  }
}

class LoginResponse extends GraphqlResponse {
  @Expose({ toClassOnly: true })
  @Type(() => UserDTO)
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

class AllUsersResponse extends GraphqlResponse {
  @Expose({ toClassOnly: true })
  @Type(() => [UserDTO])
  get response() {
    return getGraphqlFinalData(this.data);
  }
}

class UserDetailResponse extends GraphqlResponse {
  @Expose({ toClassOnly: true })
  @Type(() => UserDTO)
  get response() {
    return getGraphqlFinalData(this.data);
  }
}

class UserCreatedResponse extends GraphqlResponse {
  @Expose({ toClassOnly: true })
  @Type(() => UserCreated)
  get response() {
    return getGraphqlFinalData(this.data);
  }
}

module.exports = {
  UserPagination: zodValidateClassWrapper(UserPagination, PaginationResponse),
  LoginResponse: zodValidateClassWrapper(LoginResponse, UserDTO),
  OtpVerifyResponse: zodValidateClassWrapper(OtpVerifyResponse, OtpVerify),
  OtpUpdateResponse: zodValidateClassWrapper(OtpUpdateResponse, OtpUpdate),
  AllUsersResponse: zodValidateClassWrapper(AllUsersResponse, UserDTO),
  UserDetailResponse: zodValidateClassWrapper(UserDetailResponse, UserDTO),
  UserCreatedResponse: zodValidateClassWrapper(UserCreatedResponse, UserCreated),
};
