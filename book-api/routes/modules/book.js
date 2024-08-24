const Router = require('../router.js');
const multer = require('multer');
const { execute } = require('graphql');
const path = require('path');
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
  { name: 'images', maxCount: 8 }
]);

class BookRouter extends Router {
  constructor(express, schema) {
    super(express, schema);
    this.post('/save-introduce', this._saveIntroduceHtmlFile);
    this.post('/save-book', this._saveBookInformation);
    this.post('/save-images', this._saveImages);
    this.post('/detail', this._getBookDetail);
    this.post('/save-book-info', cpUpload, this._processSaveBookInformation);
  }

  @validateResultExecute(HTTP_CODE.CREATED)
  @validateQuery
  _saveIntroduceHtmlFile(req, res, next, schema) {
    return execute({ schema, document: req.body.query, variableValues: {
        introduce: { html: req.body.html, name: req.body.fileName }
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

  _processSaveBookInformation(req, res, next, schema) {
    const pdf = req.files.pdf[0];
    const images = req.files.images;
    const bookId = Date.now();
    const formDataBookInfo = new FormData();
    const formDataBookImages = new FormData();
    const url = `${req.protocol}:${req.get('host')}${req.baseUrl}`;

    Object.keys(req.body).forEach(key => {
      formDataBookInfo.append(key, req.body[key]);
    });

    formDataBookInfo.append('pdf', new File([pdf.buffer], pdf.originalname), pdf.originalname);
    formDataBookInfo.append('query', 'mutation SaveBookInformation($book: BookInformationInput) { book { saveBookInfo(book: $book) { message } } }');

    images.forEach((image, index) => {
      formDataBookImages.append('images', new File([image.buffer], pdf.originalname, { type: image.mimetype }), image.originalname);
      formDataBookImages.append('name', `${req.body.name}${index + 1}${path.extname(image.originalname)}`);
    });

    formDataBookImages.append(
      'query',
      'mutation SaveBookImages($images: [String], $bookId: ID, $name: [String]) { book { saveBookImages(images: $images, bookId: $bookId, name: $name) { message } } }'
    );
    formDataBookImages.append('bookId', bookId);
    formDataBookInfo.append('bookId', bookId);

    const fetchHelper = (path, body) => fetch(`${url}/${path}`, { method: 'POST', body });

    const promiseFetchBookData = (fetchHandler, name) => {
      return new Promise((resolve, reject) => {
        fetchHandler
          .then(saveBookInfoResponse => {
            if (saveBookInfoResponse.status === HTTP_CODE.CREATED) {
              resolve(saveBookInfoResponse);
            } else {
              reject(new Error(`Save ${name} failed!`));
            }
          })
          .catch(err => reject(new Error(`Save ${name} failed by ${err.message}`)));
      });
    };

    promiseAllSettledOrder([
      () => promiseFetchBookData(fetchHelper('save-book', formDataBookInfo), 'book information'),
      () => promiseFetchBookData(fetchHelper('save-images', formDataBookImages), 'book images')
    ],
    () => res.status(HTTP_CODE.OK).json({
        ...messageCreator('Save book information success!'),
        bookId
      }),
    err => res.status(HTTP_CODE.BAD_REQUEST).json(messageCreator(err.message)));
  }
}

module.exports = BookRouter;
