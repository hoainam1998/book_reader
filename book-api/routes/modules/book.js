const Router = require('../router');
const multer = require('multer');
const BookRoutePath = require('#services/route-paths/book');
const { validateResultExecute, uploadPdf, upload, serializer, validation } = require('#decorators');
const authentication = require('#middlewares/auth/authentication');
const allowInternalCall = require('#middlewares/only-allow-internal-call');
const { UPLOAD_MODE, HTTP_CODE, REQUEST_DATA_PASSED_TYPE, METHOD } = require('#constants');
const { BOOK } = require('#messages');
const {
  promiseAll,
  getExtName,
  createFile,
  fetchHelper,
  messageCreator,
  convertDtoToZodObject,
  getOriginInternalServerUrl,
} = require('#utils');
const { BookPagination } = require('#dto/book/book-in');
const MessageSerializerResponse = require('#dto/common/message-serializer-response');
const {
  AllBooksResponse,
  BookCreatedResponse,
  BookDetailResponse,
  BookPaginationResponse,
} = require('#dto/book/book-out');
const {
  AllBooks,
  BookCreate,
  BookSave,
  BookFileCreated,
  PdfFileSaved,
  BookDetail,
  IntroduceHTMLFileSave,
  BookAuthors,
  RelateBook,
  DeleteBook,
} = require('#dto/book/book-in');
const BookCreated = require('#dto/book/book-created');
const cpUpload = multer().fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'images', maxCount: 8 },
  { name: 'avatar', maxCount: 1 },
]);

/**
 * Filter promise by status of them.
 *
 * @param {Promise} promise - The promise.
 * @return {Promise} - The promise filtered.
 */
const filterResponse = (promise) =>
  promise.then(async (data) => {
    // if status === 200, return data, else return data as error.
    if (data.status === HTTP_CODE.CREATED) {
      return data;
    }
    return Promise.reject({ ...(await data.json()), status: data.status });
  });

/**
 * Return book saving data.
 *
 * @param {Express.Request} req - The express request.
 * @param {number} [bookId=Date.now()] - The book id.
 * @return {{
 *  book: FormData,
 *  pdf: FormData,
 *  authors: { authorId: string; bookId: string }[]
 * }}  The book collected data.
 */
const createBookFormData = (req, bookId = Date.now()) => {
  const pdf = req.files.pdf[0];
  const avatar = req.files.avatar[0];
  const images = req.files.images;
  let authors = [];

  const bookForm = Object.entries(req.body).reduce((formData, [key, value]) => {
    if (key === 'authors') {
      authors = [value].flat().map((authorId) => ({ authorId, bookId }));
    } else {
      formData.append(key, value);
    }

    return formData;
  }, new FormData());

  !req.body.bookId && bookForm.append('bookId', bookId);
  bookForm.append('avatar', createFile(avatar), avatar.originalname);
  images.forEach((image, index) => {
    bookForm.append('images', createFile(image), image.originalname);
    bookForm.append('imageNames', `${req.body.name}${index + 1}${getExtName(image)}`);
  });

  const pdfForm = new FormData();
  pdfForm.append('bookId', bookId);
  pdfForm.append('name', req.body.name);
  pdfForm.append('pdf', createFile(pdf), pdf.originalname);

  return {
    book: bookForm,
    pdf: pdfForm,
    authors,
  };
};

/**
 * Organize book routes.
 * @class
 * @extends Router
 */
