const DummyDataApi = require('./api');

/**
 * The class store book data and behavior of them.
 *
 * @class
 * @extends DummyDataApi
 */
class BookDummyData extends DummyDataApi {
  static default = new BookDummyData();

  /**
  * Create book dummy data instance.
  *
  * @param {object} mockData - The mocking data.
  * @param {object} expectedTypes - Expected type of mock data.
  */
  constructor() {
    super({
      book_id: Date.now().toString(),
      name: 'book 1',
      pdf: 'pdf/new_pdf_file.pdf',
      published_day: Date.now().toString(),
      published_time: 1,
      category_id: Date.now().toString(),
      introduce_file: 'html/new_file.html, json/new_file.json',
      book_image: [
        {
          image: 'image 1',
          name: 'name 1'
        },
        {
          image: 'image 2',
          name: 'name 2'
        }
      ],
      book_author: [
        {
          author_id: Date.now().toString(),
        },
        {
          author_id: Date.now().toString(),
        }
      ],
      avatar: 'avatar',
      category: {
        name: 'category name'
      },
    }, {
      bookId: expect.any(String),
      name: expect.any(String),
      pdf: expect.any(String),
      publishedDay: expect.any(String),
      publishedTime: expect.any(Number),
      avatar: expect.any(String),
      images: expect.any(Array),
      authors: expect.any(Array),
      categoryId: expect.any(String),
      category: expect.any(String),
      introduce: {
        html: expect.any(String),
        json: expect.any(String),
      },
    });
  }

  static get MockData() {
    return BookDummyData.default.MockData;
  }

  static set ExpectedTypes(value) {
    BookDummyData.default.ExpectedTypes = value;
  }

  static get ExpectedTypes() {
    return BookDummyData.default.ExpectedTypes;
  }

  /**
  * Return query object with type accord with expected types.
  *
  * @static
  * @param {object} query - The requirement query object.
  * @param {array} [excludeFields=[]] - The fields should be remove.
  * @return {object} - The expected object.
  */
  static generateExpectedObject(query, excludeFields = []) {
    return BookDummyData.default.generateExpectedObject(query, excludeFields);
  }

  /**
   * Create the expected book list.
   *
   * @static
   * @param {object} requestBodyQuery - The request body query.
   * @param {number} length - The number book create.
   * @param {string[]} [excludeFields=[]] - The fields should remove.
   * @return {object[]} - The expected book list.
   */
  static generateBookExpectedList(requestBodyQuery, length, excludeFields = []) {
    return Array.apply(null, Array(length)).map(() => {
      return BookDummyData.generateExpectedObject(requestBodyQuery, excludeFields);
    });
  };

  /**
   * Create the book list for test.
   *
   * @static
   * @param {number} length - The number of books who want to create.
   * @return {object[]} - The book list.
   */
  static createMockBookList (length) {
    return Array.apply(null, Array(length)).map(() => BookDummyData.MockData);
  };
};

module.exports = BookDummyData;
