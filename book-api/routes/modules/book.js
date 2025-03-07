const Router = require('../router.js');
const multer = require('multer');
const {
  validateResultExecute,
  uploadPdf,
  upload,
  serializer,
  validation
} = require('#decorators');
const authentication = require('#middlewares/auth/authentication.js');
const allowInternalCall = require('#middlewares/only-allow-internal-call.js');
const { UPLOAD_MODE, HTTP_CODE, REQUEST_DATA_PASSED_TYPE } = require('#constants');
const { promiseAll, getExtName, createFile, fetchHelper, messageCreator } = require('#utils');
const { BookPagination } = require('#dto/book/book-in.js');
const MessageSerializerResponse = require('#dto/common/message-serializer-response.js');
const { AllBookName, BookCreatedResponse, BookDetailResponse, BookPaginationResponse } = require('#dto/book/book-out.js');
const { BookCreate, BookSave, BookFileCreated, PdfFileSaved, BookDetail, IntroduceHTMLFileSave, BookAuthors } = require('#dto/book/book-in.js');
const cpUpload = multer().fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'images', maxCount: 8 },
  { name: 'avatar', maxCount: 1 }
]);

const filterResponse = (promise) =>
  promise.then(async data => {
    const result = { ...await data.json(), status: data.status };
    if (data.status === HTTP_CODE.CREATED) {
      return result;
    }
    return Promise.reject(result);
  });

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
  }, new FormData);

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
    authors
  };
};

/**
 * Organize book routes.
 * @extends Router
 */
class BookRouter extends Router {
  /**
  * Create bookRouter instance.
  *
  * @param {object} express - The express object.
  * @param {object} graphqlExecute - The graphql execute instance.
  */
  constructor(express, graphqlExecute) {
    super(express, graphqlExecute);
    this.post('/save-introduce', authentication, this._saveIntroduceHtmlFile);
    this.put('/update-introduce', authentication, this._updateIntroduceHtmlFile);
    this.get('/book-name', authentication, this._getAllBookName);
    this.post('/save-book-info', allowInternalCall, this._saveBookInfo);
    this.put('/update-book-info', allowInternalCall, this._updateBookInfo);
    this.post('/save-pdf', allowInternalCall, this._savePdf);
    this.put('/update-pdf', allowInternalCall, this._updatePdf);
    this.post('/save-book-authors', allowInternalCall, this._saveBookAuthors);
    this.post('/detail', authentication, this._getBookDetail);
    this.post('/create-book', authentication, cpUpload, this._createBookInformation);
    this.put('/update-book', authentication, cpUpload, this._updateBookInformation);
    this.post('/pagination', authentication, this._paginationBook);
  }

