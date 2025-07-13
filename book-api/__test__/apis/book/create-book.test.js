const { ServerError } = require('#test/mocks/other-errors');
const { PrismaNotFoundError } = require('#test/mocks/prisma-error');
const ErrorCode = require('#services/error-code');
const BookDummyData = require('#test/resources/dummy-data/book');
const OutputValidate = require('#services/output-validate');
const BookRoutePath = require('#services/route-paths/book');
const { HTTP_CODE, METHOD, PATH } = require('#constants');
const { BOOK, USER, COMMON } = require('#messages');
const { authenticationToken, sessionData, signedTestCookie, destroySession } = require('#test/resources/auth');
const commonTest = require('#test/apis/common/common');
const { getInputValidateMessage, getStaticFile, createDescribeTest } = require('#test/helpers/index');
const createBookUrl = BookRoutePath.createBook.abs;
const saveBookInfoUrl = BookRoutePath.saveBookInfo.abs;
const savePdfFileUrl = BookRoutePath.savePdf.abs;
const saveBookAuthorUrl = BookRoutePath.saveBookAuthors.abs;

const mockBook = BookDummyData.MockData;
const mockRequestBook = BookDummyData.MockRequestData;

const requestBody = [
  {
    authorId: Date.now().toString(),
    bookId: mockRequestBook.book_id,
  },
  {
    authorId: Date.now().toString(),
    bookId: mockRequestBook.book_id,
  },
];

/**
 * Format authors with new properties.
 *
 * @param {array} authors - The authors.
 * @return {array} - The new authors.
 */
const createDataInsert = (authors) => {
  const objectMapping = {
    authorId: 'author_id',
    bookId: 'book_id',
  };

  return authors.map((author) => {
    return Object.entries(author).reduce((newAuthor, [key, value]) => {
      newAuthor[objectMapping[key]] = value;
      return newAuthor;
    }, {});
  });
};

