const DummyDataApi = require('./api');

const mockData = Object.defineProperty(
  {
    author_id: Date.now().toString(),
    name: 'author name',
    sex: 0,
    avatar: 'avatar',
    year_of_birth: 1900,
    year_of_dead: 2000,
    _count: {
      book_author: 1,
    },
  },
  'story',
  {
    get() {
      return `/html/author/${this.author_id}/${this.name}.html, /json/author/${this.author_id}/${this.name}.json`;
    },
  }
);

const requestData = {
  ...mockData,
  story: {
    html: '<div>content</div>',
    json: '{ "json": content }',
  },
};

/**
 * The class store author data and behavior of them.
 *
 * @class
 * @extends DummyDataApi
 */
class AuthorDummyData extends DummyDataApi {
  static default = new AuthorDummyData();

  /**
   * Create author dummy data instance.
   */
  constructor() {
    super(mockData, requestData, {
      authorId: expect.any(String),
      name: expect.any(String),
      sex: expect.any(Number),
      avatar: expect.any(String),
      yearOfBirth: expect.any(Number),
      yearOfDead: expect.any(Number),
      story: expect.any(String),
      disabled: expect.any(Boolean),
      storyFile: {
        html: expect.any(String),
        json: expect.any(String),
      },
    });
  }

  /**
   * Create the expected author list.
   *
   * @static
   * @param {object} requestBodyQuery - The request body query.
   * @param {number} length - The number author create.
   * @param {string[]} [excludeFields=[]] - The fields should remove.
   * @return {object[]} - The expected author list.
   */
  static generateAuthorExpectedList(requestBodyQuery, length, excludeFields = []) {
    return Array.apply(null, Array(length)).map(() => {
      return AuthorDummyData.generateExpectedObject(requestBodyQuery, excludeFields);
    });
  }

  /**
   * Create the author list for test.
   *
   * @static
   * @param {number} length - The number of authors who want to create.
   * @return {object[]} - The author list.
   */
  static createMockAuthorList(length) {
    return Array.apply(null, Array(length)).map(() => AuthorDummyData.MockData);
  }

  /**
   * Create the author json list for test.
   *
   * @static
   * @param {number} length - The number of authors who want to create.
   * @return {object[]} - The author list.
   */
  static createMockAuthorJsonList(length) {
    return Array.apply(null, Array(length)).map(() => JSON.stringify(AuthorDummyData.MockData));
  }
}

module.exports = AuthorDummyData;