  @validation(IntroduceHTMLFileSave, { error_message: 'Saving introduce file failed!' })
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
      bookId: req.body.bookId
    });
  }

  @validation(IntroduceHTMLFileSave, { error_message: 'Updating introduce file failed!' })
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
      bookId: req.body.bookId
    });
  }

  @validation(BookDetail, { error_message: 'Getting book information failed!' })
  @validateResultExecute(HTTP_CODE.OK)
  @serializer(BookDetailResponse)
  _getBookDetail(req, res, next, self) {
    const query = `query GetBookDetail($bookId: ID!) {
      book {
        detail(bookId: $bookId) ${
          req.body.query
        }
      }
    }`;

    return self.execute(query, { bookId: req.body.bookId }, req.body.query);
  }

  @validateResultExecute(HTTP_CODE.OK)
  @serializer(AllBookName)
  _getAllBookName(req, res, next, self) {
    const query = `query GetAllBookName {
      book {
        names
      }
    }`;

    return self.execute(query);
  }

  @validation(BookPagination, { error_message: 'Loading books failed!' })
  @validateResultExecute(HTTP_CODE.OK)
  @serializer(BookPaginationResponse)
  _paginationBook(req, res, next, self) {
    const query = `query BookPagination($pageSize: Int!, $pageNumber: Int!, $keyword: String) {
      book {
        pagination(pageSize: $pageSize, pageNumber: $pageNumber, keyword: $keyword) {
          list ${
            req.body.query
          },
          total
        }
      }
    }`;

    return self.execute(query,
      {
        pageNumber: req.body.pageNumber,
        pageSize: req.body.pageSize,
        keyword: req.body.keyword
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
      maxCount: 8
    }
  ])
  @validation(BookCreate, { error_message: 'Creating book information failed!' })
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
      name: req.body.imageNames[index],
      bookId: req.body.bookId,
    }));

    delete req.body.imageNames;

    return self.execute(query, {
      book: {
        ...req.body,
        avatar: req.body.avatar[0],
        images,
        publishedTime: +req.body.publishedTime
      }
    });
  }

  @upload(UPLOAD_MODE.FIELDS, [
    {
      name: 'avatar',
      maxCount: 1,
    },
    {
      name: 'images',
      maxCount: 8
    }
  ])
  @validation(BookCreate, { error_message: 'Updating book information failed!' })
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
      name: req.body.imageNames[index],
      bookId: req.body.bookId,
    }));

    delete req.body.imageNames;

    return self.execute(query, {
      book: {
        ...req.body,
        avatar: req.body.avatar[0],
        images,
        publishedTime: +req.body.publishedTime
      }
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
      pdf: req.body.pdf
    });
  }

  @uploadPdf('pdf')
  @validation(PdfFileSaved, { error_message: 'Updating pdf file failed!' })
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
      name: req.body.name
    });
  }

  @validation(BookAuthors, { error_message: 'Create book authors failed!' })
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

    return self.execute(
      query,
      { authors: req.body.authors }
    );
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
      }
    ],
    {
      error_message: 'Create book failed!',
      groups: ['create']
    }
  )
  @validateResultExecute(HTTP_CODE.CREATED)
  @serializer(BookCreatedResponse)
  _createBookInformation(req, res, next, self) {
    const url = `${req.protocol}:${req.get('host')}${req.baseUrl}`;
    const bookId = Date.now();
    const { book, pdf, authors } = createBookFormData(req, bookId);

    return promiseAll([
      () => filterResponse(fetchHelper(`${url}/save-book-info`, 'POST', book)),
      () => filterResponse(fetchHelper(`${url}/save-pdf`, 'POST', pdf)),
      () => filterResponse(fetchHelper(`${url}/save-book-authors`, 'POST', {
          'Content-Type': 'application/json'
        },
        JSON.stringify({ authors }))
      ),
    ])
    .then(results => {
      if (results.some(result => result.status === HTTP_CODE.SERVER_ERROR)) {
        return Promise.reject('Create book failed!');
      }

      return {
        ...messageCreator('Book created success!'),
        bookId: bookId.toString()
      };
    });
  }

  @validation(
    [
      {
        validate_class: BookSave,
        request_data_passed_type: REQUEST_DATA_PASSED_TYPE.BODY
      },
      {
        validate_class: BookFileCreated,
        request_data_passed_type: REQUEST_DATA_PASSED_TYPE.FILES,
      },
    ],
    {
      error_message: 'Update book failed!',
      groups: ['update']
    }
  )
  @validateResultExecute(HTTP_CODE.CREATED)
  @serializer(BookCreatedResponse)
  _updateBookInformation(req, res, next, self) {
    const url = `${req.protocol}:${req.get('host')}${req.baseUrl}`;
    const bookId = req.body.bookId;
    const { book, pdf, authors } = createBookFormData(req, bookId);

    return promiseAll([
      () => filterResponse(fetchHelper(`${url}/update-book-info`, 'PUT', book)),
      () => filterResponse(fetchHelper(`${url}/update-pdf`, 'PUT', pdf)),
      () => filterResponse(fetchHelper(`${url}/save-book-authors`, 'POST', {
          'Content-Type': 'application/json'
        },
        JSON.stringify({ authors }))
      ),
    ])
    .then(results => {
      if (results.some(result => result.status === HTTP_CODE.SERVER_ERROR)) {
        return Promise.reject('Updating book failed!');
      }
      return messageCreator('Updating book success!');
    });
  }
}

module.exports = BookRouter;
