/**
 * Class support organization dummy data and behavior attach with them.
 *
 * @class
 */
class DummyDataApi {
  _mockData;
  _expectedTypes;

  /**
  * Create dummy data instance.
  *
  * @param {object} mockData - The mocking data.
  * @param {object} expectedTypes - Expected type of mock data.
  */
  constructor(mockData, expectedTypes) {
    this._mockData = mockData;
    this._expectedTypes = expectedTypes;
  }

  get MockData() {
    return this._mockData;
  }

  get ExpectedTypes() {
    return this._expectedTypes;
  }

  /**
  * Return query object with type accord with expected types.
  *
  * @param {object} query - The requirement query object.
  * @param {array} [excludeFields=[]] - The fields should be remove.
  * @return {object} - The expected object.
  */
  generateExpectedObject(query, excludeFields = []) {
    return Object.keys(query).reduce((queryExpected, field) => {
      if (excludeFields.length) {
        if (excludeFields.includes(field)) {
          return queryExpected;
        }
      }
      queryExpected[field] = this.ExpectedTypes[field];
      return queryExpected;
    }, {});
  }
}

module.exports = DummyDataApi;