class BookRouter extends Router {
  /**
   * Create bookRouter instance.
   *
   * @param {Object} express - The express object.
   * @param {Object} graphqlExecute - The graphql execute instance.
   */
  constructor(express, graphqlExecute) {
    super(express, graphqlExecute);
    this.post(BookRoutePath.saveIntroduce, authentication, this._saveIntroduceHtmlFile);
    this.put(BookRoutePath.updateIntroduce, authentication, this._updateIntroduceHtmlFile);
    this.post(BookRoutePath.all, authentication, this._getAllBooks);
    this.post(BookRoutePath.saveBookInfo, allowInternalCall, this._saveBookInfo);
    this.put(BookRoutePath.updateBookInfo, allowInternalCall, this._updateBookInfo);
    this.post(BookRoutePath.savePdf, allowInternalCall, this._savePdf);
    this.put(BookRoutePath.updatePdf, allowInternalCall, this._updatePdf);
    this.post(BookRoutePath.saveBookAuthors, allowInternalCall, this._saveBookAuthors);
    this.post(BookRoutePath.detail, authentication, this._getBookDetail);
    this.post(BookRoutePath.createBook, authentication, cpUpload, this._createBookInformation);
    this.put(BookRoutePath.updateBook, authentication, cpUpload, this._updateBookInformation);
    this.post(BookRoutePath.pagination, authentication, this._paginationBook);
    this.post(BookRoutePath.addFavoriteBook, authentication, this._addFavoriteBook);
    this.delete(BookRoutePath.deleteFavoriteBook, authentication, this._deleteFavoriteBook);
    this.post(BookRoutePath.addReadLateBook, authentication, this._addReadLateBook);
    this.delete(BookRoutePath.deleteReadLateBook, authentication, this._deleteReadLateBook);
    this.post(BookRoutePath.addUsedReadBook, authentication, this._addUsedReadBook);
    this.delete(BookRoutePath.deleteUsedReadBook, authentication, this._deleteUsedReadBook);
    this.delete(BookRoutePath.delete, authentication, this._deleteBook);
  }

  @validation(DeleteBook, {
    request_data_passed_type: REQUEST_DATA_PASSED_TYPE.PARAM,
    error_message: BOOK.DELETE_BOOK_FAIL,
  })
  @validateResultExecute(HTTP_CODE.OK)
  @serializer(MessageSerializerResponse)
  _deleteBook(req, res, next, self) {
    const query = `mutation DeleteBook($bookId: ID!) {
      book {
        deleteBook(bookId: $bookId) {
          message
        }
      }
    }`;

    return self.execute(query, {
      bookId: req.params.bookId,
    });
  }

  @validation(RelateBook, {
    request_data_passed_type: REQUEST_DATA_PASSED_TYPE.PARAM,
    error_message: BOOK.DELETE_FAVORITE_BOOK_FAIL,
  })
  @validateResultExecute(HTTP_CODE.OK)
  @serializer(MessageSerializerResponse)
  _deleteFavoriteBook(req, res, next, self) {
    const query = `mutation DeleteFavoriteBook($readerId: ID!, $bookId: ID!) {
      book {
        deleteFavoriteBook(readerId: $readerId, bookId: $bookId) {
          message
        }
      }
    }`;

    return self.execute(query, {
      readerId: req.session.client.clientId,
      bookId: req.params.bookId,
    });
  }

  @validation(RelateBook, { error_message: BOOK.ADD_FAVORITE_BOOK_FAIL })
  @validateResultExecute(HTTP_CODE.CREATED)
  @serializer(MessageSerializerResponse)
  _addFavoriteBook(req, res, next, self) {
    const query = `mutation AddFavoriteBook($readerId: ID!, $bookId: ID!) {
      book {
        addFavoriteBook(readerId: $readerId, bookId: $bookId) {
          message
        }
      }
    }`;

    return self.execute(query, {
      readerId: req.session.client.clientId,
      bookId: req.body.bookId,
    });
  }

  @validation(RelateBook, {
    request_data_passed_type: REQUEST_DATA_PASSED_TYPE.PARAM,
    error_message: BOOK.DELETE_READ_LATE_BOOK_FAIL,
  })
  @validateResultExecute(HTTP_CODE.OK)
  @serializer(MessageSerializerResponse)
  _deleteReadLateBook(req, res, next, self) {
    const query = `mutation DeleteReadLateBook($readerId: ID!, $bookId: ID!) {
      book {
        deleteReadLateBook(readerId: $readerId, bookId: $bookId) {
          message
        }
      }
    }`;

    return self.execute(query, {
      readerId: req.session.client.clientId,
      bookId: req.params.bookId,
    });
  }

