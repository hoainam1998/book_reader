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
      pdf: 'pdf/new_pdf_file',
      published_day: Date.now().toString(),
      published_time: 1,
      category_id: Date.now().toString(),
      introduce_file: 'html/new_file.html, json/new_file.json',
      avatar: 'avatar'
    }, {
      bookId: expect.any(String),
      name: expect.any(String),
      pdf: expect.any(String),
      publishedDay: expect.any(String),
      publishedTime: expect.any(Number),
      avatar: expect.any(String),
    });
  }

  static get MockData() {
    return BookDummyData.default.MockData;
  }

  /**
  * Return query object with type accord with expected types.
  *
  * @param {object} query - The requirement query object.
  * @param {array} [excludeFields=[]] - The fields should be remove.
  * @return {object} - The expected object.
  */
  static generateExpectedObject(query, excludeFields = []) {
    return BookDummyData.default.generateExpectedObject(query, excludeFields);
  }
};

module.exports = BookDummyData;
