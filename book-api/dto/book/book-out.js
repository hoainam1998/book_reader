const { Expose, Type } = require('class-transformer');
const { getGraphqlFinalData } = require('#utils');
const { zodValidateClassWrapper } = require('#decorators');
const GraphqlResponse = require('#dto/common/graphql-response');
const MessageSerializerResponse = require('#dto/common/message-response');
const PaginationResponse = require('#dto/common/pagination-response');
const BookDetailDTO = require('#dto/book/book-detail');
const BookDTO = require('#dto/book/book');
const BookCreated = require('#dto/book/book-created');

class AllBooksResponse extends GraphqlResponse {
  @Expose({ toClassOnly: true })
  @Type(() => [BookDTO])
  get response() {
    return getGraphqlFinalData(this.data);
  }
}

class BookCreatedResponse extends MessageSerializerResponse {
  @Type(() => String)
  bookId;

  @Expose({ toClassOnly: true })
  @Type(() => BookCreated)
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
  AllBooksResponse: zodValidateClassWrapper(AllBooksResponse, BookDTO),
  BookCreatedResponse: zodValidateClassWrapper(BookCreatedResponse, BookCreated),
  BookDetailResponse: zodValidateClassWrapper(BookDetailResponse, BookDetailDTO),
  BookPaginationResponse: zodValidateClassWrapper(BookPaginationResponse, PaginationResponse)
};
