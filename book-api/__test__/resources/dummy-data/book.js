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
   */
  constructor() {
    super(
      {
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
            name: 'name 1',
          },
          {
            image: 'image 2',
            name: 'name 2',
          },
        ],
        book_author: [
          {
            author: {
              author_id: Date.now().toString(),
              name: 'author 1',
              avatar: 'avatar 1',
            },
          },
          {
            author: {
              author_id: Date.now().toString(),
              name: 'author 2',
              avatar: 'avatar 2',
            },
          },
        ],
        avatar: 'avatar',
        category: {
          name: 'category name',
          category_id: Date.now().toString(),
          avatar: 'category avatar',
        },
      },
      null,
      {
        bookId: expect.any(String),
        name: expect.any(String),
        pdf: expect.any(String),
        publishedDay: expect.any(String),
        publishedTime: expect.any(Number),
        avatar: expect.any(String),
        images: expect.any(Array),
        authors: expect.any(Array),
        categoryId: expect.any(String),
        category: {
          name: expect.any(String),
          categoryId: expect.any(String),
          avatar: expect.any(String),
        },
        introduce: {
          html: expect.any(String),
          json: expect.any(String),
        },
      }
    );
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
  }

  /**
   * Create the book list for test.
   *
   * @static
   * @param {number} length - The number of books who want to create.
   * @return {object[]} - The book list.
   */
  static createMockBookList(length) {
    return Array.apply(null, Array(length)).map(() => BookDummyData.MockData);
  }
}

module.exports = BookDummyData;
