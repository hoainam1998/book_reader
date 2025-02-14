const { Expose, Type } = require('class-transformer');
const { getGraphqlFinalData } = require('#utils');
const GraphqlResponse = require('#dto/common/graphql-response.js');
const MessageSerializerResponse = require('#dto/common/message-response.js');
const PaginationResponse = require('#dto/common/pagination-response.js');
const BookDetailDTO = require('#dto/book/book-detail.js');

class AllBookName extends GraphqlResponse {
  @Expose({ toClassOnly: true })
  @Type(() => [String])
  get response() {
    return getGraphqlFinalData(this.data);
  }
}

class BookCreatedResponse extends MessageSerializerResponse {
  @Type(() => String)
  bookId;

  @Expose({ toClassOnly: true })
  @Type(() => BookCreatedResponse)
  get response() {
    return {
      message: this.message,
      bookId: this.bookId,
    };
  }
}

class BookDetailResponse extends GraphqlResponse {
  @Expose({ toClassOnly: true })
  @Type(() => BookDetailDTO)
  get response() {
    return getGraphqlFinalData(this.data);
  }
}

class BookPaginationResponse extends GraphqlResponse {
  @Expose({ toClassOnly: true })
  @Type(() => PaginationResponse)
  get response() {
    return getGraphqlFinalData(this.data);
  }
}

module.exports = {
  AllBookName,
  BookCreatedResponse,
  BookDetailResponse,
  BookPaginationResponse
};
