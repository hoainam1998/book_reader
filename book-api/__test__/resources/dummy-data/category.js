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
        avatar: 'avatar'
      },
      null,
      {
        categoryId: expect.any(String),
        name: expect.any(String),
        avatar: expect.any(String),
      }
    );
  }
}

module.exports = CategoryDummyData;
