const fs = require('fs');
const { ServerError } = require('#test/mocks/other-errors');
const { PrismaNotFoundError } = require('#test/mocks/prisma-error');
const RedisClient = require('#services/redis-client/redis');
const ErrorCode = require('#services/error-code');
const BookDummyData = require('#test/resources/dummy-data/book');
const OutputValidate = require('#services/output-validate');
const BookRoutePath = require('#services/route-paths/book');
const { HTTP_CODE, METHOD, PATH, PUBLIC_PATH, REDIS_KEYS } = require('#constants');
const { BOOK, USER, COMMON } = require('#messages');
const { authenticationToken, sessionData, signedTestCookie, destroySession } = require('#test/resources/auth');
const commonTest = require('#test/apis/common/common');
const { getInputValidateMessage, getStaticFile, createDescribeTest } = require('#test/helpers/index');
const updateBookUrl = BookRoutePath.updateBook.abs;
const updateBookInfoUrl = BookRoutePath.updateBookInfo.abs;
const updatePdfFileUrl = BookRoutePath.updatePdf.abs;

const mockBook = BookDummyData.MockData;
const mockRequestBook = BookDummyData.MockRequestData;

describe('update book', () => {
  commonTest(
    'update book api common test',
    [
      {
        name: 'url test',
        describe: 'url is invalid',
        url: `${PATH.BOOK}/unknown`,
        method: METHOD.PUT.toLowerCase(),
      },
      {
        name: 'method test',
        describe: 'method not allowed',
        url: updateBookUrl,
        method: METHOD.GET.toLowerCase(),
      },
      {
        name: 'cors test',
        describe: 'update book api cors',
        url: updateBookUrl,
        method: METHOD.PUT.toLowerCase(),
        origin: process.env.ORIGIN_CORS,
      },
    ],
    'update book common test'
  );

  describe(createDescribeTest(METHOD.POST, updateBookUrl), () => {
    test('update book will be success', (done) => {
      fetch.mockResolvedValue(new Response(JSON.stringify({}), { status: HTTP_CODE.CREATED }));

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .put(updateBookUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('Connection', 'keep-alive')
          .field('bookId', mockRequestBook.book_id)
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
                expect.stringContaining('/update-book-info'),
                expect.objectContaining({
                  method: METHOD.PUT,
                  body: expect.any(FormData),
                }),
              ],
              [
                expect.stringContaining('/update-pdf'),
                expect.objectContaining({
                  method: METHOD.PUT,
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
              message: BOOK.UPDATE_BOOK_SUCCESS,
            });
            done();
          });
      });
    });

    test('update book failed with authentication token not set', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .put(updateBookUrl)
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

    test('update book failed with session expired', (done) => {
      expect.hasAssertions();
      destroySession().then((responseSign) => {
        globalThis.api
          .put(updateBookUrl)
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
          message: BOOK.UPDATE_BOOK_FAIL,
        },
      },
      {
        describe: 'server error',
        status: HTTP_CODE.SERVER_ERROR,
        expected: {
          message: COMMON.INTERNAL_ERROR_MESSAGE,
        },
      },
    ])('update book failed with $describe', ({ status, expected }, done) => {
      fetch.mockResolvedValue(new Response(JSON.stringify(expected), { status }));

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .put(updateBookUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('Connection', 'keep-alive')
          .field('bookId', mockRequestBook.book_id)
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
                expect.stringContaining('/update-book-info'),
                expect.objectContaining({
                  method: METHOD.PUT,
                  body: expect.any(FormData),
                }),
              ],
            ]);
            expect(response.body).toEqual(expected);
            done();
          });
      });
    });

    test('update book failed with request body empty', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .put(updateBookUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.BAD_REQUEST)
          .then((response) => {
            expect(fetch).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(BOOK.UPDATE_BOOK_FAIL),
              errors: [COMMON.REQUEST_DATA_EMPTY],
            });
            done();
          });
      });
    });

    test('update book failed with request body are missing field', (done) => {
      // missing authors
      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .put(updateBookUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .field('bookId', mockRequestBook.book_id)
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
              message: getInputValidateMessage(BOOK.UPDATE_BOOK_FAIL),
              errors: expect.any(Array),
            });
            expect(response.body.errors).toHaveLength(1);
            done();
          });
      });
    });

    test('update book failed with request files are missing field', (done) => {
      // missing images
      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .put(updateBookUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .field('bookId', mockRequestBook.book_id)
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
              message: getInputValidateMessage(BOOK.UPDATE_BOOK_FAIL),
              errors: expect.any(Array),
            });
            expect(response.body.errors.length).toBeGreaterThanOrEqual(1);
            done();
          });
      });
    });

    test('update book failed output validate error', (done) => {
      fetch.mockResolvedValue(new Response(JSON.stringify({}), { status: HTTP_CODE.CREATED }));
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .put(updateBookUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('Connection', 'keep-alive')
          .field('bookId', mockRequestBook.book_id)
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
                expect.stringContaining('/update-book-info'),
                expect.objectContaining({
                  method: METHOD.PUT,
                  body: expect.any(FormData),
                }),
              ],
              [
                expect.stringContaining('/update-pdf'),
                expect.objectContaining({
                  method: METHOD.PUT,
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
    'update book api common test',
    [
      {
        name: 'cors test',
        describe: 'update book  api cors',
        url: updateBookInfoUrl,
        method: METHOD.PUT.toLowerCase(),
      },
    ],
    'update book'
  );

  describe(createDescribeTest(METHOD.POST, updateBookInfoUrl), () => {
    test('update book info success', (done) => {
      globalThis.prismaClient.book.update.mockResolvedValue(mockBook);
      globalThis.prismaClient.book_image.deleteMany.mockResolvedValue();
      globalThis.prismaClient.book_image.createMany.mockResolvedValue();

      expect.hasAssertions();
      globalThis.api
        .put(updateBookInfoUrl)
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
          expect(globalThis.prismaClient.book.update).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.book.update).toHaveBeenCalledWith({
            where: {
              book_id: mockRequestBook.book_id,
            },
            data: {
              name: mockRequestBook.name,
              avatar: expect.any(String),
              published_time: mockRequestBook.published_time,
              published_day: mockRequestBook.published_day,
              category_id: mockRequestBook.category_id,
            },
          });
          expect(RedisClient.Instance.Client.del).toHaveBeenCalledTimes(1);
          expect(RedisClient.Instance.Client.del).toHaveBeenCalledWith(REDIS_KEYS.BOOKS);
          expect(globalThis.prismaClient.book_image.deleteMany).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.book_image.deleteMany).toHaveBeenCalledWith({
            where: {
              book_id: mockRequestBook.book_id,
            },
          });
          expect(globalThis.prismaClient.book_image.createMany).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.book_image.createMany).toHaveBeenCalledWith({
            data: [
              {
                image: expect.any(String),
                name: `${mockRequestBook.name}1.png`,
                book_id: mockRequestBook.book_id,
              },
              {
                image: expect.any(String),
                name: `${mockRequestBook.name}2.png`,
                book_id: mockRequestBook.book_id,
              },
            ],
          });
          expect(response.body).toEqual({
            message: BOOK.BOOK_UPDATED,
          });
          done();
        });
    });

    test('update book info failed with request body are empty', (done) => {
      globalThis.prismaClient.book.update.mockClear();
      globalThis.prismaClient.book_image.deleteMany.mockClear();
      globalThis.prismaClient.book_image.createMany.mockClear();

      expect.hasAssertions();
      globalThis.api
        .put(updateBookInfoUrl)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
          expect(globalThis.prismaClient.book.update).not.toHaveBeenCalled();
          expect(globalThis.prismaClient.book_image.deleteMany).not.toHaveBeenCalled();
          expect(globalThis.prismaClient.book_image.createMany).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: COMMON.FILE_IS_EMPTY,
          });
          done();
        });
    });

    test('update book info failed with request files are missing', (done) => {
      expect.hasAssertions();
      globalThis.api
        .put(updateBookInfoUrl)
        .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.book.update).not.toHaveBeenCalled();
          expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
          expect(globalThis.prismaClient.book_image.deleteMany).not.toHaveBeenCalled();
          expect(globalThis.prismaClient.book_image.createMany).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: COMMON.FIELD_NOT_PROVIDE.format('images'),
          });
          done();
        });
    });

    test('update book info failed with avatar file do not provide', (done) => {
      expect.hasAssertions();
      globalThis.api
        .put(updateBookInfoUrl)
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
          expect(globalThis.prismaClient.book.update).not.toHaveBeenCalled();
          expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
          expect(globalThis.prismaClient.book_image.deleteMany).not.toHaveBeenCalled();
          expect(globalThis.prismaClient.book_image.createMany).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: COMMON.FIELD_NOT_PROVIDE.format('avatar'),
          });
          done();
        });
    });

    test('update book info failed with avatar is empty file', (done) => {
      expect.hasAssertions();
      globalThis.api
        .put(updateBookInfoUrl)
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
          expect(globalThis.prismaClient.book.update).not.toHaveBeenCalled();
          expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
          expect(globalThis.prismaClient.book_image.deleteMany).not.toHaveBeenCalled();
          expect(globalThis.prismaClient.book_image.createMany).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: COMMON.FILE_FIELD_EMPTY.format('avatar'),
          });
          done();
        });
    });

    test('update book info failed with avatar is not image file', (done) => {
      expect.hasAssertions();
      globalThis.api
        .put(updateBookInfoUrl)
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
          expect(globalThis.prismaClient.book.update).not.toHaveBeenCalled();
          expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
          expect(globalThis.prismaClient.book_image.deleteMany).not.toHaveBeenCalled();
          expect(globalThis.prismaClient.book_image.createMany).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: COMMON.FILE_NOT_IMAGE,
          });
          done();
        });
    });

    test('update book info failed with image file is empty file', (done) => {
      expect.hasAssertions();
      globalThis.api
        .put(updateBookInfoUrl)
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
          expect(globalThis.prismaClient.book.update).not.toHaveBeenCalled();
          expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
          expect(globalThis.prismaClient.book_image.deleteMany).not.toHaveBeenCalled();
          expect(globalThis.prismaClient.book_image.createMany).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: COMMON.FILE_FIELD_EMPTY.format('images'),
          });
          done();
        });
    });

    test('update book info failed with image is not image file', (done) => {
      expect.hasAssertions();
      globalThis.api
        .put(updateBookInfoUrl)
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
          expect(globalThis.prismaClient.book.update).not.toHaveBeenCalled();
          expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
          expect(globalThis.prismaClient.book_image.deleteMany).not.toHaveBeenCalled();
          expect(globalThis.prismaClient.book_image.createMany).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: COMMON.FILE_NOT_IMAGE,
          });
          done();
        });
    });

    test('update book info failed with image do not provide', (done) => {
      expect.hasAssertions();
      globalThis.api
        .put(updateBookInfoUrl)
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
          expect(globalThis.prismaClient.book.update).not.toHaveBeenCalled();
          expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
          expect(globalThis.prismaClient.book_image.deleteMany).not.toHaveBeenCalled();
          expect(globalThis.prismaClient.book_image.createMany).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: COMMON.FIELD_NOT_PROVIDE.format('images'),
          });
          done();
        });
    });

    test('update book info failed with request body are missing', (done) => {
      // missing categoryId

      expect.hasAssertions();
      globalThis.api
        .put(updateBookInfoUrl)
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
          expect(globalThis.prismaClient.book.update).not.toHaveBeenCalled();
          expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
          expect(globalThis.prismaClient.book_image.deleteMany).not.toHaveBeenCalled();
          expect(globalThis.prismaClient.book_image.createMany).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: getInputValidateMessage(BOOK.UPDATE_BOOK_FAIL),
            errors: expect.any(Array),
          });
          expect(response.body.errors).toHaveLength(1);
          done();
        });
    });

    test('update book info failed with undefine request body field', (done) => {
      // categoryIds do not define.
      const undefineField = 'categoryIds';

      expect.hasAssertions();
      globalThis.api
        .put(updateBookInfoUrl)
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
          expect(globalThis.prismaClient.book.update).not.toHaveBeenCalled();
          expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
          expect(globalThis.prismaClient.book_image.deleteMany).not.toHaveBeenCalled();
          expect(globalThis.prismaClient.book_image.createMany).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: getInputValidateMessage(BOOK.UPDATE_BOOK_FAIL),
            errors: expect.arrayContaining([expect.stringContaining(COMMON.FIELD_NOT_EXPECT.format(undefineField))]),
          });
          done();
        });
    });

    test('update book info failed with output validate error', (done) => {
      globalThis.prismaClient.book.update.mockResolvedValue(mockBook);
      globalThis.prismaClient.book_image.deleteMany.mockResolvedValue();
      globalThis.prismaClient.book_image.createMany.mockResolvedValue();
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));

      expect.hasAssertions();
      globalThis.api
        .put(updateBookInfoUrl)
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
          expect(globalThis.prismaClient.book.update).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.book.update).toHaveBeenCalledWith({
            where: {
              book_id: mockRequestBook.book_id,
            },
            data: {
              name: mockRequestBook.name,
              avatar: expect.any(String),
              published_time: mockRequestBook.published_time,
              published_day: mockRequestBook.published_day,
              category_id: mockRequestBook.category_id,
            },
          });
          expect(RedisClient.Instance.Client.del).toHaveBeenCalledTimes(1);
          expect(RedisClient.Instance.Client.del).toHaveBeenCalledWith(REDIS_KEYS.BOOKS);
          expect(globalThis.prismaClient.book_image.deleteMany).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.book_image.deleteMany).toHaveBeenCalledWith({
            where: {
              book_id: mockRequestBook.book_id,
            },
          });
          expect(globalThis.prismaClient.book_image.createMany).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.book_image.createMany).toHaveBeenCalledWith({
            data: [
              {
                image: expect.any(String),
                name: `${mockRequestBook.name}1.png`,
                book_id: mockRequestBook.book_id,
              },
              {
                image: expect.any(String),
                name: `${mockRequestBook.name}2.png`,
                book_id: mockRequestBook.book_id,
              },
            ],
          });
          expect(response.body).toEqual({
            message: COMMON.OUTPUT_VALIDATE_FAIL,
          });
          done();
        });
    });

    test('update book info failed with update method get server error', (done) => {
      globalThis.prismaClient.book.update.mockRejectedValue(ServerError);

      expect.hasAssertions();
      globalThis.api
        .put(updateBookInfoUrl)
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
          expect(globalThis.prismaClient.book.update).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.book.update).toHaveBeenCalledWith({
            where: {
              book_id: mockRequestBook.book_id,
            },
            data: {
              name: mockRequestBook.name,
              avatar: expect.any(String),
              published_time: mockRequestBook.published_time,
              published_day: mockRequestBook.published_day,
              category_id: mockRequestBook.category_id,
            },
          });
          expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
          expect(globalThis.prismaClient.book_image.deleteMany).not.toHaveBeenCalled();
          expect(globalThis.prismaClient.book_image.createMany).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: COMMON.INTERNAL_ERROR_MESSAGE,
          });
          done();
        });
    });

    test('update book info failed with del method get server error', (done) => {
      RedisClient.Instance.Client.del.mockRejectedValue(ServerError);
      globalThis.prismaClient.book.update.mockResolvedValue(mockBook);

      expect.hasAssertions();
      globalThis.api
        .put(updateBookInfoUrl)
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
          expect(globalThis.prismaClient.book.update).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.book.update).toHaveBeenCalledWith({
            where: {
              book_id: mockRequestBook.book_id,
            },
            data: {
              name: mockRequestBook.name,
              avatar: expect.any(String),
              published_time: mockRequestBook.published_time,
              published_day: mockRequestBook.published_day,
              category_id: mockRequestBook.category_id,
            },
          });
          expect(RedisClient.Instance.Client.del).toHaveBeenCalledTimes(1);
          expect(RedisClient.Instance.Client.del).toHaveBeenCalledWith(REDIS_KEYS.BOOKS);
          expect(globalThis.prismaClient.book_image.deleteMany).not.toHaveBeenCalled();
          expect(globalThis.prismaClient.book_image.createMany).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: COMMON.INTERNAL_ERROR_MESSAGE,
          });
          done();
        });
    });


    test('update book info failed with deleteMany method get server error', (done) => {
      RedisClient.Instance.Client.del.mockReset();
      globalThis.prismaClient.book.update.mockResolvedValue(mockBook);
      globalThis.prismaClient.book_image.deleteMany.mockRejectedValue(ServerError);

      expect.hasAssertions();
      globalThis.api
        .put(updateBookInfoUrl)
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
          expect(globalThis.prismaClient.book.update).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.book.update).toHaveBeenCalledWith({
            where: {
              book_id: mockRequestBook.book_id,
            },
            data: {
              name: mockRequestBook.name,
              avatar: expect.any(String),
              published_time: mockRequestBook.published_time,
              published_day: mockRequestBook.published_day,
              category_id: mockRequestBook.category_id,
            },
          });
          expect(RedisClient.Instance.Client.del).toHaveBeenCalledTimes(1);
          expect(RedisClient.Instance.Client.del).toHaveBeenCalledWith(REDIS_KEYS.BOOKS);
          expect(globalThis.prismaClient.book_image.deleteMany).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.book_image.deleteMany).toHaveBeenCalledWith({
            where: {
              book_id: mockRequestBook.book_id,
            },
          });
          expect(globalThis.prismaClient.book_image.createMany).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: COMMON.INTERNAL_ERROR_MESSAGE,
          });
          done();
        });
    });

    test('update book info failed with createMany method get server error', (done) => {
      RedisClient.Instance.Client.del.mockClear();
      globalThis.prismaClient.book.update.mockResolvedValue();
      globalThis.prismaClient.book_image.deleteMany.mockResolvedValue();
      globalThis.prismaClient.book_image.createMany.mockRejectedValue(ServerError);

      expect.hasAssertions();
      globalThis.api
        .put(updateBookInfoUrl)
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
          expect(globalThis.prismaClient.book.update).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.book.update).toHaveBeenCalledWith({
            where: {
              book_id: mockRequestBook.book_id,
            },
            data: {
              name: mockRequestBook.name,
              avatar: expect.any(String),
              published_time: mockRequestBook.published_time,
              published_day: mockRequestBook.published_day,
              category_id: mockRequestBook.category_id,
            },
          });
          expect(RedisClient.Instance.Client.del).toHaveBeenCalledTimes(1);
          expect(RedisClient.Instance.Client.del).toHaveBeenCalledWith(REDIS_KEYS.BOOKS);
          expect(globalThis.prismaClient.book_image.deleteMany).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.book_image.deleteMany).toHaveBeenCalledWith({
            where: {
              book_id: mockRequestBook.book_id,
            },
          });
          expect(globalThis.prismaClient.book_image.createMany).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.book_image.createMany).toHaveBeenCalledWith({
            data: [
              {
                image: expect.any(String),
                name: `${mockRequestBook.name}1.png`,
                book_id: mockRequestBook.book_id,
              },
              {
                image: expect.any(String),
                name: `${mockRequestBook.name}2.png`,
                book_id: mockRequestBook.book_id,
              },
            ],
          });
          expect(response.body).toEqual({
            message: COMMON.INTERNAL_ERROR_MESSAGE,
          });
          done();
        });
    });

    test('update book info failed with update method get not found error', (done) => {
      globalThis.prismaClient.book.update.mockRejectedValue(PrismaNotFoundError);
      globalThis.prismaClient.book_image.deleteMany.mockResolvedValue();
      globalThis.prismaClient.book_image.createMany.mockResolvedValue();

      expect.hasAssertions();
      globalThis.api
        .put(updateBookInfoUrl)
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
        .expect(HTTP_CODE.NOT_FOUND)
        .then((response) => {
          expect(globalThis.prismaClient.book.update).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.book.update).toHaveBeenCalledWith({
            where: {
              book_id: mockRequestBook.book_id,
            },
            data: {
              name: mockRequestBook.name,
              avatar: expect.any(String),
              published_time: mockRequestBook.published_time,
              published_day: mockRequestBook.published_day,
              category_id: mockRequestBook.category_id,
            },
          });
          expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
          expect(globalThis.prismaClient.book_image.deleteMany).not.toHaveBeenCalled();
          expect(globalThis.prismaClient.book_image.createMany).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: BOOK.BOOK_NOT_FOUND,
          });
          done();
        });
    });

    test('update book info failed with deleteMany method get not found error', (done) => {
      globalThis.prismaClient.book.update.mockResolvedValue();
      globalThis.prismaClient.book_image.deleteMany.mockRejectedValue(PrismaNotFoundError);
      globalThis.prismaClient.book_image.createMany.mockResolvedValue();

      expect.hasAssertions();
      globalThis.api
        .put(updateBookInfoUrl)
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
        .expect(HTTP_CODE.NOT_FOUND)
        .then((response) => {
          expect(globalThis.prismaClient.book.update).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.book.update).toHaveBeenCalledWith({
            where: {
              book_id: mockRequestBook.book_id,
            },
            data: {
              name: mockRequestBook.name,
              avatar: expect.any(String),
              published_time: mockRequestBook.published_time,
              published_day: mockRequestBook.published_day,
              category_id: mockRequestBook.category_id,
            },
          });
          expect(RedisClient.Instance.Client.del).toHaveBeenCalledTimes(1);
          expect(RedisClient.Instance.Client.del).toHaveBeenCalledWith(REDIS_KEYS.BOOKS);
          expect(globalThis.prismaClient.book_image.deleteMany).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.book_image.deleteMany).toHaveBeenCalledWith({
            where: {
              book_id: mockRequestBook.book_id,
            },
          });
          expect(globalThis.prismaClient.book_image.createMany).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: BOOK.BOOK_NOT_FOUND,
          });
          done();
        });
    });

    test('update book info failed with createMany method get not found error', (done) => {
      globalThis.prismaClient.book.update.mockResolvedValue();
      globalThis.prismaClient.book_image.deleteMany.mockResolvedValue();
      globalThis.prismaClient.book_image.createMany.mockRejectedValue(PrismaNotFoundError);

      expect.hasAssertions();
      globalThis.api
        .put(updateBookInfoUrl)
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
        .expect(HTTP_CODE.NOT_FOUND)
        .then((response) => {
          expect(globalThis.prismaClient.book.update).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.book.update).toHaveBeenCalledWith({
            where: {
              book_id: mockRequestBook.book_id,
            },
            data: {
              name: mockRequestBook.name,
              avatar: expect.any(String),
              published_time: mockRequestBook.published_time,
              published_day: mockRequestBook.published_day,
              category_id: mockRequestBook.category_id,
            },
          });
          expect(globalThis.prismaClient.book_image.deleteMany).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.book_image.deleteMany).toHaveBeenCalledWith({
            where: {
              book_id: mockRequestBook.book_id,
            },
          });
          expect(RedisClient.Instance.Client.del).toHaveBeenCalledTimes(1);
          expect(RedisClient.Instance.Client.del).toHaveBeenCalledWith(REDIS_KEYS.BOOKS);
          expect(globalThis.prismaClient.book_image.createMany).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.book_image.createMany).toHaveBeenCalledWith({
            data: [
              {
                image: expect.any(String),
                name: `${mockRequestBook.name}1.png`,
                book_id: mockRequestBook.book_id,
              },
              {
                image: expect.any(String),
                name: `${mockRequestBook.name}2.png`,
                book_id: mockRequestBook.book_id,
              },
            ],
          });
          expect(response.body).toEqual({
            message: BOOK.BOOK_NOT_FOUND,
          });
          done();
        });
    });
  });

  commonTest(
    'update pdf file api common test',
    [
      {
        name: 'cors test',
        describe: 'update pdf file api cors',
        url: updatePdfFileUrl,
        method: METHOD.PUT.toLowerCase(),
      },
    ],
    'save pdf file'
  );

  describe(createDescribeTest(METHOD.POST, updatePdfFileUrl), () => {
    test('update pdf file success', (done) => {
      globalThis.prismaClient.book.findUniqueOrThrow.mockResolvedValue(mockBook);
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());

      expect.hasAssertions();
      globalThis.api
        .put(updatePdfFileUrl)
        .field('bookId', mockRequestBook.book_id)
        .field('name', mockRequestBook.name)
        .attach('pdf', getStaticFile('/pdf/pdf-test.pdf'), { contentType: 'application/pdf' })
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.CREATED)
        .then((response) => {
          expect(globalThis.prismaClient.book.findUniqueOrThrow).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.book.findUniqueOrThrow).toHaveBeenCalledWith({
            where: {
              book_id: mockRequestBook.book_id,
            },
            select: {
              pdf: true,
            },
          });
          expect(RedisClient.Instance.Client.del).toHaveBeenCalledTimes(1);
          expect(RedisClient.Instance.Client.del).toHaveBeenCalledWith(REDIS_KEYS.BOOKS);
          expect(unLink).toHaveBeenCalledTimes(1);
          expect(unLink).toHaveBeenCalledWith(
            expect.stringContaining(`${PUBLIC_PATH}/${mockRequestBook.pdf}`),
            expect.any(Function)
          );
          expect(response.body).toEqual({
            message: BOOK.PDF_UPDATED,
          });
          done();
        });
    });

    test('do not update pdf file', (done) => {
      globalThis.prismaClient.book.findUniqueOrThrow.mockResolvedValue(mockBook);
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());

      expect.hasAssertions();
      globalThis.api
        .put(updatePdfFileUrl)
        .field('bookId', mockRequestBook.book_id)
        .field('name', 'new_pdf_file')
        .attach('pdf', getStaticFile('/pdf/pdf-test.pdf'), { contentType: 'application/pdf' })
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.CREATED)
        .then((response) => {
          expect(globalThis.prismaClient.book.findUniqueOrThrow).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.book.findUniqueOrThrow).toHaveBeenCalledWith({
            where: {
              book_id: mockRequestBook.book_id,
            },
            select: {
              pdf: true,
            },
          });
          expect(RedisClient.Instance.Client.del).toHaveBeenCalledTimes(1);
          expect(RedisClient.Instance.Client.del).toHaveBeenCalledWith(REDIS_KEYS.BOOKS);
          expect(unLink).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: BOOK.PDF_UPDATED,
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
    ])('update pdf file failed with $describe', ({ cause, expected, status }, done) => {
      globalThis.prismaClient.book.findUniqueOrThrow.mockRejectedValue(cause);
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());

      expect.hasAssertions();
      globalThis.api
        .put(updatePdfFileUrl)
        .field('bookId', mockRequestBook.book_id)
        .field('name', mockRequestBook.name)
        .attach('pdf', getStaticFile('/pdf/pdf-test.pdf'), { contentType: 'application/pdf' })
        .expect('Content-Type', /application\/json/)
        .expect(status)
        .then((response) => {
          expect(globalThis.prismaClient.book.findUniqueOrThrow).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.book.findUniqueOrThrow).toHaveBeenCalledWith({
            where: {
              book_id: mockRequestBook.book_id,
            },
            select: {
              pdf: true,
            },
          });
          expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
          expect(unLink).not.toHaveBeenCalled();
          expect(response.body).toEqual(expected);
          done();
        });
    });

    test('update pdf file failed with del method got server error', (done) => {
      globalThis.prismaClient.book.findUniqueOrThrow.mockResolvedValue(mockBook);
      RedisClient.Instance.Client.del.mockRejectedValue(ServerError);
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());

      expect.hasAssertions();
      globalThis.api
        .put(updatePdfFileUrl)
        .field('bookId', mockRequestBook.book_id)
        .field('name', mockRequestBook.name)
        .attach('pdf', getStaticFile('/pdf/pdf-test.pdf'), { contentType: 'application/pdf' })
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.SERVER_ERROR)
        .then((response) => {
          expect(globalThis.prismaClient.book.findUniqueOrThrow).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.book.findUniqueOrThrow).toHaveBeenCalledWith({
            where: {
              book_id: mockRequestBook.book_id,
            },
            select: {
              pdf: true,
            },
          });
          expect(RedisClient.Instance.Client.del).toHaveBeenCalledTimes(1);
          expect(RedisClient.Instance.Client.del).toHaveBeenCalledWith(REDIS_KEYS.BOOKS);
          expect(unLink).toHaveBeenCalledTimes(1);
          expect(unLink).toHaveBeenCalledWith(
            expect.stringContaining(`${PUBLIC_PATH}/${mockRequestBook.pdf}`),
            expect.any(Function)
          );
          expect(response.body).toEqual({
            message: COMMON.INTERNAL_ERROR_MESSAGE,
          });
          done();
        });
    });

    test('update pdf file failed with request data are empty', (done) => {
      RedisClient.Instance.Client.del.mockReset();
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());

      expect.hasAssertions();
      globalThis.api
        .put(updatePdfFileUrl)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.book.update).not.toHaveBeenCalled();
          expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
          expect(unLink).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: getInputValidateMessage(BOOK.UPDATE_PDF_FAIL),
            errors: [COMMON.REQUEST_DATA_EMPTY],
          });
          done();
        });
    });

    test('update pdf file failed with request data are missing field', (done) => {
      // missing bookId
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());

      expect.hasAssertions();
      globalThis.api
        .put(updatePdfFileUrl)
        .field('name', mockRequestBook.name)
        .attach('pdf', getStaticFile('/pdf/pdf-test.pdf'), { contentType: 'application/pdf' })
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.book.update).not.toHaveBeenCalled();
          expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
          expect(unLink).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: getInputValidateMessage(BOOK.UPDATE_PDF_FAIL),
            errors: expect.any(Array),
          });
          expect(response.body.errors).toHaveLength(1);
          done();
        });
    });

    test('update pdf file failed with undefined request data field', (done) => {
      // bookIds do not define.
      const undefineField = 'bookIds';
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());

      expect.hasAssertions();
      globalThis.api
        .put(updatePdfFileUrl)
        .field(undefineField, Date.now().toString())
        .field('bookId', mockRequestBook.book_id)
        .field('name', mockRequestBook.name)
        .attach('pdf', getStaticFile('/pdf/pdf-test.pdf'), { contentType: 'application/pdf' })
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.book.update).not.toHaveBeenCalled();
          expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
          expect(unLink).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: getInputValidateMessage(BOOK.UPDATE_PDF_FAIL),
            errors: expect.arrayContaining([expect.stringContaining(COMMON.FIELD_NOT_EXPECT.format(undefineField))]),
          });
          done();
        });
    });

    test('update pdf file failed with request files are missing field', (done) => {
      // missing pdf file
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());

      expect.hasAssertions();
      globalThis.api
        .put(updatePdfFileUrl)
        .field('bookId', mockRequestBook.book_id)
        .field('name', mockRequestBook.name)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.book.update).not.toHaveBeenCalled();
          expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
          expect(unLink).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: COMMON.FIELD_NOT_PROVIDE.format('pdf'),
          });
          done();
        });
    });

    test('update pdf file failed with pdf is empty file', (done) => {
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());

      expect.hasAssertions();
      globalThis.api
        .put(updatePdfFileUrl)
        .field('bookId', mockRequestBook.book_id)
        .field('name', mockRequestBook.name)
        .attach('pdf', getStaticFile('/pdf/empty-pdf.pdf'))
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.book.update).not.toHaveBeenCalled();
          expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
          expect(unLink).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: COMMON.FILE_IS_EMPTY,
          });
          done();
        });
    });

    test('update pdf file failed with pdf is not pdf file', (done) => {
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());

      expect.hasAssertions();
      globalThis.api
        .put(updatePdfFileUrl)
        .set('Connection', 'keep-alive')
        .field('bookId', mockRequestBook.book_id)
        .field('name', mockRequestBook.name)
        .attach('pdf', getStaticFile('/images/application.png'))
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.book.update).not.toHaveBeenCalled();
          expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
          expect(unLink).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: COMMON.FILE_NOT_PDF,
          });
          done();
        });
    });

    test('update pdf file failed with output validate error', (done) => {
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());
      globalThis.prismaClient.book.findUniqueOrThrow.mockResolvedValue(mockBook);

      expect.hasAssertions();
      globalThis.api
        .put(updatePdfFileUrl)
        .field('bookId', mockRequestBook.book_id)
        .field('name', mockRequestBook.name)
        .attach('pdf', getStaticFile('/pdf/pdf-test.pdf'))
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.book.findUniqueOrThrow).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.book.findUniqueOrThrow).toHaveBeenCalledWith({
            where: {
              book_id: mockRequestBook.book_id,
            },
            select: {
              pdf: true,
            },
          });
          expect(RedisClient.Instance.Client.del).toHaveBeenCalledTimes(1);
          expect(RedisClient.Instance.Client.del).toHaveBeenCalledWith(REDIS_KEYS.BOOKS);
          expect(unLink).toHaveBeenCalledTimes(1);
          expect(unLink).toHaveBeenCalledWith(
            expect.stringContaining(`${PUBLIC_PATH}/${mockRequestBook.pdf}`),
            expect.any(Function)
          );
          expect(response.body).toEqual({
            message: COMMON.OUTPUT_VALIDATE_FAIL,
          });
          done();
        });
    });
  });
});
