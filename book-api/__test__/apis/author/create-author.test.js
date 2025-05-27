const fsPromise = require('fs/promises');
const fs = require('fs');
const path = require('path');
const { ServerError } = require('#test/mocks/other-errors');
const ErrorCode = require('#services/error-code');
const AuthorDummyData = require('#test/resources/dummy-data/author');
const OutputValidate = require('#services/output-validate');
const { HTTP_CODE, METHOD, PATH } = require('#constants');
const { AUTHOR, USER, COMMON } = require('#messages');
const { authenticationToken, sessionData, signedTestCookie, destroySession } = require('#test/resources/auth');
const commonTest = require('#test/apis/common/common');
const { getInputValidateMessage, getStaticFile, createDescribeTest } = require('#test/helpers/index');
const createAuthorUrl = `${PATH.AUTHOR}/create`;

const mockAuthor = AuthorDummyData.MockData;

describe('create author', () => {
  commonTest('create author api common test', [
    {
      name: 'url test',
      describe: 'url is invalid',
      url: `${PATH.BOOK}/unknown`,
      method: METHOD.POST.toLowerCase(),
    },
    {
      name: 'method test',
      describe: 'method not allowed',
      url: createAuthorUrl,
      method: METHOD.GET.toLowerCase(),
    },
    {
      name: 'cors test',
      describe: 'create author api cors',
      url: createAuthorUrl,
      method: METHOD.POST.toLowerCase(),
      origin: process.env.ORIGIN_CORS,
    }
  ], 'create author common test');

  describe(createDescribeTest(METHOD.POST, createAuthorUrl), () => {
    test('create author will be success', (done) => {
      globalThis.prismaClient.author.create.mockResolvedValue(mockAuthor);
      const mkdir = jest.spyOn(fsPromise, 'mkdir').mockImplementation((filePath, object) => Promise.resolve(filePath));
      const writeFile = jest.spyOn(fs, 'writeFile').mockImplementation((filePath, content, callBack) => callBack());

      // expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(createAuthorUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .field('name', mockAuthor.name)
            .field('sex', mockAuthor.sex)
            .field('yearOfBirth', mockAuthor.yearOfBirth)
            .field('yearOfDead', mockAuthor.yearOfDead)
            .field('storyHtml', mockAuthor.story.html)
            .field('storyJson', mockAuthor.story.json)
            .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
            .expect('Content-Type', /application\/json/)
            //.expect(HTTP_CODE.CREATED)
            .then((response) => {
              console.log(response.body);
              expect(mkdir).toHaveBeenCalledTimes(2);
              expect(mkdir).toHaveBeenCalledWith(
                expect.stringMatching(
                  new RegExp(path.resolve('public/html/author/{0}').replace(/\\/gm, '\\\\').format('\\d+'), 'gm')
                ),
                { recursive: true }
              );
              expect(writeFile).toHaveBeenCalledTimes(2);
              expect(writeFile.mock.calls).toEqual([
                [
                  expect.stringMatching(
                    new RegExp(`${path.resolve('public/html/author/{0}')}/${`${mockAuthor.name}.html`}`.replace(/\\/gm, '\\\\').format('\\d+'), 'gm'),
                  'gm'),
                  mockAuthor.story.html,
                  expect.any(Function),
                ],
                [
                  expect.stringMatching(
                    new RegExp(`${path.resolve('public/json/author/{0}')}/${`${mockAuthor.name}.json`}`.replace(/\\/gm, '\\\\').format('\\d+'), 'gm'),
                  'gm'),
                  mockAuthor.story.json,
                  expect.any(Function)
                ],
              ]);
              expect(globalThis.prismaClient.author.create).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.author.create).toHaveBeenCalledWith({
                data: {
                  author_id: expect.any(String),
                  name: mockAuthor.name,
                  sex: mockAuthor.sex,
                  avatar: expect.any(String),
                  year_of_birth: mockAuthor.yearOfBirth,
                  year_of_dead: mockAuthor.yearOfDead,
                  story: expect.stringMatching(new RegExp(`\/html\/author\/{0}\/${mockAuthor.name}.html, \/json\/author\/{1}\/${mockAuthor.name}.json`.format('\\d+', '\\d+'), 'gm')),
                }
              });
              expect(response.body).toEqual({
                message: AUTHOR.CREATE_AUTHOR_SUCCESS,
              });
              done();
            });
        });
    });

    test('create author failed with authentication token unset', (done) => {
      const mkdir = jest.spyOn(fsPromise, 'mkdir').mockImplementation((filePath, object) => Promise.resolve(filePath));
      const writeFile = jest.spyOn(fs, 'writeFile').mockImplementation((filePath, content, callBack) => callBack());

      expect.hasAssertions();
      destroySession()
        .then((responseSign) => {
          globalThis.api
            .post(createAuthorUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('Connection', 'keep-alive')
            .field('name', mockAuthor.name)
            .field('sex', mockAuthor.sex)
            .field('yearOfBirth', mockAuthor.yearOfBirth)
            .field('yearOfDead', mockAuthor.yearOfDead)
            .field('storyHtml', mockAuthor.story.html)
            .field('storyJson', mockAuthor.story.json)
            .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.UNAUTHORIZED)
            .then((response) => {
              expect(mkdir).not.toHaveBeenCalled();
              expect(writeFile).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.author.create).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: USER.WORKING_SESSION_EXPIRE,
                errorCode: ErrorCode.WORKING_SESSION_ENDED,
              });
              done();
            });
        });
    });

    test('create author failed with session expired', (done) => {
      const mkdir = jest.spyOn(fsPromise, 'mkdir').mockImplementation((filePath, object) => Promise.resolve(filePath));
      const writeFile = jest.spyOn(fs, 'writeFile').mockImplementation((filePath, content, callBack) => callBack());

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(createAuthorUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .field('name', mockAuthor.name)
            .field('sex', mockAuthor.sex)
            .field('yearOfBirth', mockAuthor.yearOfBirth)
            .field('yearOfDead', mockAuthor.yearOfDead)
            .field('storyHtml', mockAuthor.story.html)
            .field('storyJson', mockAuthor.story.json)
            .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.UNAUTHORIZED)
            .then((response) => {
              expect(mkdir).not.toHaveBeenCalled();
              expect(writeFile).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.author.create).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: USER.USER_UNAUTHORIZED,
                errorCode: ErrorCode.HAVE_NOT_LOGIN,
              });
              done();
            });
        });
    });

    test('create author failed with request body are empty', (done) => {
      const mkdir = jest.spyOn(fsPromise, 'mkdir').mockImplementation((filePath, object) => Promise.resolve(filePath));
      const writeFile = jest.spyOn(fs, 'writeFile').mockImplementation((filePath, content, callBack) => callBack());

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(createAuthorUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(mkdir).not.toHaveBeenCalled();
              expect(writeFile).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.author.create).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(AUTHOR.CREATE_AUTHOR_FAIL),
                errors: [COMMON.REQUEST_DATA_EMPTY],
              });
              done();
            });
        });
    });

    test('create author failed with request body are missing field', (done) => {
      // missing name field
      const mkdir = jest.spyOn(fsPromise, 'mkdir').mockImplementation((filePath, object) => Promise.resolve(filePath));
      const writeFile = jest.spyOn(fs, 'writeFile').mockImplementation((filePath, content, callBack) => callBack());

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(createAuthorUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .field('sex', mockAuthor.sex)
            .field('yearOfBirth', mockAuthor.yearOfBirth)
            .field('yearOfDead', mockAuthor.yearOfDead)
            .field('storyHtml', mockAuthor.story.html)
            .field('storyJson', mockAuthor.story.json)
            .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(mkdir).not.toHaveBeenCalled();
              expect(writeFile).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.author.create).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(AUTHOR.CREATE_AUTHOR_FAIL),
                errors: expect.any(Array),
              });
              expect(response.body.errors).toHaveLength(1);
              done();
            });
        });
    });

    test('create author failed with undefine request body field', (done) => {
      // authorId is undefine field
      const undefineField = 'authorIds';
      const mkdir = jest.spyOn(fsPromise, 'mkdir').mockImplementation((filePath, object) => Promise.resolve(filePath));
      const writeFile = jest.spyOn(fs, 'writeFile').mockImplementation((filePath, content, callBack) => callBack());

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(createAuthorUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .field(undefineField, [Date.now().toString()])
            .field('name', mockAuthor.name)
            .field('sex', mockAuthor.sex)
            .field('yearOfBirth', mockAuthor.yearOfBirth)
            .field('yearOfDead', mockAuthor.yearOfDead)
            .field('storyHtml', mockAuthor.story.html)
            .field('storyJson', mockAuthor.story.json)
            .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(mkdir).not.toHaveBeenCalled();
              expect(writeFile).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.author.create).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(AUTHOR.CREATE_AUTHOR_FAIL),
                errors: expect.arrayContaining([expect.stringContaining(COMMON.FIELD_NOT_EXPECT.format(undefineField))])
              });
              done();
            });
        });
    });

    test('create author failed with avatar do not provide', (done) => {
      const mkdir = jest.spyOn(fsPromise, 'mkdir').mockImplementation((filePath, object) => Promise.resolve(filePath));
      const writeFile = jest.spyOn(fs, 'writeFile').mockImplementation((filePath, content, callBack) => callBack());

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(createAuthorUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .field('name', mockAuthor.name)
            .field('sex', mockAuthor.sex)
            .field('yearOfBirth', mockAuthor.yearOfBirth)
            .field('yearOfDead', mockAuthor.yearOfDead)
            .field('storyHtml', mockAuthor.story.html)
            .field('storyJson', mockAuthor.story.json)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(mkdir).not.toHaveBeenCalled();
              expect(writeFile).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.author.create).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(AUTHOR.CREATE_AUTHOR_FAIL),
                errors: expect.any(Array),
              });
              expect(response.body.errors).toHaveLength(1);
              done();
            });
        });
    });

    test('create author failed with avatar is not image file', (done) => {
      const mkdir = jest.spyOn(fsPromise, 'mkdir').mockImplementation((filePath, object) => Promise.resolve(filePath));
      const writeFile = jest.spyOn(fs, 'writeFile').mockImplementation((filePath, content, callBack) => callBack());

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(createAuthorUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .field('name', mockAuthor.name)
            .field('sex', mockAuthor.sex)
            .field('yearOfBirth', mockAuthor.yearOfBirth)
            .field('yearOfDead', mockAuthor.yearOfDead)
            .field('storyHtml', mockAuthor.story.html)
            .field('storyJson', mockAuthor.story.json)
            .attach('avatar', getStaticFile('/pdf/empty-pdf.pdf'))
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(mkdir).not.toHaveBeenCalled();
              expect(writeFile).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.author.create).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: COMMON.FILE_NOT_IMAGE,
              });
              done();
            });
        });
    });

    test('create author failed with avatar is empty file', (done) => {
      const mkdir = jest.spyOn(fsPromise, 'mkdir').mockImplementation((filePath, object) => Promise.resolve(filePath));
      const writeFile = jest.spyOn(fs, 'writeFile').mockImplementation((filePath, content, callBack) => callBack());

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(createAuthorUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .field('name', mockAuthor.name)
            .field('sex', mockAuthor.sex)
            .field('yearOfBirth', mockAuthor.yearOfBirth)
            .field('yearOfDead', mockAuthor.yearOfDead)
            .field('storyHtml', mockAuthor.story.html)
            .field('storyJson', mockAuthor.story.json)
            .attach('avatar', getStaticFile('/images/empty.png'))
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(mkdir).not.toHaveBeenCalled();
              expect(writeFile).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.author.create).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: COMMON.FILE_IS_EMPTY,
              });
              done();
            });
        });
    });

    test('create author failed with mkdir get server error', (done) => {
      const mkdir = jest.spyOn(fsPromise, 'mkdir').mockRejectedValue(ServerError);
      const writeFile = jest.spyOn(fs, 'writeFile').mockImplementation((filePath, content, callBack) => callBack());

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(createAuthorUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .field('name', mockAuthor.name)
            .field('sex', mockAuthor.sex)
            .field('yearOfBirth', mockAuthor.yearOfBirth)
            .field('yearOfDead', mockAuthor.yearOfDead)
            .field('storyHtml', mockAuthor.story.html)
            .field('storyJson', mockAuthor.story.json)
            .attach('avatar', getStaticFile('/images/application.png'))
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.SERVER_ERROR)
            .then((response) => {
              expect(mkdir).toHaveBeenCalledTimes(2);
              expect(mkdir).toHaveBeenCalledWith(
                expect.stringMatching(
                  new RegExp(path.resolve('public/html/author/{0}').replace(/\\/gm, '\\\\').format('\\d+'), 'gm')
                ),
                { recursive: true }
              );
              expect(writeFile).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.author.create).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: COMMON.INTERNAL_ERROR_MESSAGE,
              });
              done();
            });
        });
    });

    test('create author failed with yearOfBirth larger than yearOfDead', (done) => {
      // missing name field
      const mkdir = jest.spyOn(fsPromise, 'mkdir').mockImplementation((filePath, object) => Promise.resolve(filePath));
      const writeFile = jest.spyOn(fs, 'writeFile').mockImplementation((filePath, content, callBack) => callBack());

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(createAuthorUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .field('name', mockAuthor.name)
            .field('sex', mockAuthor.sex)
            .field('yearOfBirth', mockAuthor.yearOfDead)
            .field('yearOfDead', mockAuthor.yearOfBirth)
            .field('storyHtml', mockAuthor.story.html)
            .field('storyJson', mockAuthor.story.json)
            .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(mkdir).not.toHaveBeenCalled();
              expect(writeFile).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.author.create).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(AUTHOR.CREATE_AUTHOR_FAIL),
                errors: ['yearOfDead must greater than yearOfBirth']
              });
              done();
            });
        });
    });

    test('create author failed with writeFile get server error', (done) => {
      const mkdir = jest.spyOn(fsPromise, 'mkdir').mockImplementation((filePath, object) => Promise.resolve(filePath));
      const writeFile = jest.spyOn(fs, 'writeFile').mockImplementation((filePath, content, callBack) => callBack(ServerError));

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(createAuthorUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .field('name', mockAuthor.name)
            .field('sex', mockAuthor.sex)
            .field('yearOfBirth', mockAuthor.yearOfBirth)
            .field('yearOfDead', mockAuthor.yearOfDead)
            .field('storyHtml', mockAuthor.story.html)
            .field('storyJson', mockAuthor.story.json)
            .attach('avatar', getStaticFile('/images/application.png'))
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.SERVER_ERROR)
            .then((response) => {
              expect(mkdir).toHaveBeenCalledTimes(2);
              expect(mkdir).toHaveBeenCalledWith(
                expect.stringMatching(
                  new RegExp(path.resolve('public/html/author/{0}').replace(/\\/gm, '\\\\').format('\\d+'), 'gm')
                ),
                { recursive: true }
              );
              expect(writeFile).toHaveBeenCalledTimes(2);
              expect(writeFile.mock.calls).toEqual([
                [
                  expect.stringMatching(
                    new RegExp(`${path.resolve('public/html/author/{0}')}/${`${mockAuthor.name}.html`}`.replace(/\\/gm, '\\\\').format('\\d+'), 'gm'),
                  'gm'),
                  mockAuthor.story.html,
                  expect.any(Function),
                ],
                [
                  expect.stringMatching(
                    new RegExp(`${path.resolve('public/json/author/{0}')}/${`${mockAuthor.name}.json`}`.replace(/\\/gm, '\\\\').format('\\d+'), 'gm'),
                  'gm'),
                  mockAuthor.story.json,
                  expect.any(Function)
                ],
              ]);
              expect(globalThis.prismaClient.author.create).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: COMMON.INTERNAL_ERROR_MESSAGE,
              });
              done();
            });
        });
    });

    test('create author failed with create method get server error', (done) => {
      const mkdir = jest.spyOn(fsPromise, 'mkdir').mockImplementation((filePath, object) => Promise.resolve(filePath));
      const writeFile = jest.spyOn(fs, 'writeFile').mockImplementation((filePath, content, callBack) => callBack());
      globalThis.prismaClient.author.create.mockRejectedValue(ServerError);

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(createAuthorUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .field('name', mockAuthor.name)
            .field('sex', mockAuthor.sex)
            .field('yearOfBirth', mockAuthor.yearOfBirth)
            .field('yearOfDead', mockAuthor.yearOfDead)
            .field('storyHtml', mockAuthor.story.html)
            .field('storyJson', mockAuthor.story.json)
            .attach('avatar', getStaticFile('/images/application.png'))
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.SERVER_ERROR)
            .then((response) => {
              expect(mkdir).toHaveBeenCalledTimes(2);
              expect(mkdir).toHaveBeenCalledWith(
                expect.stringMatching(
                  new RegExp(path.resolve('public/html/author/{0}').replace(/\\/gm, '\\\\').format('\\d+'), 'gm')
                ),
                { recursive: true }
              );
              expect(writeFile).toHaveBeenCalledTimes(2);
              expect(writeFile.mock.calls).toEqual([
                [
                  expect.stringMatching(
                    new RegExp(`${path.resolve('public/html/author/{0}')}/${`${mockAuthor.name}.html`}`.replace(/\\/gm, '\\\\').format('\\d+'), 'gm'),
                  'gm'),
                  mockAuthor.story.html,
                  expect.any(Function),
                ],
                [
                  expect.stringMatching(
                    new RegExp(`${path.resolve('public/json/author/{0}')}/${`${mockAuthor.name}.json`}`.replace(/\\/gm, '\\\\').format('\\d+'), 'gm'),
                  'gm'),
                  mockAuthor.story.json,
                  expect.any(Function)
                ],
              ]);
              expect(globalThis.prismaClient.author.create).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.author.create).toHaveBeenCalledWith({
                data: {
                  author_id: expect.any(String),
                  name: mockAuthor.name,
                  sex: mockAuthor.sex,
                  avatar: expect.any(String),
                  year_of_birth: mockAuthor.yearOfBirth,
                  year_of_dead: mockAuthor.yearOfDead,
                  story: expect.stringMatching(new RegExp(`\/html\/author\/{0}\/${mockAuthor.name}.html, \/json\/author\/{1}\/${mockAuthor.name}.json`.format('\\d+', '\\d+'), 'gm')),
                }
              });
              expect(response.body).toEqual({
                message: COMMON.INTERNAL_ERROR_MESSAGE,
              });
              done();
            });
        });
    });

    test('create author failed with output validate error', (done) => {
      globalThis.prismaClient.author.create.mockResolvedValue(mockAuthor);
      const mkdir = jest.spyOn(fsPromise, 'mkdir').mockImplementation((filePath, object) => Promise.resolve(filePath));
      const writeFile = jest.spyOn(fs, 'writeFile').mockImplementation((filePath, content, callBack) => callBack());
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(createAuthorUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .field('name', mockAuthor.name)
            .field('sex', mockAuthor.sex)
            .field('yearOfBirth', mockAuthor.yearOfBirth)
            .field('yearOfDead', mockAuthor.yearOfDead)
            .field('storyHtml', mockAuthor.story.html)
            .field('storyJson', mockAuthor.story.json)
            .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(mkdir).toHaveBeenCalledTimes(2);
              expect(mkdir).toHaveBeenCalledWith(
                expect.stringMatching(
                  new RegExp(path.resolve('public/html/author/{0}').replace(/\\/gm, '\\\\').format('\\d+'), 'gm')
                ),
                { recursive: true }
              );
              expect(writeFile).toHaveBeenCalledTimes(2);
              expect(writeFile.mock.calls).toEqual([
                [
                  expect.stringMatching(
                    new RegExp(`${path.resolve('public/html/author/{0}')}/${`${mockAuthor.name}.html`}`.replace(/\\/gm, '\\\\').format('\\d+'), 'gm'),
                  'gm'),
                  mockAuthor.story.html,
                  expect.any(Function),
                ],
                [
                  expect.stringMatching(
                    new RegExp(`${path.resolve('public/json/author/{0}')}/${`${mockAuthor.name}.json`}`.replace(/\\/gm, '\\\\').format('\\d+'), 'gm'),
                  'gm'),
                  mockAuthor.story.json,
                  expect.any(Function)
                ],
              ]);
              expect(globalThis.prismaClient.author.create).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.author.create).toHaveBeenCalledWith({
                data: {
                  author_id: expect.any(String),
                  name: mockAuthor.name,
                  sex: mockAuthor.sex,
                  avatar: expect.any(String),
                  year_of_birth: mockAuthor.yearOfBirth,
                  year_of_dead: mockAuthor.yearOfDead,
                  story: expect.stringMatching(new RegExp(`\/html\/author\/{0}\/${mockAuthor.name}.html, \/json\/author\/{1}\/${mockAuthor.name}.json`.format('\\d+', '\\d+'), 'gm')),
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
