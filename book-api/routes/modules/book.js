const Router = require('../router.js');
const multer = require('multer');
const { execute } = require('graphql');
const path = require('path');
const cors = require('cors');
const {
  validateQuery,
  validateResultExecute,
  uploadPdf,
  upload
} = require('../../decorators/index.js');
const { UPLOAD_MODE, HTTP_CODE } = require('../../constants/index.js');
const { messageCreator, promiseAllSettledOrder } = require('../../utils/index.js');
const formable = multer();
const cpUpload = formable.fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'images', maxCount: 8 },
  { name: 'avatar', maxCount: 1 }
]);
const corsOptionsDelegate = (req, callback) => {
  const corsOptions = {
    origin: `${req.protocol}://${req.get('host')}`
  };
  callback(null, corsOptions);
};

class BookRouter extends Router {
  constructor(express, schema) {
    super(express, schema);
    this.post('/save-introduce', this._saveIntroduceHtmlFile);
    this.post('/get-all-book-name', this._getAllBookName);
    this.post('/save-book', cors(corsOptionsDelegate), this._saveBookInformation);
    this.post('/save-images', cors(corsOptionsDelegate), this._saveImages);
    this.post('/save-avatar', cors(corsOptionsDelegate), this._saveBookAvatar);
    this.post('/detail', this._getBookDetail);
    this.post('/save-book-info', cpUpload, this._processSaveBookInformation);
    this.post('/pagination', this._paginationBook);
  }

  @validateResultExecute(HTTP_CODE.CREATED)
  @validateQuery
  _saveIntroduceHtmlFile(req, res, next, schema) {
    return execute({ schema, document: req.body.query, variableValues: {
        html: req.body.html,
        name: req.body.fileName,
        json: req.body.json,
        bookId: req.body.bookId
      }
    });
  }

  @uploadPdf('pdf')
  @validateResultExecute(HTTP_CODE.CREATED)
  @validateQuery
  _saveBookInformation(req, res, next, schema) {
    const body = { ...req.body };
    delete body.query;

    return execute({
      schema, document: req.body.query, variableValues: {
        book: {
          ...body,
          publishedTime: +req.body.publishedTime
        }
      }
    });
  }

  @upload(UPLOAD_MODE.SINGLE, 'avatar')
  @validateResultExecute(HTTP_CODE.CREATED)
  @validateQuery
  _saveBookAvatar(req, res, next, schema) {
    return execute({ schema, document: req.body.query, variableValues: {
        bookId: req.body.bookId,
        avatar: req.body.avatar
      }
    });
  }

  @upload(UPLOAD_MODE.ARRAY, 'images')
  @validateResultExecute(HTTP_CODE.CREATED)
  @validateQuery
  _saveImages(req, res, next, schema) {
    return execute({ schema, document: req.body.query, variableValues: {
        images: req.body.images,
        bookId: req.body.bookId,
        name: req.body.name
      }
    });
  }

  @validateResultExecute(HTTP_CODE.OK)
  @validateQuery
  _getBookDetail(req, res, next, schema) {
    return execute({ schema, document: req.body.query, variableValues: { bookId: req.body.bookId } });
  }

  @validateResultExecute(HTTP_CODE.OK)
  @validateQuery
  _getAllBookName(req, res, next, schema) {
    return execute({ schema, document: req.body.query });
  }

  @validateResultExecute(HTTP_CODE.OK)
  @validateQuery
  _paginationBook(req, res, next, schema) {
    return execute({ schema, document: req.body.query, variableValues: {
        pageNumber: req.body.pageNumber,
        pageSize: req.body.pageSize,
        keyword: req.body.keyword
      }
    });
  }

  _processSaveBookInformation(req, res, next, schema) {
    const pdf = req.files.pdf[0];
    const avatar = req.files.avatar[0];
    const images = req.files.images;
    const bookId = req.body.bookId || Date.now();
    const formDataBookInfo = new FormData();
    const formDataBookImages = new FormData();
    const formDataBookAvatar = new FormData();
    const url = `${req.protocol}:${req.get('host')}${req.baseUrl}`;
    const message = req.body.bookId ? 'Update book information success!' : 'Save book information success!';

    Object.keys(req.body).forEach(key => {
      if (!formDataBookInfo.has(key)) {
        formDataBookInfo.append(key, req.body[key]);
      }
    });

    formDataBookInfo.append('pdf', new File([pdf.buffer], pdf.originalname), pdf.originalname);
    formDataBookAvatar.append('avatar', new File([avatar.buffer], avatar.originalname, { type: avatar.mimetype }), avatar.originalname);
    formDataBookAvatar.append(
      'query',
      'mutation UpdateBookAvatar($avatar: String, $bookId: ID) { book { saveBookAvatar(avatar: $avatar, bookId: $bookId) { message } } }'
    );

    if (req.body.bookId) {
      formDataBookInfo.append('query', 'mutation UpdateBookInformation($book: BookInformationInput) { book { updateBookInfo(book: $book) { message } } }');
      formDataBookImages.append(
        'query',
        'mutation UpdateBookImages($images: [String], $bookId: ID, $name: [String]) { book { updateBookImages(images: $images, bookId: $bookId, name: $name) { message } } }'
      );
    } else {
      formDataBookInfo.append('query', 'mutation SaveBookInformation($book: BookInformationInput) { book { saveBookInfo(book: $book) { message } } }');
      formDataBookImages.append(
        'query',
        'mutation SaveBookImages($images: [String], $bookId: ID, $name: [String]) { book { saveBookImages(images: $images, bookId: $bookId, name: $name) { message } } }'
      );
    }

    images.forEach((image, index) => {
      formDataBookImages.append('images', new File([image.buffer], pdf.originalname, { type: image.mimetype }), image.originalname);
      formDataBookImages.append('name', `${req.body.name}${index + 1}${path.extname(image.originalname)}`);
    });

    formDataBookImages.append('bookId', bookId);
    formDataBookAvatar.append('bookId', bookId);
    if (!formDataBookInfo.has('bookId')) {
      formDataBookInfo.append('bookId', bookId);
    }

    const fetchHelper = (path, body) => fetch(`${url}/${path}`, { method: 'POST', body });

    const promiseFetchBookData = (fetchHandler, name) => {
      return fetchHandler
        .then(async saveBookInfoResponse => {
          if (saveBookInfoResponse.status === HTTP_CODE.CREATED) {
            return saveBookInfoResponse;
          } else {
            const { message } = await saveBookInfoResponse.json();
            throw new Error(`[${name}] ${message}`);
          }
        })
        .catch(err => {
          throw new Error(err.message);
        });
    };

    promiseAllSettledOrder([
      () => promiseFetchBookData(fetchHelper('save-book', formDataBookInfo), 'Book information'),
      () => promiseFetchBookData(fetchHelper('save-avatar', formDataBookAvatar), 'Book avatar'),
      () => promiseFetchBookData(fetchHelper('save-images', formDataBookImages), 'Book images'),
    ],
    () => {
      res.status(HTTP_CODE.OK).json({
        ...messageCreator(message),
        bookId
      });
    },
    err => res.status(HTTP_CODE.BAD_REQUEST).json(messageCreator(err.message)));
  }
}

module.exports = BookRouter;