describe('create book', () => {
  commonTest(
    'create book api common test',
    [
      {
        name: 'url test',
        describe: 'url is invalid',
        url: `${PATH.BOOK}/unknown`,
        method: METHOD.POST.toLowerCase(),
      },
      {
        name: 'method test',
        describe: 'method not allowed',
        url: createBookUrl,
        method: METHOD.GET.toLowerCase(),
      },
      {
        name: 'cors test',
        describe: 'create book api cors',
        url: createBookUrl,
        method: METHOD.POST.toLowerCase(),
        origin: process.env.ORIGIN_CORS,
      },
    ],
    'create book common test'
  );

  describe(createDescribeTest(METHOD.POST, createBookUrl), () => {
    test('create book will be success', (done) => {
      fetch.mockResolvedValue(new Response(JSON.stringify({}), { status: HTTP_CODE.CREATED }));

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(createBookUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('Connection', 'keep-alive')
          .field('name', mockRequestBook.name)
          .field('publishedTime', mockRequestBook.published_time)
          .field('publishedDay', mockRequestBook.published_day)
          .field('categoryId', mockRequestBook.category_id)
          .field('authors', Date.now().toString())
          .attach('pdf', getStaticFile('/pdf/pdf-test.pdf'), { contentType: 'application/pdf' })
          .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
          .attach('images', getStaticFile('/images/application.png'), { contentType: 'image/png' })
          .attach('images', getStaticFile('/images/application.png'), { contentType: 'image/png' })
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.CREATED)
          .then((response) => {
            expect(fetch).toHaveBeenCalledTimes(3);
            expect(fetch.mock.calls).toEqual([
              [
                expect.stringContaining('/save-book-info'),
                expect.objectContaining({
                  method: METHOD.POST,
                  body: expect.any(FormData),
                }),
              ],
              [
                expect.stringContaining('/save-pdf'),
                expect.objectContaining({
                  method: METHOD.POST,
                  body: expect.any(FormData),
                }),
              ],
              [
                expect.stringContaining('/save-book-authors'),
                expect.objectContaining({
                  method: METHOD.POST,
                  headers: expect.objectContaining({
                    'Content-Type': 'application/json',
                  }),
                  body: expect.any(String),
                }),
              ],
            ]);
            expect(response.body).toEqual({
              message: BOOK.CREATE_BOOK_SUCCESS,
              bookId: expect.any(String),
            });
            done();
          });
      });
    });

    test('create book failed with authentication token not set', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(createBookUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.UNAUTHORIZED)
          .then((response) => {
            expect(fetch).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: USER.USER_UNAUTHORIZED,
              errorCode: ErrorCode.HAVE_NOT_LOGIN,
            });
            done();
          });
      });
    });

    test('create book failed with session expired', (done) => {
      expect.hasAssertions();
      destroySession().then((responseSign) => {
        globalThis.api
          .post(createBookUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.UNAUTHORIZED)
          .then((response) => {
            expect(fetch).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: USER.WORKING_SESSION_EXPIRE,
              errorCode: ErrorCode.WORKING_SESSION_ENDED,
            });
            done();
          });
      });
    });

    test.each([
      {
        describe: 'bad request',
        status: HTTP_CODE.BAD_REQUEST,
        expected: {
          message: BOOK.CREATE_BOOK_FAIL,
        },
      },
      {
        describe: 'server error',
        status: HTTP_CODE.SERVER_ERROR,
        expected: {
          message: COMMON.INTERNAL_ERROR_MESSAGE,
        },
      },
    ])('create book failed with $describe', ({ status, expected }, done) => {
      fetch.mockResolvedValue(new Response(JSON.stringify(expected), { status }));

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(createBookUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('Connection', 'keep-alive')
          .field('name', mockRequestBook.name)
          .field('publishedTime', mockRequestBook.published_time)
          .field('publishedDay', mockRequestBook.published_day)
          .field('categoryId', mockRequestBook.category_id)
          .field('authors', Date.now().toString())
          .attach('pdf', getStaticFile('/pdf/pdf-test.pdf'), { contentType: 'application/pdf' })
          .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
          .attach('images', getStaticFile('/images/application.png'), { contentType: 'image/png' })
          .expect('Content-Type', /application\/json/)
          .expect(status)
          .then((response) => {
            expect(fetch).toHaveBeenCalledTimes(1);
            expect(fetch.mock.calls).toEqual([
              [
                expect.stringContaining('/save-book-info'),
                expect.objectContaining({
                  method: METHOD.POST,
                  body: expect.any(FormData),
                }),
              ],
            ]);
            expect(response.body).toEqual(expected);
            done();
          });
      });
    });

    test('create book failed with request body empty', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(createBookUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.BAD_REQUEST)
          .then((response) => {
            expect(fetch).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(BOOK.CREATE_BOOK_FAIL),
              errors: [COMMON.REQUEST_DATA_EMPTY],
            });
            done();
          });
      });
    });

    test('create book failed with request body are missing field', (done) => {
      // missing authors
      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(createBookUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .field('name', mockRequestBook.name)
          .field('publishedTime', mockRequestBook.published_time)
          .field('publishedDay', mockRequestBook.published_day)
          .field('categoryId', mockRequestBook.category_id)
          .attach('pdf', getStaticFile('/pdf/pdf-test.pdf'), { contentType: 'application/pdf' })
          .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
          .attach('images', getStaticFile('/images/application.png'), { contentType: 'image/png' })
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.BAD_REQUEST)
          .then((response) => {
            expect(fetch).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(BOOK.CREATE_BOOK_FAIL),
              errors: expect.any(Array),
            });
            expect(response.body.errors).toHaveLength(1);
            done();
          });
      });
    });

    test('create book failed with request files are missing field', (done) => {
      // missing images
      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(createBookUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .field('name', mockRequestBook.name)
          .field('publishedTime', mockRequestBook.published_time)
          .field('publishedDay', mockRequestBook.published_day)
          .field('categoryId', mockRequestBook.category_id)
          .field('authors', Date.now().toString())
          .attach('pdf', getStaticFile('/pdf/pdf-test.pdf'), { contentType: 'application/pdf' })
          .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.BAD_REQUEST)
          .then((response) => {
            expect(fetch).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(BOOK.CREATE_BOOK_FAIL),
              errors: expect.any(Array),
            });
            expect(response.body.errors.length).toBeGreaterThanOrEqual(1);
            done();
          });
      });
    });

    test('create book failed output validate error', (done) => {
      fetch.mockResolvedValue(new Response(JSON.stringify({}), { status: HTTP_CODE.CREATED }));
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(createBookUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('Connection', 'keep-alive')
          .field('name', mockRequestBook.name)
          .field('publishedTime', mockRequestBook.published_time)
          .field('publishedDay', mockRequestBook.published_day)
          .field('categoryId', mockRequestBook.category_id)
          .field('authors', Date.now().toString())
          .attach('pdf', getStaticFile('/pdf/pdf-test.pdf'), { contentType: 'application/pdf' })
          .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
          .attach('images', getStaticFile('/images/application.png'), { contentType: 'image/png' })
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.BAD_REQUEST)
          .then((response) => {
            expect(fetch).toHaveBeenCalledTimes(3);
            expect(fetch.mock.calls).toEqual([
              [
                expect.stringContaining('/save-book-info'),
                expect.objectContaining({
                  method: METHOD.POST,
                  body: expect.any(FormData),
                }),
              ],
              [
                expect.stringContaining('/save-pdf'),
                expect.objectContaining({
                  method: METHOD.POST,
                  body: expect.any(FormData),
                }),
              ],
              [
                expect.stringContaining('/save-book-authors'),
                expect.objectContaining({
                  method: METHOD.POST,
                  headers: expect.objectContaining({
                    'Content-Type': 'application/json',
                  }),
                  body: expect.any(String),
                }),
              ],
            ]);
            expect(response.body).toEqual({
              message: COMMON.OUTPUT_VALIDATE_FAIL,
            });
            done();
          });
      });
    });
  });

  commonTest(
    'create book api common test',
    [
      {
        name: 'cors test',
        describe: 'create book  api cors',
        url: saveBookInfoUrl,
        method: METHOD.POST.toLowerCase(),
      },
    ],
    'create book'
  );

  describe(createDescribeTest(METHOD.POST, saveBookInfoUrl), () => {
    test('save book info success', (done) => {
      globalThis.prismaClient.book.create.mockResolvedValue(mockBook);
      expect.hasAssertions();
      globalThis.api
        .post(saveBookInfoUrl)
        .set('Connection', 'keep-alive')
        .field('bookId', mockRequestBook.book_id)
        .field('name', mockRequestBook.name)
        .field('publishedTime', mockRequestBook.published_time)
        .field('publishedDay', mockRequestBook.published_day)
        .field('categoryId', mockRequestBook.category_id)
        .field('imageNames', `${mockRequestBook.name}1.png`)
        .field('imageNames', `${mockRequestBook.name}2.png`)
        .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
        .attach('images', getStaticFile('/images/application.png'), { contentType: 'image/png' })
        .attach('images', getStaticFile('/images/application.png'), { contentType: 'image/png' })
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.CREATED)
        .then((response) => {
          expect(globalThis.prismaClient.book.create).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.book.create).toHaveBeenCalledWith({
            data: {
              book_id: mockRequestBook.book_id,
              name: mockRequestBook.name,
              avatar: expect.any(String),
              published_time: mockRequestBook.published_time,
              published_day: mockRequestBook.published_day,
              category_id: mockRequestBook.category_id,
              book_image: {
                create: [
                  {
                    image: expect.any(String),
                    name: `${mockRequestBook.name}1.png`,
                  },
                  {
                    image: expect.any(String),
                    name: `${mockRequestBook.name}2.png`,
                  },
                ],
              },
            },
          });
          expect(response.body).toEqual({
            message: BOOK.BOOK_CREATED,
          });
          done();
        });
    });

    test('save book info failed with request body are empty', (done) => {
      globalThis.prismaClient.book.create.mockResolvedValue(mockBook);

      expect.hasAssertions();
      globalThis.api
        .post(saveBookInfoUrl)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.book.create).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: COMMON.FILE_IS_EMPTY,
          });
          done();
        });
    });

    test('save book info failed with request files are missing', (done) => {
      globalThis.prismaClient.book.create.mockResolvedValue(mockBook);

      expect.hasAssertions();
      globalThis.api
        .post(saveBookInfoUrl)
        .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.book.create).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: COMMON.FIELD_NOT_PROVIDE.format('images'),
          });
          done();
        });
    });

    test('save book info failed with avatar file do not provide', (done) => {
      globalThis.prismaClient.book.create.mockResolvedValue(mockBook);

      expect.hasAssertions();
      globalThis.api
        .post(saveBookInfoUrl)
        .set('Connection', 'keep-alive')
        .field('bookId', mockRequestBook.book_id)
        .field('name', mockRequestBook.name)
        .field('publishedTime', mockRequestBook.published_time)
        .field('publishedDay', mockRequestBook.published_day)
        .field('imageNames', `${mockRequestBook.name}1.png`)
        .field('imageNames', `${mockRequestBook.name}2.png`)
        .field('categoryId', mockRequestBook.category_id)
        .attach('images', getStaticFile('/images/application.png'), { contentType: 'image/png' })
        .attach('images', getStaticFile('/images/application.png'), { contentType: 'image/png' })
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.book.create).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: COMMON.FIELD_NOT_PROVIDE.format('avatar'),
          });
          done();
        });
    });

    test('save book info failed with avatar is empty file', (done) => {
      globalThis.prismaClient.book.create.mockResolvedValue(mockBook);

      expect.hasAssertions();
      globalThis.api
        .post(saveBookInfoUrl)
        .set('Connection', 'keep-alive')
        .field('bookId', mockRequestBook.book_id)
        .field('name', mockRequestBook.name)
        .field('publishedTime', mockRequestBook.published_time)
        .field('publishedDay', mockRequestBook.published_day)
        .field('imageNames', `${mockRequestBook.name}1.png`)
        .field('imageNames', `${mockRequestBook.name}2.png`)
        .field('categoryId', mockRequestBook.category_id)
        .attach('avatar', getStaticFile('/images/empty.png'), { contentType: 'image/png' })
        .attach('images', getStaticFile('/images/application.png'), { contentType: 'image/png' })
        .attach('images', getStaticFile('/images/application.png'), { contentType: 'image/png' })
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.book.create).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: COMMON.FILE_FIELD_EMPTY.format('avatar'),
          });
          done();
        });
    });

    test('save book info failed with avatar is not image file', (done) => {
      globalThis.prismaClient.book.create.mockResolvedValue(mockBook);

      expect.hasAssertions();
      globalThis.api
        .post(saveBookInfoUrl)
        .set('Connection', 'keep-alive')
        .field('bookId', mockRequestBook.book_id)
        .field('name', mockRequestBook.name)
        .field('publishedTime', mockRequestBook.published_time)
        .field('publishedDay', mockRequestBook.published_day)
        .field('imageNames', `${mockRequestBook.name}1.png`)
        .field('imageNames', `${mockRequestBook.name}2.png`)
        .field('categoryId', mockRequestBook.category_id)
        .attach('avatar', getStaticFile('/pdf/empty-pdf.pdf'), { contentType: 'image/png' })
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.book.create).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: COMMON.FILE_NOT_IMAGE,
          });
          done();
        });
    });

    test('save book info failed with image file is empty file', (done) => {
      globalThis.prismaClient.book.create.mockResolvedValue(mockBook);

      expect.hasAssertions();
      globalThis.api
        .post(saveBookInfoUrl)
        .set('Connection', 'keep-alive')
        .field('bookId', mockRequestBook.book_id)
        .field('name', mockRequestBook.name)
        .field('publishedTime', mockRequestBook.published_time)
        .field('publishedDay', mockRequestBook.published_day)
        .field('imageNames', `${mockRequestBook.name}1.png`)
        .field('imageNames', `${mockRequestBook.name}2.png`)
        .field('categoryId', mockRequestBook.category_id)
        .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
        .attach('images', getStaticFile('/images/empty.png'), { contentType: 'image/png' })
        .attach('images', getStaticFile('/images/application.png'), { contentType: 'image/png' })
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.book.create).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: COMMON.FILE_FIELD_EMPTY.format('images'),
          });
          done();
        });
    });

    test('save book info failed with image is not image file', (done) => {
      globalThis.prismaClient.book.create.mockResolvedValue(mockBook);

      expect.hasAssertions();
      globalThis.api
        .post(saveBookInfoUrl)
        .set('Connection', 'keep-alive')
        .field('bookId', mockRequestBook.book_id)
        .field('name', mockRequestBook.name)
        .field('publishedTime', mockRequestBook.published_time)
        .field('publishedDay', mockRequestBook.published_day)
        .field('imageNames', `${mockRequestBook.name}1.png`)
        .field('imageNames', `${mockRequestBook.name}2.png`)
        .field('categoryId', mockRequestBook.category_id)
        .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
        .attach('images', getStaticFile('pdf/empty-pdf.pdf'))
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.book.create).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: COMMON.FILE_NOT_IMAGE,
          });
          done();
        });
    });

    test('save book info failed with image do not provide', (done) => {
      globalThis.prismaClient.book.create.mockResolvedValue(mockBook);

      expect.hasAssertions();
      globalThis.api
        .post(saveBookInfoUrl)
        .set('Connection', 'keep-alive')
        .field('bookId', mockRequestBook.book_id)
        .field('name', mockRequestBook.name)
        .field('publishedTime', mockRequestBook.published_time)
        .field('publishedDay', mockRequestBook.published_day)
        .field('imageNames', `${mockRequestBook.name}1.png`)
        .field('imageNames', `${mockRequestBook.name}2.png`)
        .field('categoryId', mockRequestBook.category_id)
        .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.book.create).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: COMMON.FIELD_NOT_PROVIDE.format('images'),
          });
          done();
        });
    });

    test('save book info failed with request body are missing', (done) => {
      // missing categoryId
      globalThis.prismaClient.book.create.mockResolvedValue(mockBook);

      expect.hasAssertions();
      globalThis.api
        .post(saveBookInfoUrl)
        .field('bookId', mockRequestBook.book_id)
        .field('name', mockRequestBook.name)
        .field('publishedTime', mockRequestBook.published_time)
        .field('publishedDay', mockRequestBook.published_day)
        .field('imageNames', `${mockRequestBook.name}1.png`)
        .field('imageNames', `${mockRequestBook.name}2.png`)
        .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
        .attach('images', getStaticFile('/images/application.png'), { contentType: 'image/png' })
        .attach('images', getStaticFile('/images/application.png'), { contentType: 'image/png' })
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.book.create).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: getInputValidateMessage(BOOK.CREATE_BOOK_FAIL),
            errors: expect.any(Array),
          });
          expect(response.body.errors).toHaveLength(1);
          done();
        });
    });

    test('save book info failed with undefine request body field', (done) => {
      // categoryIds do not define.
      const undefineField = 'categoryIds';
      globalThis.prismaClient.book.create.mockResolvedValue(mockBook);

      expect.hasAssertions();
      globalThis.api
        .post(saveBookInfoUrl)
        .field('bookId', mockRequestBook.book_id)
        .field('name', mockRequestBook.name)
        .field('publishedTime', mockRequestBook.published_time)
        .field('publishedDay', mockRequestBook.published_day)
        .field('imageNames', `${mockRequestBook.name}1.png`)
        .field('imageNames', `${mockRequestBook.name}2.png`)
        .field('categoryId', mockRequestBook.category_id)
        .field(undefineField, [Date.now().toString()])
        .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
        .attach('images', getStaticFile('/images/application.png'), { contentType: 'image/png' })
        .attach('images', getStaticFile('/images/application.png'), { contentType: 'image/png' })
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.book.create).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: getInputValidateMessage(BOOK.CREATE_BOOK_FAIL),
            errors: expect.any(Array),
          });
          (expect(response.body.errors.length).toBeGreaterThanOrEqual(1),
            expect(response.body.errors).toEqual(
              expect.arrayContaining([expect.stringContaining(COMMON.FIELD_NOT_EXPECT.format(undefineField))])
            ));
          done();
        });
    });

    test('save book info failed with output validate error', (done) => {
      globalThis.prismaClient.book.create.mockResolvedValue(mockBook);
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));

      expect.hasAssertions();
      globalThis.api
        .post(saveBookInfoUrl)
        .field('bookId', mockRequestBook.book_id)
        .field('name', mockRequestBook.name)
        .field('publishedTime', mockRequestBook.published_time)
        .field('publishedDay', mockRequestBook.published_day)
        .field('imageNames', `${mockRequestBook.name}1.png`)
        .field('imageNames', `${mockRequestBook.name}2.png`)
        .field('categoryId', mockRequestBook.category_id)
        .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
        .attach('images', getStaticFile('/images/application.png'), { contentType: 'image/png' })
        .attach('images', getStaticFile('/images/application.png'), { contentType: 'image/png' })
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.book.create).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.book.create).toHaveBeenCalledWith({
            data: {
              book_id: mockRequestBook.book_id,
              name: mockRequestBook.name,
              avatar: expect.any(String),
              published_time: mockRequestBook.published_time,
              published_day: mockRequestBook.published_day,
              category_id: mockRequestBook.category_id,
              book_image: {
                create: [
                  {
                    image: expect.any(String),
                    name: `${mockRequestBook.name}1.png`,
                  },
                  {
                    image: expect.any(String),
                    name: `${mockRequestBook.name}2.png`,
                  },
                ],
              },
            },
          });
          expect(response.body).toEqual({
            message: COMMON.OUTPUT_VALIDATE_FAIL,
          });
          done();
        });
    });

    test('save book info failed with server error', (done) => {
      globalThis.prismaClient.book.create.mockRejectedValue(ServerError);

      expect.hasAssertions();
      globalThis.api
        .post(saveBookInfoUrl)
        .field('bookId', mockRequestBook.book_id)
        .field('name', mockRequestBook.name)
        .field('publishedTime', mockRequestBook.published_time)
        .field('publishedDay', mockRequestBook.published_day)
        .field('imageNames', `${mockRequestBook.name}1.png`)
        .field('imageNames', `${mockRequestBook.name}2.png`)
        .field('categoryId', mockRequestBook.category_id)
        .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
        .attach('images', getStaticFile('/images/application.png'), { contentType: 'image/png' })
        .attach('images', getStaticFile('/images/application.png'), { contentType: 'image/png' })
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.SERVER_ERROR)
        .then((response) => {
          expect(globalThis.prismaClient.book.create).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.book.create).toHaveBeenCalledWith({
            data: {
              book_id: mockRequestBook.book_id,
              name: mockRequestBook.name,
              avatar: expect.any(String),
              published_time: mockRequestBook.published_time,
              published_day: mockRequestBook.published_day,
              category_id: mockRequestBook.category_id,
              book_image: {
                create: [
                  {
                    image: expect.any(String),
                    name: `${mockRequestBook.name}1.png`,
                  },
                  {
                    image: expect.any(String),
                    name: `${mockRequestBook.name}2.png`,
                  },
                ],
              },
            },
          });
          expect(response.body).toEqual({
            message: COMMON.INTERNAL_ERROR_MESSAGE,
          });
          done();
        });
    });
  });

  commonTest(
    'save pdf file api common test',
    [
      {
        name: 'cors test',
        describe: 'save pdf file api cors',
        url: savePdfFileUrl,
        method: METHOD.POST.toLowerCase(),
      },
    ],
    'save pdf file'
  );

  describe(createDescribeTest(METHOD.POST, savePdfFileUrl), () => {
    test('save pfd file success', (done) => {
      globalThis.prismaClient.book.update.mockResolvedValue(mockBook);

      expect.hasAssertions();
      globalThis.api
        .post(savePdfFileUrl)
        .field('bookId', mockRequestBook.book_id)
        .field('name', mockRequestBook.name)
        .attach('pdf', getStaticFile('/pdf/pdf-test.pdf'), { contentType: 'application/pdf' })
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.CREATED)
        .then((response) => {
          expect(globalThis.prismaClient.book.update).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.book.update).toHaveBeenCalledWith({
            where: {
              book_id: mockRequestBook.book_id,
            },
            data: {
              pdf: expect.any(String),
            },
          });
          expect(response.body).toEqual({
            message: BOOK.PDF_SAVED,
          });
          done();
        });
    });

    test.each([
      {
        describe: 'book not found',
        cause: PrismaNotFoundError,
        expected: {
          message: BOOK.BOOK_NOT_FOUND,
        },
        status: HTTP_CODE.NOT_FOUND,
      },
      {
        describe: 'server error',
        cause: ServerError,
        expected: {
          message: COMMON.INTERNAL_ERROR_MESSAGE,
        },
        status: HTTP_CODE.SERVER_ERROR,
      },
    ])('save pdf file failed with $describe', ({ cause, expected, status }, done) => {
      globalThis.prismaClient.book.update.mockRejectedValue(cause);

      expect.hasAssertions();
      globalThis.api
        .post(savePdfFileUrl)
        .field('bookId', mockRequestBook.book_id)
        .field('name', mockRequestBook.name)
        .attach('pdf', getStaticFile('/pdf/pdf-test.pdf'), { contentType: 'application/pdf' })
        .expect('Content-Type', /application\/json/)
        .expect(status)
        .then((response) => {
          expect(globalThis.prismaClient.book.update).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.book.update).toHaveBeenCalledWith({
            where: {
              book_id: mockRequestBook.book_id,
            },
            data: {
              pdf: expect.any(String),
            },
          });
          expect(response.body).toEqual(expected);
          done();
        });
    });

    test('save pfd file failed with request data are empty', (done) => {
      expect.hasAssertions();
      globalThis.api
        .post(savePdfFileUrl)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.book.update).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: getInputValidateMessage(BOOK.SAVE_PDF_FAIL),
            errors: [COMMON.REQUEST_DATA_EMPTY],
          });
          done();
        });
    });

    test('save pfd file failed with request data are missing field', (done) => {
      // missing bookId
      expect.hasAssertions();
      globalThis.api
        .post(savePdfFileUrl)
        .field('name', mockRequestBook.name)
        .attach('pdf', getStaticFile('/pdf/pdf-test.pdf'), { contentType: 'application/pdf' })
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.book.update).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: getInputValidateMessage(BOOK.SAVE_PDF_FAIL),
            errors: expect.any(Array),
          });
          expect(response.body.errors).toHaveLength(1);
          done();
        });
    });

    test('save pfd file failed with undefine request data field', (done) => {
      // bookIds do not define.
      const undefineField = 'bookIds';

      expect.hasAssertions();
      globalThis.api
        .post(savePdfFileUrl)
        .field(undefineField, [Date.now().toString()])
        .field('bookId', mockRequestBook.book_id)
        .field('name', mockRequestBook.name)
        .attach('pdf', getStaticFile('/pdf/pdf-test.pdf'), { contentType: 'application/pdf' })
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.book.update).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: getInputValidateMessage(BOOK.SAVE_PDF_FAIL),
            errors: expect.arrayContaining([expect.stringContaining(COMMON.FIELD_NOT_EXPECT.format(undefineField))]),
          });
          done();
        });
    });

    test('save pfd file failed with request files are missing field', (done) => {
      // missing pdf file
      expect.hasAssertions();
      globalThis.api
        .post(savePdfFileUrl)
        .field('bookId', mockRequestBook.book_id)
        .field('name', mockRequestBook.name)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.book.update).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: COMMON.FIELD_NOT_PROVIDE.format('pdf'),
          });
          done();
        });
    });

    test('save pfd file failed with pdf is empty file', (done) => {
      expect.hasAssertions();
      globalThis.api
        .post(savePdfFileUrl)
        .field('bookId', mockRequestBook.book_id)
        .field('name', mockRequestBook.name)
        .attach('pdf', getStaticFile('/pdf/empty-pdf.pdf'))
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.book.update).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: COMMON.FILE_IS_EMPTY,
          });
          done();
        });
    });

    test('save pfd file failed with pdf is not pdf file', (done) => {
      expect.hasAssertions();
      globalThis.api
        .post(savePdfFileUrl)
        .set('Connection', 'keep-alive')
        .field('bookId', mockRequestBook.book_id)
        .field('name', mockRequestBook.name)
        .attach('pdf', getStaticFile('/images/application.png'))
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.book.update).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: COMMON.FILE_NOT_PDF,
          });
          done();
        });
    });

    test('save pfd file failed with output validate error', (done) => {
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));
      globalThis.prismaClient.book.update.mockResolvedValue(mockBook);

      expect.hasAssertions();
      globalThis.api
        .post(savePdfFileUrl)
        .field('bookId', mockRequestBook.book_id)
        .field('name', mockRequestBook.name)
        .attach('pdf', getStaticFile('/pdf/pdf-test.pdf'))
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.book.update).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.book.update).toHaveBeenCalledWith({
            where: {
              book_id: mockRequestBook.book_id,
            },
            data: {
              pdf: expect.any(String),
            },
          });
          expect(response.body).toEqual({
            message: COMMON.OUTPUT_VALIDATE_FAIL,
          });
          done();
        });
    });
  });

  commonTest(
    'save book author api common test',
    [
      {
        name: 'cors test',
        describe: 'save book author api cors',
        url: savePdfFileUrl,
        method: METHOD.POST.toLowerCase(),
      },
    ],
    'save book author'
  );

  describe(createDescribeTest(METHOD.POST, saveBookAuthorUrl), () => {
    test('save book author success', (done) => {
      const dataInsert = createDataInsert(requestBody);

      expect.hasAssertions();
      globalThis.api
        .post(saveBookAuthorUrl)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.CREATED)
        .send({
          authors: requestBody,
        })
        .then((response) => {
          expect(globalThis.prismaClient.book_author.createMany).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.book_author.createMany).toHaveBeenCalledWith({
            data: dataInsert,
          });
          expect(globalThis.prismaClient.book_author.deleteMany).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.book_author.deleteMany).toHaveBeenCalledWith({
            where: {
              book_id: requestBody[0].bookId,
            },
          });
          expect(response.body).toEqual({
            message: BOOK.CREATE_BOOK_AUTHOR_SUCCESS,
          });
          done();
        });
    });

    test('save book author failed with request body are empty', (done) => {
      expect.hasAssertions();
      globalThis.api
        .post(saveBookAuthorUrl)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .send({})
        .then((response) => {
          expect(globalThis.prismaClient.book_author.createMany).not.toHaveBeenCalled();
          expect(globalThis.prismaClient.book_author.deleteMany).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: getInputValidateMessage(BOOK.SAVE_BOOK_AUTHOR_FAIL),
            errors: [COMMON.REQUEST_DATA_EMPTY],
          });
          done();
        });
    });

    test('save book author failed with undefine request body field', (done) => {
      // author is undefine field.
      const undefineField = 'author';
      expect.hasAssertions();
      globalThis.api
        .post(saveBookAuthorUrl)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .send({
          [undefineField]: [],
        })
        .then((response) => {
          expect(globalThis.prismaClient.book_author.createMany).not.toHaveBeenCalled();
          expect(globalThis.prismaClient.book_author.deleteMany).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: getInputValidateMessage(BOOK.SAVE_BOOK_AUTHOR_FAIL),
            errors: expect.arrayContaining([expect.stringContaining(COMMON.FIELD_NOT_EXPECT.format(undefineField))]),
          });
          done();
        });
    });

    test('save book author failed with deleteMany method get server error', (done) => {
      globalThis.prismaClient.book_author.deleteMany.mockRejectedValue(ServerError);

      expect.hasAssertions();
      globalThis.api
        .post(saveBookAuthorUrl)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.SERVER_ERROR)
        .send({
          authors: requestBody,
        })
        .then((response) => {
          expect(globalThis.prismaClient.book_author.createMany).not.toHaveBeenCalled();
          expect(globalThis.prismaClient.book_author.deleteMany).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.book_author.deleteMany).toHaveBeenCalledWith({
            where: {
              book_id: requestBody[0].bookId,
            },
          });
          expect(response.body).toEqual({
            message: COMMON.INTERNAL_ERROR_MESSAGE,
          });
          done();
        });
    });

    test('save book author failed with createMany method get server error', (done) => {
      globalThis.prismaClient.book_author.createMany.mockRejectedValue(ServerError);
      globalThis.prismaClient.book_author.deleteMany.mockReset();

      const dataInsert = createDataInsert(requestBody);

      expect.hasAssertions();
      globalThis.api
        .post(saveBookAuthorUrl)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.SERVER_ERROR)
        .send({
          authors: requestBody,
        })
        .then((response) => {
          expect(globalThis.prismaClient.book_author.createMany).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.book_author.createMany).toHaveBeenCalledWith({
            data: dataInsert,
          });
          expect(globalThis.prismaClient.book_author.deleteMany).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.book_author.deleteMany).toHaveBeenCalledWith({
            where: {
              book_id: requestBody[0].bookId,
            },
          });
          expect(response.body).toEqual({
            message: COMMON.INTERNAL_ERROR_MESSAGE,
          });
          done();
        });
    });

    test('save book author failed with output validate error', (done) => {
      globalThis.prismaClient.book_author.createMany.mockReset();
      globalThis.prismaClient.book_author.deleteMany.mockReset();

      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));
      const dataInsert = createDataInsert(requestBody);

      expect.hasAssertions();
      globalThis.api
        .post(saveBookAuthorUrl)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .send({
          authors: requestBody,
        })
        .then((response) => {
          expect(globalThis.prismaClient.book_author.createMany).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.book_author.createMany).toHaveBeenCalledWith({
            data: dataInsert,
          });
          expect(globalThis.prismaClient.book_author.deleteMany).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.book_author.deleteMany).toHaveBeenCalledWith({
            where: {
              book_id: requestBody[0].bookId,
            },
          });
          expect(response.body).toEqual({
            message: COMMON.OUTPUT_VALIDATE_FAIL,
          });
          done();
        });
    });
  });
});