  @validation(RelateBook, { error_message: BOOK.ADD_READ_LATE_BOOK_FAIL })
  @validateResultExecute(HTTP_CODE.CREATED)
  @serializer(MessageSerializerResponse)
  _addReadLateBook(req, res, next, self) {
    const query = `mutation AddReadLateBook($readerId: ID!, $bookId: ID!, $createAt: ID!) {
      book {
        addReadLateBook(readerId: $readerId, bookId: $bookId, createAt: $createAt) {
          message
        }
      }
    }`;

    return self.execute(query, {
      readerId: req.session.client.clientId,
      bookId: req.body.bookId,
      createAt: Date.now(),
    });
  }

  @validation(RelateBook, {
    request_data_passed_type: REQUEST_DATA_PASSED_TYPE.PARAM,
    error_message: BOOK.DELETE_USED_READ_BOOK_FAIL,
  })
  @validateResultExecute(HTTP_CODE.OK)
  @serializer(MessageSerializerResponse)
  _deleteUsedReadBook(req, res, next, self) {
    const query = `mutation DeleteUsedReadBook($readerId: ID!, $bookId: ID!) {
      book {
        deleteUsedReadBook(readerId: $readerId, bookId: $bookId) {
          message
        }
      }
    }`;

    return self.execute(query, {
      readerId: req.session.client.clientId,
      bookId: req.params.bookId,
    });
  }

  @validation(RelateBook, { error_message: BOOK.ADD_USED_READ_BOOK_FAIL })
  @validateResultExecute(HTTP_CODE.CREATED)
  @serializer(MessageSerializerResponse)
  _addUsedReadBook(req, res, next, self) {
    const query = `mutation AddUsedReadBook($readerId: ID!, $bookId: ID!, $createAt: ID!) {
      book {
        addUsedReadBook(readerId: $readerId, bookId: $bookId, createAt: $createAt) {
          message
        }
      }
    }`;

    return self.execute(query, {
      readerId: req.session.client.clientId,
      bookId: req.body.bookId,
      createAt: Date.now(),
    });
  }

  @validation(IntroduceHTMLFileSave, { error_message: BOOK.SAVE_INTRODUCE_FAIL })
  @validateResultExecute(HTTP_CODE.CREATED)
  @serializer(MessageSerializerResponse)
  _saveIntroduceHtmlFile(req, res, next, self) {
    const query = `mutation SaveIntroduce($html: String!, $json: String!, $name: String!, $bookId: ID!) {
      book {
        saveIntroduce(html: $html, json: $json, name: $name, bookId: $bookId) {
          message
        }
      }
    }`;

    return self.execute(query, {
      html: req.body.html,
      name: req.body.fileName,
      json: req.body.json,
      bookId: req.body.bookId,
    });
  }

  @validation(IntroduceHTMLFileSave, { error_message: BOOK.UPDATE_INTRODUCE_FAIL })
  @validateResultExecute(HTTP_CODE.CREATED)
  @serializer(MessageSerializerResponse)
  _updateIntroduceHtmlFile(req, res, next, self) {
    const query = `mutation UpdateIntroduce($html: String!, $json: String!, $name: String!, $bookId: ID!) {
      book {
        updateIntroduce(html: $html, json: $json, name: $name, bookId: $bookId) {
          message
        }
      }
    }`;

    return self.execute(query, {
      html: req.body.html,
      name: req.body.fileName,
      json: req.body.json,
      bookId: req.body.bookId,
    });
  }

  @validation(BookDetail, { error_message: BOOK.LOAD_BOOK_DETAIL_FAIL })
  @validateResultExecute(HTTP_CODE.OK)
  @serializer(BookDetailResponse)
  _getBookDetail(req, res, next, self) {
    const query = `query GetBookDetail($bookId: ID!) {
      book {
        detail(bookId: $bookId) ${req.body.query}
      }
    }`;

    return self.execute(query, { bookId: req.body.bookId }, req.body.query);
  }

