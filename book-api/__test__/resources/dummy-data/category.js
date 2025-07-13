const DummyDataApi = require('./api');

/**
 * The class store category data and behavior of them.
 *
 * @class
 * @extends DummyDataApi
 */
class CategoryDummyData extends DummyDataApi {
  static default = new CategoryDummyData();

  /**
   * Create category dummy data instance.
   */
  constructor() {
    super(
      {
        category_id: Date.now().toString(),
        name: 'category name',
        avatar: 'avatar',
        _count: {
          book: 2,
        },
      },
      null,
      {
        categoryId: expect.any(String),
        name: expect.any(String),
        avatar: expect.any(String),
        disabled: expect.any(Boolean),
      }
    );
  }

  /**
   * Create the expected category list.
   *
   * @static
   * @param {object} requestBodyQuery - The request body query.
   * @param {number} length - The number category create.
   * @param {string[]} [excludeFields=[]] - The fields should remove.
   * @return {object[]} - The expected category list.
   */
  static generateCategoryExpectedList(requestBodyQuery, length, excludeFields = []) {
    return Array.apply(null, Array(length)).map(() => {
      return CategoryDummyData.generateExpectedObject(requestBodyQuery, excludeFields);
    });
  }

  /**
   * Create the category list for test.
   *
   * @static
   * @param {number} length - The number of categories who want to create.
   * @return {object[]} - The category list.
   */
  static createMockCategoryList(length) {
    return Array.apply(null, Array(length)).map(() => CategoryDummyData.MockData);
  }
}

module.exports = CategoryDummyData;
