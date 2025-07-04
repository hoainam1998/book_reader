const fs = require('fs');
const path = require('path');
const { PrismaNotFoundError } = require('#test/mocks/prisma-error');
const { ServerError } = require('#test/mocks/other-errors');
const ErrorCode = require('#services/error-code');
const AuthorDummyData = require('#test/resources/dummy-data/author');
const OutputValidate = require('#services/output-validate');
const AuthorRoutePath = require('#services/route-paths/author');
const { HTTP_CODE, METHOD, PATH } = require('#constants');
const { AUTHOR, USER, COMMON } = require('#messages');
const { authenticationToken, sessionData, signedTestCookie, destroySession } = require('#test/resources/auth');
const commonTest = require('#test/apis/common/common');
const { getInputValidateMessage, getStaticFile, createDescribeTest } = require('#test/helpers/index');
const updateAuthorUrl = AuthorRoutePath.update.abs;
const mockAuthor = AuthorDummyData.MockData;
const mockRequestAuthor = AuthorDummyData.MockRequestData;

describe('update author', () => {
  commonTest('update author api common test', [
    {
      name: 'url test',
      describe: 'url is invalid',
      url: `${PATH.BOOK}/unknown`,
      method: METHOD.POST.toLowerCase(),
    },
    {
      name: 'method test',
      describe: 'method not allowed',
      url: updateAuthorUrl,
      method: METHOD.GET.toLowerCase(),
    },
    {
      name: 'cors test',
      describe: 'update author api cors',
      url: updateAuthorUrl,
      method: METHOD.POST.toLowerCase(),
      origin: process.env.ORIGIN_CORS,
    }
  ], 'update author common test');

  describe(createDescribeTest(METHOD.POST, updateAuthorUrl), () => {
    test('update author will be success', (done) => {
      globalThis.prismaClient.author.findUniqueOrThrow.mockResolvedValue(mockAuthor);
      globalThis.prismaClient.author.update.mockResolvedValue(mockAuthor);
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());
      const writeFile = jest.spyOn(fs, 'writeFile').mockImplementation((filePath, content, callBack) => callBack());

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .put(updateAuthorUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .field('authorId', mockRequestAuthor.author_id)
            .field('name', mockRequestAuthor.name)
            .field('sex', mockRequestAuthor.sex)
            .field('yearOfBirth', mockRequestAuthor.year_of_birth)
            .field('yearOfDead', mockRequestAuthor.year_of_dead)
            .field('storyHtml', mockRequestAuthor.story.html)
            .field('storyJson', mockRequestAuthor.story.json)
            .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.CREATED)
            .then((response) => {
              const storyFile = mockAuthor.story.split(',');
              expect(globalThis.prismaClient.author.findUniqueOrThrow).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.author.findUniqueOrThrow).toHaveBeenCalledWith({
                where: {
                  author_id: mockRequestAuthor.author_id,
                },
                select: {
                  story: true
                }
              });
              expect(unLink).toHaveBeenCalledTimes(2);
              expect(unLink.mock.calls).toEqual([
                [
                  expect.stringContaining(path.resolve(`public${storyFile[0].trim()}`)),
                  expect.any(Function),
                ],
                [
                  expect.stringContaining(path.resolve(`public${storyFile[1].trim()}`)),
                  expect.any(Function),
                ]
              ]);
              expect(writeFile).toHaveBeenCalledTimes(2);
              expect(writeFile.mock.calls).toEqual([
                [
                  expect.stringContaining(`${path.resolve(`public/html/author/${mockRequestAuthor.author_id}`)}/${mockRequestAuthor.name}.html`),
                  mockRequestAuthor.story.html,
                  expect.any(Function),
                ],
                [
                  expect.stringContaining(`${path.resolve(`public/json/author/${mockRequestAuthor.author_id}`)}/${mockRequestAuthor.name}.json`),
                  mockRequestAuthor.story.json,
                  expect.any(Function)
                ],
              ]);
              expect(globalThis.prismaClient.author.update).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.author.update).toHaveBeenCalledWith({
                where: {
                  author_id: mockRequestAuthor.author_id,
                },
                data: {
                  name: mockRequestAuthor.name,
                  sex: mockRequestAuthor.sex,
                  avatar: expect.any(String),
                  year_of_birth: mockRequestAuthor.year_of_birth,
                  year_of_dead: mockRequestAuthor.year_of_dead,
                  story: `/html/author/${mockRequestAuthor.author_id}/${mockRequestAuthor.name}.html, /json/author/${mockRequestAuthor.author_id}/${mockRequestAuthor.name}.json`
                }
              });
              expect(response.body).toEqual({
                message: AUTHOR.UPDATE_AUTHOR_SUCCESS,
              });
              done();
            });
        });
    });

    test('update author failed with authentication token unset', (done) => {
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());
      const writeFile = jest.spyOn(fs, 'writeFile').mockImplementation((filePath, content, callBack) => callBack());

      expect.hasAssertions();
      destroySession()
        .then((responseSign) => {
          globalThis.api
            .put(updateAuthorUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('Connection', 'keep-alive')
            .field('authorId', mockRequestAuthor.author_id)
            .field('name', mockRequestAuthor.name)
            .field('sex', mockRequestAuthor.sex)
            .field('yearOfBirth', mockRequestAuthor.year_of_birth)
            .field('yearOfDead', mockRequestAuthor.year_of_dead)
            .field('storyHtml', mockRequestAuthor.story.html)
            .field('storyJson', mockRequestAuthor.story.json)
            .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.UNAUTHORIZED)
            .then((response) => {
              expect(unLink).not.toHaveBeenCalled();
              expect(writeFile).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.author.findUniqueOrThrow).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.author.update).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: USER.WORKING_SESSION_EXPIRE,
                errorCode: ErrorCode.WORKING_SESSION_ENDED,
              });
              done();
            });
        });
    });

    test('update author failed with session expired', (done) => {
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());
      const writeFile = jest.spyOn(fs, 'writeFile').mockImplementation((filePath, content, callBack) => callBack());

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .put(updateAuthorUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .field('authorId', mockRequestAuthor.author_id)
            .field('name', mockRequestAuthor.name)
            .field('sex', mockRequestAuthor.sex)
            .field('yearOfBirth', mockRequestAuthor.year_of_birth)
            .field('yearOfDead', mockRequestAuthor.year_of_dead)
            .field('storyHtml', mockRequestAuthor.story.html)
            .field('storyJson', mockRequestAuthor.story.json)
            .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.UNAUTHORIZED)
            .then((response) => {
              expect(unLink).not.toHaveBeenCalled();
              expect(writeFile).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.author.findUniqueOrThrow).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.author.update).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: USER.USER_UNAUTHORIZED,
                errorCode: ErrorCode.HAVE_NOT_LOGIN,
              });
              done();
            });
        });
    });

    test('update author failed with request body are empty', (done) => {
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());
      const writeFile = jest.spyOn(fs, 'writeFile').mockImplementation((filePath, content, callBack) => callBack());

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .put(updateAuthorUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(unLink).not.toHaveBeenCalled();
              expect(writeFile).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.author.findUniqueOrThrow).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.author.update).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(AUTHOR.UPDATE_AUTHOR_FAIL),
                errors: [COMMON.REQUEST_DATA_EMPTY],
              });
              done();
            });
        });
    });

    test('update author failed with request body are missing field', (done) => {
      // missing name field
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());
      const writeFile = jest.spyOn(fs, 'writeFile').mockImplementation((filePath, content, callBack) => callBack());

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .put(updateAuthorUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .field('authorId', mockRequestAuthor.author_id)
            .field('sex', mockRequestAuthor.sex)
            .field('yearOfBirth', mockRequestAuthor.year_of_birth)
            .field('yearOfDead', mockRequestAuthor.year_of_dead)
            .field('storyHtml', mockRequestAuthor.story.html)
            .field('storyJson', mockRequestAuthor.story.json)
            .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(unLink).not.toHaveBeenCalled();
              expect(writeFile).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.author.findUniqueOrThrow).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.author.update).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(AUTHOR.UPDATE_AUTHOR_FAIL),
                errors: expect.any(Array),
              });
              expect(response.body.errors).toHaveLength(1);
              done();
            });
        });
    });

    test('update author failed with undefine request body field', (done) => {
      // authorId is undefine field
      const undefineField = 'authorIds';
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());
      const writeFile = jest.spyOn(fs, 'writeFile').mockImplementation((filePath, content, callBack) => callBack());

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .put(updateAuthorUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .field('authorId', mockRequestAuthor.author_id)
            .field(undefineField, [Date.now().toString()])
            .field('name', mockRequestAuthor.name)
            .field('sex', mockRequestAuthor.sex)
            .field('yearOfBirth', mockRequestAuthor.year_of_birth)
            .field('yearOfDead', mockRequestAuthor.year_of_dead)
            .field('storyHtml', mockRequestAuthor.story.html)
            .field('storyJson', mockRequestAuthor.story.json)
            .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(unLink).not.toHaveBeenCalled();
              expect(writeFile).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.author.findUniqueOrThrow).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.author.update).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(AUTHOR.UPDATE_AUTHOR_FAIL),
                errors: expect.arrayContaining([expect.stringContaining(COMMON.FIELD_NOT_EXPECT.format(undefineField))])
              });
              done();
            });
        });
    });

    test('update author failed with avatar do not provide', (done) => {
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());
      const writeFile = jest.spyOn(fs, 'writeFile').mockImplementation((filePath, content, callBack) => callBack());

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .put(updateAuthorUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .field('authorId', mockRequestAuthor.author_id)
            .field('name', mockRequestAuthor.name)
            .field('sex', mockRequestAuthor.sex)
            .field('yearOfBirth', mockRequestAuthor.year_of_birth)
            .field('yearOfDead', mockRequestAuthor.year_of_dead)
            .field('storyHtml', mockRequestAuthor.story.html)
            .field('storyJson', mockRequestAuthor.story.json)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(unLink).not.toHaveBeenCalled();
              expect(writeFile).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.author.findUniqueOrThrow).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.author.update).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(AUTHOR.UPDATE_AUTHOR_FAIL),
                errors: expect.any(Array),
              });
              expect(response.body.errors).toHaveLength(1);
              done();
            });
        });
    });

    test('update author failed with avatar is not image file', (done) => {
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());
      const writeFile = jest.spyOn(fs, 'writeFile').mockImplementation((filePath, content, callBack) => callBack());

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .put(updateAuthorUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .field('authorId', mockRequestAuthor.author_id)
            .field('name', mockRequestAuthor.name)
            .field('sex', mockRequestAuthor.sex)
            .field('yearOfBirth', mockRequestAuthor.year_of_birth)
            .field('yearOfDead', mockRequestAuthor.year_of_dead)
            .field('storyHtml', mockRequestAuthor.story.html)
            .field('storyJson', mockRequestAuthor.story.json)
            .attach('avatar', getStaticFile('/pdf/empty-pdf.pdf'))
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(unLink).not.toHaveBeenCalled();
              expect(writeFile).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.author.findUniqueOrThrow).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.author.update).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: COMMON.FILE_NOT_IMAGE,
              });
              done();
            });
        });
    });

    test('update author failed with avatar is empty file', (done) => {
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());
      const writeFile = jest.spyOn(fs, 'writeFile').mockImplementation((filePath, content, callBack) => callBack());

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .put(updateAuthorUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .field('authorId', mockRequestAuthor.author_id)
            .field('name', mockRequestAuthor.name)
            .field('sex', mockRequestAuthor.sex)
            .field('yearOfBirth', mockRequestAuthor.year_of_birth)
            .field('yearOfDead', mockRequestAuthor.year_of_dead)
            .field('storyHtml', mockRequestAuthor.story.html)
            .field('storyJson', mockRequestAuthor.story.json)
            .attach('avatar', getStaticFile('/images/empty.png'))
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(unLink).not.toHaveBeenCalled();
              expect(writeFile).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.author.findUniqueOrThrow).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.author.update).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: COMMON.FILE_IS_EMPTY,
              });
              done();
            });
        });
    });

    test('update author failed with findUniqueOrThrow method get server error', (done) => {
      globalThis.prismaClient.author.findUniqueOrThrow.mockRejectedValue(ServerError);
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());
      const writeFile = jest.spyOn(fs, 'writeFile').mockImplementation((filePath, content, callBack) => callBack());

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .put(updateAuthorUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .field('authorId', mockRequestAuthor.author_id)
            .field('name', mockRequestAuthor.name)
            .field('sex', mockRequestAuthor.sex)
            .field('yearOfBirth', mockRequestAuthor.year_of_birth)
            .field('yearOfDead', mockRequestAuthor.year_of_dead)
            .field('storyHtml', mockRequestAuthor.story.html)
            .field('storyJson', mockRequestAuthor.story.json)
            .attach('avatar', getStaticFile('/images/application.png'))
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.SERVER_ERROR)
            .then((response) => {
              expect(globalThis.prismaClient.author.findUniqueOrThrow).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.author.findUniqueOrThrow).toHaveBeenCalledWith({
                where: {
                  author_id: mockRequestAuthor.author_id,
                },
                select: {
                  story: true
                }
              });
              expect(unLink).not.toHaveBeenCalled();
              expect(writeFile).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.author.update).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: COMMON.INTERNAL_ERROR_MESSAGE,
              });
              done();
            });
        });
    });

    test('update author failed with unLink get server error', (done) => {
      globalThis.prismaClient.author.findUniqueOrThrow.mockResolvedValue(mockAuthor);
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack(ServerError));
      const writeFile = jest.spyOn(fs, 'writeFile').mockImplementation((filePath, content, callBack) => callBack());

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .put(updateAuthorUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .field('authorId', mockRequestAuthor.author_id)
            .field('name', mockRequestAuthor.name)
            .field('sex', mockRequestAuthor.sex)
            .field('yearOfBirth', mockRequestAuthor.year_of_birth)
            .field('yearOfDead', mockRequestAuthor.year_of_dead)
            .field('storyHtml', mockRequestAuthor.story.html)
            .field('storyJson', mockRequestAuthor.story.json)
            .attach('avatar', getStaticFile('/images/application.png'))
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.SERVER_ERROR)
            .then((response) => {
              const storyFile = mockAuthor.story.split(',');
              expect(globalThis.prismaClient.author.findUniqueOrThrow).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.author.findUniqueOrThrow).toHaveBeenCalledWith({
                where: {
                  author_id: mockRequestAuthor.author_id,
                },
                select: {
                  story: true
                }
              });
              expect(unLink).toHaveBeenCalledTimes(2);
              expect(unLink.mock.calls).toEqual([
                [
                  expect.stringContaining(path.resolve(`public${storyFile[0].trim()}`)),
                  expect.any(Function),
                ],
                [
                  expect.stringContaining(path.resolve(`public${storyFile[1].trim()}`)),
                  expect.any(Function),
                ]
              ]);
              expect(writeFile).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.author.update).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: COMMON.INTERNAL_ERROR_MESSAGE,
              });
              done();
            });
        });
    });

    test('update author failed with writeFile get server error', (done) => {
      globalThis.prismaClient.author.findUniqueOrThrow.mockResolvedValue(mockAuthor);
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());
      const writeFile = jest.spyOn(fs, 'writeFile').mockImplementation((filePath, content, callBack) => callBack(ServerError));

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .put(updateAuthorUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .field('authorId', mockRequestAuthor.author_id)
            .field('name', mockRequestAuthor.name)
            .field('sex', mockRequestAuthor.sex)
            .field('yearOfBirth', mockRequestAuthor.year_of_birth)
            .field('yearOfDead', mockRequestAuthor.year_of_dead)
            .field('storyHtml', mockRequestAuthor.story.html)
            .field('storyJson', mockRequestAuthor.story.json)
            .attach('avatar', getStaticFile('/images/application.png'))
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.SERVER_ERROR)
            .then((response) => {
              const storyFile = mockAuthor.story.split(',');
              expect(globalThis.prismaClient.author.findUniqueOrThrow).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.author.findUniqueOrThrow).toHaveBeenCalledWith({
                where: {
                  author_id: mockRequestAuthor.author_id,
                },
                select: {
                  story: true
                }
              });
              expect(unLink).toHaveBeenCalledTimes(2);
              expect(unLink.mock.calls).toEqual([
                [
                  expect.stringContaining(path.resolve(`public${storyFile[0].trim()}`)),
                  expect.any(Function),
                ],
                [
                  expect.stringContaining(path.resolve(`public${storyFile[1].trim()}`)),
                  expect.any(Function),
                ]
              ]);
              expect(writeFile).toHaveBeenCalledTimes(2);
              expect(writeFile.mock.calls).toEqual([
                [
                  expect.stringContaining(`${path.resolve(`public/html/author/${mockRequestAuthor.author_id}`)}/${mockRequestAuthor.name}.html`),
                  mockRequestAuthor.story.html,
                  expect.any(Function),
                ],
                [
                  expect.stringContaining(`${path.resolve(`public/json/author/${mockRequestAuthor.author_id}`)}/${mockRequestAuthor.name}.json`),
                  mockRequestAuthor.story.json,
                  expect.any(Function)
                ],
              ]);
              expect(globalThis.prismaClient.author.update).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: COMMON.INTERNAL_ERROR_MESSAGE,
              });
              done();
            });
        });
    });

    test('update author failed with update method get server error', (done) => {
      globalThis.prismaClient.author.findUniqueOrThrow.mockResolvedValue(mockAuthor);
      globalThis.prismaClient.author.update.mockRejectedValue(ServerError);
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());
      const writeFile = jest.spyOn(fs, 'writeFile').mockImplementation((filePath, content, callBack) => callBack());

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .put(updateAuthorUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .field('authorId', mockRequestAuthor.author_id)
            .field('name', mockRequestAuthor.name)
            .field('sex', mockRequestAuthor.sex)
            .field('yearOfBirth', mockRequestAuthor.year_of_birth)
            .field('yearOfDead', mockRequestAuthor.year_of_dead)
            .field('storyHtml', mockRequestAuthor.story.html)
            .field('storyJson', mockRequestAuthor.story.json)
            .attach('avatar', getStaticFile('/images/application.png'))
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.SERVER_ERROR)
            .then((response) => {
              const storyFile = mockAuthor.story.split(',');
              expect(globalThis.prismaClient.author.findUniqueOrThrow).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.author.findUniqueOrThrow).toHaveBeenCalledWith({
                where: {
                  author_id: mockRequestAuthor.author_id,
                },
                select: {
                  story: true
                }
              });
              expect(unLink).toHaveBeenCalledTimes(2);
              expect(unLink.mock.calls).toEqual([
                [
                  expect.stringContaining(path.resolve(`public${storyFile[0].trim()}`)),
                  expect.any(Function),
                ],
                [
                  expect.stringContaining(path.resolve(`public${storyFile[1].trim()}`)),
                  expect.any(Function),
                ]
              ]);
              expect(writeFile).toHaveBeenCalledTimes(2);
              expect(writeFile.mock.calls).toEqual([
                [
                  expect.stringContaining(`${path.resolve(`public/html/author/${mockRequestAuthor.author_id}`)}/${mockRequestAuthor.name}.html`),
                  mockRequestAuthor.story.html,
                  expect.any(Function),
                ],
                [
                  expect.stringContaining(`${path.resolve(`public/json/author/${mockRequestAuthor.author_id}`)}/${mockRequestAuthor.name}.json`),
                  mockRequestAuthor.story.json,
                  expect.any(Function)
                ],
              ]);
              expect(globalThis.prismaClient.author.update).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.author.update).toHaveBeenCalledWith({
                where: {
                  author_id: mockRequestAuthor.author_id,
                },
                data: {
                  name: mockRequestAuthor.name,
                  sex: mockRequestAuthor.sex,
                  avatar: expect.any(String),
                  year_of_birth: mockRequestAuthor.year_of_birth,
                  year_of_dead: mockRequestAuthor.year_of_dead,
                  story: `/html/author/${mockRequestAuthor.author_id}/${mockRequestAuthor.name}.html, /json/author/${mockRequestAuthor.author_id}/${mockRequestAuthor.name}.json`
                }
              });
              expect(response.body).toEqual({
                message: COMMON.INTERNAL_ERROR_MESSAGE,
              });
              done();
            });
        });
    });

    test('update author failed with findUniqueOrThrow method get not found error', (done) => {
      globalThis.prismaClient.author.findUniqueOrThrow.mockRejectedValue(PrismaNotFoundError);
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());
      const writeFile = jest.spyOn(fs, 'writeFile').mockImplementation((filePath, content, callBack) => callBack());

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .put(updateAuthorUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .field('authorId', mockRequestAuthor.author_id)
            .field('name', mockRequestAuthor.name)
            .field('sex', mockRequestAuthor.sex)
            .field('yearOfBirth', mockRequestAuthor.year_of_birth)
            .field('yearOfDead', mockRequestAuthor.year_of_dead)
            .field('storyHtml', mockRequestAuthor.story.html)
            .field('storyJson', mockRequestAuthor.story.json)
            .attach('avatar', getStaticFile('/images/application.png'))
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.NOT_FOUND)
            .then((response) => {
              expect(globalThis.prismaClient.author.findUniqueOrThrow).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.author.findUniqueOrThrow).toHaveBeenCalledWith({
                where: {
                  author_id: mockRequestAuthor.author_id,
                },
                select: {
                  story: true
                }
              });
              expect(unLink).not.toHaveBeenCalled();
              expect(writeFile).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.author.update).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: AUTHOR.AUTHOR_NOT_FOUND,
              });
              done();
            });
        });
    });

    test('update author failed with update method get not found error', (done) => {
      globalThis.prismaClient.author.findUniqueOrThrow.mockResolvedValue(mockAuthor);
      globalThis.prismaClient.author.update.mockRejectedValue(PrismaNotFoundError);
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());
      const writeFile = jest.spyOn(fs, 'writeFile').mockImplementation((filePath, content, callBack) => callBack());

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .put(updateAuthorUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .field('authorId', mockRequestAuthor.author_id)
            .field('name', mockRequestAuthor.name)
            .field('sex', mockRequestAuthor.sex)
            .field('yearOfBirth', mockRequestAuthor.year_of_birth)
            .field('yearOfDead', mockRequestAuthor.year_of_dead)
            .field('storyHtml', mockRequestAuthor.story.html)
            .field('storyJson', mockRequestAuthor.story.json)
            .attach('avatar', getStaticFile('/images/application.png'))
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.NOT_FOUND)
            .then((response) => {
              const storyFile = mockAuthor.story.split(',');
              expect(globalThis.prismaClient.author.findUniqueOrThrow).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.author.findUniqueOrThrow).toHaveBeenCalledWith({
                where: {
                  author_id: mockRequestAuthor.author_id,
                },
                select: {
                  story: true
                }
              });
              expect(unLink).toHaveBeenCalledTimes(2);
              expect(unLink.mock.calls).toEqual([
                [
                  expect.stringContaining(path.resolve(`public${storyFile[0].trim()}`)),
                  expect.any(Function),
                ],
                [
                  expect.stringContaining(path.resolve(`public${storyFile[1].trim()}`)),
                  expect.any(Function),
                ]
              ]);
              expect(writeFile).toHaveBeenCalledTimes(2);
              expect(writeFile.mock.calls).toEqual([
                [
                  expect.stringContaining(`${path.resolve(`public/html/author/${mockRequestAuthor.author_id}`)}/${mockRequestAuthor.name}.html`),
                  mockRequestAuthor.story.html,
                  expect.any(Function),
                ],
                [
                  expect.stringContaining(`${path.resolve(`public/json/author/${mockRequestAuthor.author_id}`)}/${mockRequestAuthor.name}.json`),
                  mockRequestAuthor.story.json,
                  expect.any(Function)
                ],
              ]);
              expect(globalThis.prismaClient.author.update).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.author.update).toHaveBeenCalledWith({
                where: {
                  author_id: mockRequestAuthor.author_id,
                },
                data: {
                  name: mockRequestAuthor.name,
                  sex: mockRequestAuthor.sex,
                  avatar: expect.any(String),
                  year_of_birth: mockRequestAuthor.year_of_birth,
                  year_of_dead: mockRequestAuthor.year_of_dead,
                  story: `/html/author/${mockRequestAuthor.author_id}/${mockRequestAuthor.name}.html, /json/author/${mockRequestAuthor.author_id}/${mockRequestAuthor.name}.json`
                }
              });
              expect(response.body).toEqual({
                message: AUTHOR.AUTHOR_NOT_FOUND,
              });
              done();
            });
        });
    });

    test('update author failed with yearOfBirth larger than yearOfDead', (done) => {
      // missing name field
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());
      const writeFile = jest.spyOn(fs, 'writeFile').mockImplementation((filePath, content, callBack) => callBack());

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .put(updateAuthorUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .field('authorId', mockRequestAuthor.author_id)
            .field('name', mockRequestAuthor.name)
            .field('sex', mockRequestAuthor.sex)
            .field('yearOfBirth', mockRequestAuthor.year_of_dead)
            .field('yearOfDead', mockRequestAuthor.year_of_birth)
            .field('storyHtml', mockRequestAuthor.story.html)
            .field('storyJson', mockRequestAuthor.story.json)
            .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(unLink).not.toHaveBeenCalled();
              expect(writeFile).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.author.findUniqueOrThrow).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.author.update).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(AUTHOR.UPDATE_AUTHOR_FAIL),
                errors: ['yearOfDead must greater than yearOfBirth']
              });
              done();
            });
        });
    });

    test('update author failed with output validate error', (done) => {
      globalThis.prismaClient.author.findUniqueOrThrow.mockResolvedValue(mockAuthor);
      globalThis.prismaClient.author.update.mockResolvedValue(mockAuthor);
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());
      const writeFile = jest.spyOn(fs, 'writeFile').mockImplementation((filePath, content, callBack) => callBack());
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .put(updateAuthorUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .field('authorId', mockRequestAuthor.author_id)
            .field('name', mockRequestAuthor.name)
            .field('sex', mockRequestAuthor.sex)
            .field('yearOfBirth', mockRequestAuthor.year_of_birth)
            .field('yearOfDead', mockRequestAuthor.year_of_dead)
            .field('storyHtml', mockRequestAuthor.story.html)
            .field('storyJson', mockRequestAuthor.story.json)
            .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              const storyFile = mockAuthor.story.split(',');
              expect(globalThis.prismaClient.author.findUniqueOrThrow).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.author.findUniqueOrThrow).toHaveBeenCalledWith({
                where: {
                  author_id: mockRequestAuthor.author_id,
                },
                select: {
                  story: true
                }
              });
              expect(unLink).toHaveBeenCalledTimes(2);
              expect(unLink.mock.calls).toEqual([
                [
                  expect.stringContaining(path.resolve(`public${storyFile[0].trim()}`)),
                  expect.any(Function),
                ],
                [
                  expect.stringContaining(path.resolve(`public${storyFile[1].trim()}`)),
                  expect.any(Function),
                ]
              ]);
              expect(writeFile).toHaveBeenCalledTimes(2);
              expect(writeFile.mock.calls).toEqual([
                [
                  expect.stringContaining(`${path.resolve(`public/html/author/${mockRequestAuthor.author_id}`)}/${mockRequestAuthor.name}.html`),
                  mockRequestAuthor.story.html,
                  expect.any(Function),
                ],
                [
                  expect.stringContaining(`${path.resolve(`public/json/author/${mockRequestAuthor.author_id}`)}/${mockRequestAuthor.name}.json`),
                  mockRequestAuthor.story.json,
                  expect.any(Function)
                ],
              ]);
              expect(globalThis.prismaClient.author.update).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.author.update).toHaveBeenCalledWith({
                where: {
                  author_id: mockRequestAuthor.author_id,
                },
                data: {
                  name: mockRequestAuthor.name,
                  sex: mockRequestAuthor.sex,
                  avatar: expect.any(String),
                  year_of_birth: mockRequestAuthor.year_of_birth,
                  year_of_dead: mockRequestAuthor.year_of_dead,
                  story: `/html/author/${mockRequestAuthor.author_id}/${mockRequestAuthor.name}.html, /json/author/${mockRequestAuthor.author_id}/${mockRequestAuthor.name}.json`
                }
              });
              expect(response.body).toEqual({
                message: COMMON.OUTPUT_VALIDATE_FAIL
              });
              done();
            });
        });
    });
  });
});