  @validation(AllBooks, { error_message: BOOK.LOAD_ALL_BOOK_FAILED })
  @validateResultExecute(HTTP_CODE.OK)
  @serializer(AllBooksResponse)
  _getAllBooks(req, res, next, self) {
    const query = `query GetAllBooks($excludeIds: [ID]) {
      book {
        all (excludeIds: $excludeIds) ${req.body.query}
      }
    }`;

    return self.execute(query, { excludeIds: req.body.excludeIds }, req.body.query);
  }

  @validation(BookPagination, { error_message: BOOK.LOAD_BOOKS_FAIL })
  @validateResultExecute(HTTP_CODE.OK)
  @serializer(BookPaginationResponse)
  _paginationBook(req, res, next, self) {
    const query = `query BookPagination($pageSize: Int!, $pageNumber: Int!, $keyword: String, $by: ByCondition) {
      book {
        pagination(pageSize: $pageSize, pageNumber: $pageNumber, keyword: $keyword, by: $by) {
          list ${req.body.query},
          total,
          page,
          pages,
          pageSize
        }
      }
    }`;

    return self.execute(
      query,
      {
        pageNumber: req.body.pageNumber,
        pageSize: req.body.pageSize,
        keyword: req.body.keyword,
        by: req.body?.by,
      },
      req.body.query
    );
  }

  @upload(UPLOAD_MODE.FIELDS, [
    {
      name: 'avatar',
      maxCount: 1,
    },
    {
      name: 'images',
      maxCount: 8,
    },
  ])
  @validation(BookCreate, { error_message: BOOK.CREATE_BOOK_FAIL })
  @validateResultExecute(HTTP_CODE.CREATED)
  @serializer(MessageSerializerResponse)
  _saveBookInfo(req, res, next, self) {
    const query = `mutation SaveBookInformation($book: BookInformationInput!) {
      book {
        saveBookInfo(book: $book) {
            message
          }
        }
      }`;

    const images = req.body.images.map((image, index) => ({
      image,
      name: Array.isArray(req.body.imageNames) ? req.body.imageNames[index] : req.body.imageNames,
    }));

    delete req.body.imageNames;

    return self.execute(query, {
      book: {
        ...req.body,
        avatar: req.body.avatar[0],
        images,
        publishedTime: +req.body.publishedTime,
      },
    });
  }

  @upload(UPLOAD_MODE.FIELDS, [
    {
      name: 'avatar',
      maxCount: 1,
    },
    {
      name: 'images',
      maxCount: 8,
    },
  ])
  @validation(BookCreate, { error_message: BOOK.UPDATE_BOOK_FAIL })
  @validateResultExecute(HTTP_CODE.CREATED)
  @serializer(MessageSerializerResponse)
  _updateBookInfo(req, res, next, self) {
    const query = `mutation UpdateBookInformation($book: BookInformationInput!) {
      book {
        updateBookInfo(book: $book) {
            message
          }
        }
      }`;

    const images = req.body.images.map((image, index) => ({
      image,
      name: Array.isArray(req.body.imageNames) ? req.body.imageNames[index] : req.body.imageNames,
    }));

    delete req.body.imageNames;

    return self.execute(query, {
      book: {
        ...req.body,
        avatar: req.body.avatar[0],
        images,
        publishedTime: +req.body.publishedTime,
      },
    });
  }

  @uploadPdf('pdf')
  @validation(PdfFileSaved, { error_message: 'Saving pdf file failed!' })
  @validateResultExecute(HTTP_CODE.CREATED)
  @serializer(MessageSerializerResponse)
  _savePdf(req, res, next, self) {
    const query = `mutation SavePdf($bookId: ID!, $pdf: String!) {
      book {
        savePdfFile(bookId: $bookId, pdf: $pdf) {
          message
        }
      }
    }`;

    return self.execute(query, {
      bookId: req.body.bookId,
      pdf: req.body.pdf,
    });
  }

