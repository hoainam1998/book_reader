const fs = require('fs');
const { ServerError } = require('#test/mocks/other-errors');
const { PrismaNotFoundError } = require('#test/mocks/prisma-error');
const RedisClient = require('#services/redis-client/redis');
const AuthorDummyData = require('#test/resources/dummy-data/author');
const OutputValidate = require('#services/output-validate');
const ErrorCode = require('#services/error-code');
const AuthorRoutePath = require('#services/route-paths/author');
const { HTTP_CODE, METHOD, PATH, PUBLIC_PATH, REDIS_KEYS } = require('#constants');
const { USER, COMMON, AUTHOR } = require('#messages');
const { authenticationToken, sessionData, signedTestCookie, destroySession } = require('#test/resources/auth');
const commonTest = require('#test/apis/common/common');
const { getInputValidateMessage, createDescribeTest } = require('#test/helpers/index');
const mockAuthor = AuthorDummyData.MockData;
const mockRequestAuthor = AuthorDummyData.MockRequestData;
const deleteAuthorUrl = `${AuthorRoutePath.delete.abs}/${mockRequestAuthor.author_id}`;

describe('delete author', () => {
  commonTest(
    'delete author api common test',
    [
      {
        name: 'url test',
        describe: 'url is invalid',
        url: `${PATH.AUTHOR}/unknown`,
        method: METHOD.DELETE.toLowerCase(),
      },
      {
        name: 'method test',
        describe: 'method not allowed',
        url: deleteAuthorUrl,
        method: METHOD.GET.toLowerCase(),
      },
      {
        name: 'cors test',
        describe: 'delete author api cors',
        url: deleteAuthorUrl,
        method: METHOD.DELETE.toLowerCase(),
        origin: process.env.ORIGIN_CORS,
      },
    ],
    'delete author common test'
  );

  describe(createDescribeTest(METHOD.DELETE, deleteAuthorUrl), () => {
    test('delete author success', (done) => {
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());
      globalThis.prismaClient.author.findUniqueOrThrow.mockResolvedValue(mockAuthor);

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .delete(deleteAuthorUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.OK)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            const storyFile = mockAuthor.story.split(',');
            expect(globalThis.prismaClient.author.findUniqueOrThrow).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.author.findUniqueOrThrow).toHaveBeenCalledWith({
              where: {
                author_id: mockRequestAuthor.author_id,
              },
              select: {
                story: true,
              },
            });
            expect(unLink).toHaveBeenCalledTimes(2);
            expect(unLink.mock.calls).toEqual([
              [expect.stringContaining(`${PUBLIC_PATH}${storyFile[0].trim()}`), expect.any(Function)],
              [expect.stringContaining(`${PUBLIC_PATH}${storyFile[1].trim()}`), expect.any(Function)],
            ]);
            expect(globalThis.prismaClient.author.update).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.author.update).toHaveBeenCalledWith({
              where: {
                author_id: mockRequestAuthor.author_id,
              },
              data: {
                book_author: {
                  deleteMany: {},
                },
              },
            });
            expect(globalThis.prismaClient.author.delete).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.author.delete).toHaveBeenCalledWith({
              where: {
                author_id: mockRequestAuthor.author_id,
              },
            });
            expect(RedisClient.Instance.Client.del).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.del).toHaveBeenCalledWith(REDIS_KEYS.AUTHORS);
            expect(response.body).toEqual({
              message: AUTHOR.DELETE_AUTHOR_SUCCESS,
            });
            done();
          });
      });
    });

    test('delete author failed authentication token unset', (done) => {
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());
      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .delete(deleteAuthorUrl)
          .set('Cookie', responseSign.header['set-cookie'])
          .expect(HTTP_CODE.UNAUTHORIZED)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.author.findUniqueOrThrow).not.toHaveBeenCalled();
            expect(unLink).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.author.update).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.author.delete).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: USER.USER_UNAUTHORIZED,
              errorCode: ErrorCode.HAVE_NOT_LOGIN,
            });
            done();
          });
      });
    });

    test('delete author failed session expired', (done) => {
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());
      expect.hasAssertions();
      destroySession().then((responseSign) => {
        globalThis.api
          .delete(deleteAuthorUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect(HTTP_CODE.UNAUTHORIZED)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            expect(globalThis.prismaClient.author.findUniqueOrThrow).not.toHaveBeenCalled();
            expect(unLink).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.author.update).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.author.delete).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: USER.WORKING_SESSION_EXPIRE,
              errorCode: ErrorCode.WORKING_SESSION_ENDED,
            });
            done();
          });
      });
    });

    test('delete author failed with invalid request param', (done) => {
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());
      const newDeleteAuthorUrl = `${PATH.AUTHOR}/delete/unknown`;

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .delete(newDeleteAuthorUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect(HTTP_CODE.BAD_REQUEST)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.author.findUniqueOrThrow).not.toHaveBeenCalled();
            expect(unLink).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.author.update).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.author.delete).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(AUTHOR.DELETE_AUTHOR_FAIL),
              errors: expect.arrayContaining([expect.any(String)]),
            });
            done();
          });
      });
    });

    test('delete author failed with output validate error', (done) => {
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .delete(deleteAuthorUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect(HTTP_CODE.BAD_REQUEST)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            const storyFile = mockAuthor.story.split(',');
            expect(globalThis.prismaClient.author.findUniqueOrThrow).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.author.findUniqueOrThrow).toHaveBeenCalledWith({
              where: {
                author_id: mockRequestAuthor.author_id,
              },
              select: {
                story: true,
              },
            });
            expect(unLink).toHaveBeenCalledTimes(2);
            expect(unLink.mock.calls).toEqual([
              [expect.stringContaining(`${PUBLIC_PATH}${storyFile[0].trim()}`), expect.any(Function)],
              [expect.stringContaining(`${PUBLIC_PATH}${storyFile[1].trim()}`), expect.any(Function)],
            ]);
            expect(globalThis.prismaClient.author.update).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.author.update).toHaveBeenCalledWith({
              where: {
                author_id: mockRequestAuthor.author_id,
              },
              data: {
                book_author: {
                  deleteMany: {},
                },
              },
            });
            expect(globalThis.prismaClient.author.delete).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.author.delete).toHaveBeenCalledWith({
              where: {
                author_id: mockRequestAuthor.author_id,
              },
            });
            expect(RedisClient.Instance.Client.del).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.del).toHaveBeenCalledWith(REDIS_KEYS.AUTHORS);
            expect(response.body).toEqual({
              message: COMMON.OUTPUT_VALIDATE_FAIL,
            });
            done();
          });
      });
    });

    test('delete author failed with del method got server error', (done) => {
      RedisClient.Instance.Client.del.mockRejectedValue(ServerError);
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .delete(deleteAuthorUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect(HTTP_CODE.SERVER_ERROR)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            const storyFile = mockAuthor.story.split(',');
            expect(globalThis.prismaClient.author.findUniqueOrThrow).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.author.findUniqueOrThrow).toHaveBeenCalledWith({
              where: {
                author_id: mockRequestAuthor.author_id,
              },
              select: {
                story: true,
              },
            });
            expect(unLink).toHaveBeenCalledTimes(2);
            expect(unLink.mock.calls).toEqual([
              [expect.stringContaining(`${PUBLIC_PATH}${storyFile[0].trim()}`), expect.any(Function)],
              [expect.stringContaining(`${PUBLIC_PATH}${storyFile[1].trim()}`), expect.any(Function)],
            ]);
            expect(globalThis.prismaClient.author.update).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.author.update).toHaveBeenCalledWith({
              where: {
                author_id: mockRequestAuthor.author_id,
              },
              data: {
                book_author: {
                  deleteMany: {},
                },
              },
            });
            expect(globalThis.prismaClient.author.delete).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.author.delete).toHaveBeenCalledWith({
              where: {
                author_id: mockRequestAuthor.author_id,
              },
            });
            expect(RedisClient.Instance.Client.del).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.del).toHaveBeenCalledWith(REDIS_KEYS.AUTHORS);
            expect(response.body).toEqual({
              message: COMMON.INTERNAL_ERROR_MESSAGE,
            });
            done();
          });
      });
    });

    test.each([
      {
        describe: 'server error',
        cause: ServerError,
        expected: {
          message: COMMON.INTERNAL_ERROR_MESSAGE,
        },
        status: HTTP_CODE.SERVER_ERROR,
      },
      {
        describe: 'not found',
        cause: PrismaNotFoundError,
        expected: {
          message: AUTHOR.AUTHOR_NOT_FOUND,
        },
        status: HTTP_CODE.NOT_FOUND,
      },
    ])('delete author failed with findUniqueOrThrow got $describe', ({ cause, expected, status }, done) => {
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());
      globalThis.prismaClient.author.findUniqueOrThrow.mockRejectedValue(cause);

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .delete(deleteAuthorUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect(status)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            expect(globalThis.prismaClient.author.findUniqueOrThrow).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.author.findUniqueOrThrow).toHaveBeenCalledWith({
              where: {
                author_id: mockRequestAuthor.author_id,
              },
              select: {
                story: true,
              },
            });
            expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
            expect(unLink).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.author.update).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.author.delete).not.toHaveBeenCalled();
            expect(response.body).toEqual(expected);
            done();
          });
      });
    });

    test.each([
      {
        describe: 'server error',
        cause: ServerError,
        expected: {
          message: COMMON.INTERNAL_ERROR_MESSAGE,
        },
        status: HTTP_CODE.SERVER_ERROR,
      },
      {
        describe: 'not found',
        cause: PrismaNotFoundError,
        expected: {
          message: AUTHOR.AUTHOR_NOT_FOUND,
        },
        status: HTTP_CODE.NOT_FOUND,
      },
    ])('delete author failed with update got $describe', ({ cause, expected, status }, done) => {
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());
      globalThis.prismaClient.author.findUniqueOrThrow.mockResolvedValue(mockAuthor);
      globalThis.prismaClient.author.update.mockRejectedValue(cause);

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .delete(deleteAuthorUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect(status)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            const storyFile = mockAuthor.story.split(',');
            expect(globalThis.prismaClient.author.findUniqueOrThrow).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.author.findUniqueOrThrow).toHaveBeenCalledWith({
              where: {
                author_id: mockRequestAuthor.author_id,
              },
              select: {
                story: true,
              },
            });
            expect(unLink).toHaveBeenCalledTimes(2);
            expect(unLink.mock.calls).toEqual([
              [expect.stringContaining(`${PUBLIC_PATH}${storyFile[0].trim()}`), expect.any(Function)],
              [expect.stringContaining(`${PUBLIC_PATH}${storyFile[1].trim()}`), expect.any(Function)],
            ]);
            expect(globalThis.prismaClient.author.update).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.author.update).toHaveBeenCalledWith({
              where: {
                author_id: mockRequestAuthor.author_id,
              },
              data: {
                book_author: {
                  deleteMany: {},
                },
              },
            });
            expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.author.delete).not.toHaveBeenCalled();
            expect(response.body).toEqual(expected);
            done();
          });
      });
    });

    test.each([
      {
        describe: 'server error',
        cause: ServerError,
        expected: {
          message: COMMON.INTERNAL_ERROR_MESSAGE,
        },
        status: HTTP_CODE.SERVER_ERROR,
      },
      {
        describe: 'not found',
        cause: PrismaNotFoundError,
        expected: {
          message: AUTHOR.AUTHOR_NOT_FOUND,
        },
        status: HTTP_CODE.NOT_FOUND,
      },
    ])('delete author failed with delete got $describe', ({ cause, expected, status }, done) => {
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());
      globalThis.prismaClient.author.findUniqueOrThrow.mockResolvedValue(mockAuthor);
      globalThis.prismaClient.author.update.mockResolvedValue(mockAuthor);
      globalThis.prismaClient.author.delete.mockRejectedValue(cause);

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .delete(deleteAuthorUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect(status)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            const storyFile = mockAuthor.story.split(',');
            expect(globalThis.prismaClient.author.findUniqueOrThrow).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.author.findUniqueOrThrow).toHaveBeenCalledWith({
              where: {
                author_id: mockRequestAuthor.author_id,
              },
              select: {
                story: true,
              },
            });
            expect(unLink).toHaveBeenCalledTimes(2);
            expect(unLink.mock.calls).toEqual([
              [expect.stringContaining(`${PUBLIC_PATH}${storyFile[0].trim()}`), expect.any(Function)],
              [expect.stringContaining(`${PUBLIC_PATH}${storyFile[1].trim()}`), expect.any(Function)],
            ]);
            expect(globalThis.prismaClient.author.update).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.author.update).toHaveBeenCalledWith({
              where: {
                author_id: mockRequestAuthor.author_id,
              },
              data: {
                book_author: {
                  deleteMany: {},
                },
              },
            });
            expect(globalThis.prismaClient.author.delete).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.author.delete).toHaveBeenCalledWith({
              where: {
                author_id: mockRequestAuthor.author_id,
              },
            });
            expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
            expect(response.body).toEqual(expected);
            done();
          });
      });
    });
  });
});