  @uploadPdf('pdf')
  @validation(PdfFileSaved, { error_message: BOOK.UPDATE_PDF_FAIL })
  @validateResultExecute(HTTP_CODE.CREATED)
  @serializer(MessageSerializerResponse)
  _updatePdf(req, res, next, self) {
    const query = `mutation UpdatePdf($bookId: ID!, $pdf: String!, $name: String!) {
      book {
        updatePdfFile(bookId: $bookId, pdf: $pdf, name: $name) {
          message
        }
      }
    }`;

    return self.execute(query, {
      bookId: req.body.bookId,
      pdf: req.body.pdf,
      name: req.body.name,
    });
  }

  @validation(BookAuthors, { error_message: BOOK.SAVE_BOOK_AUTHOR_FAIL })
  @validateResultExecute(HTTP_CODE.CREATED)
  @serializer(MessageSerializerResponse)
  _saveBookAuthors(req, res, next, self) {
    const query = `mutation CreateBookAuthor($authors: [BookAuthor!]!) {
      book {
        saveBookAuthor(authors: $authors) {
          message
        }
      }
    }`;

    return self.execute(query, { authors: req.body.authors });
  }

  @validation(
    [
      {
        validate_class: BookSave,
        request_data_passed_type: REQUEST_DATA_PASSED_TYPE.BODY,
      },
      {
        validate_class: BookFileCreated,
        request_data_passed_type: REQUEST_DATA_PASSED_TYPE.FILES,
      },
    ],
    {
      error_message: BOOK.CREATE_BOOK_FAIL,
      groups: ['create'],
    }
  )
  @validateResultExecute(HTTP_CODE.CREATED)
  @serializer(BookCreatedResponse)
  _createBookInformation(req) {
    const url = getOriginInternalServerUrl(req);
    const bookId = Date.now();
    const { book, pdf, authors } = createBookFormData(req, bookId);

    return promiseAll([
      () => filterResponse(fetchHelper(`${url}/save-book-info`, METHOD.POST, book)),
      () => filterResponse(fetchHelper(`${url}/save-pdf`, METHOD.POST, pdf)),
      () =>
        filterResponse(
          fetchHelper(
            `${url}/save-book-authors`,
            METHOD.POST,
            {
              'Content-Type': 'application/json',
            },
            JSON.stringify({ authors })
          )
        ),
    ]).then(() => {
      return convertDtoToZodObject(BookCreated, {
        ...messageCreator(BOOK.CREATE_BOOK_SUCCESS),
        bookId: bookId.toString(),
      });
    });
  }

  @validation(
    [
      {
        validate_class: BookSave,
        request_data_passed_type: REQUEST_DATA_PASSED_TYPE.BODY,
      },
      {
        validate_class: BookFileCreated,
        request_data_passed_type: REQUEST_DATA_PASSED_TYPE.FILES,
      },
    ],
    {
      error_message: BOOK.UPDATE_BOOK_FAIL,
      groups: ['update'],
    }
  )
  @validateResultExecute(HTTP_CODE.CREATED)
  @serializer(MessageSerializerResponse)
  _updateBookInformation(req) {
    const url = getOriginInternalServerUrl(req);
    const bookId = req.body.bookId;
    const { book, pdf, authors } = createBookFormData(req, bookId);

    return promiseAll([
      () => filterResponse(fetchHelper(`${url}/update-book-info`, METHOD.PUT, book)),
      () => filterResponse(fetchHelper(`${url}/update-pdf`, METHOD.PUT, pdf)),
      () =>
        filterResponse(
          fetchHelper(
            `${url}/save-book-authors`,
            METHOD.POST,
            {
              'Content-Type': 'application/json',
            },
            JSON.stringify({ authors })
          )
        ),
    ]).then(() => {
      return messageCreator(BOOK.UPDATE_BOOK_SUCCESS);
    });
  }
}

module.exports = BookRouter;
