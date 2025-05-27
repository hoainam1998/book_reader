/**
 * Class support organization dummy data and behavior attach with them.
 *
 * @class
 */
class DummyDataApi {
  _mockData;
  _requestData;
  _expectedTypes;

  /**
  * Create dummy data instance.
  *
  * @param {object} mockData - The mocking data.
  * @param {object} mockRequestData - The mocking request data.
  * @param {object} expectedTypes - Expected type of mock data.
  */
  constructor(mockData, mockRequestData, expectedTypes) {
    this._mockData = mockData;
    this._requestData = mockRequestData || mockData;
    this._expectedTypes = expectedTypes;
  }

  /**
  * Access mock data.
  *
  * @static
  * @return {object} The mock data.
  */
  static get MockData() {
    return this.default._mockData;
  }

  /**
  * Access mock request data.
  *
  * @static
  * @return {object} The mock request data.
  */
  static get MockRequestData() {
    return this.default._requestData;
  }

  /**
  * Access expect types.
  *
  * @static
  * @return {object} The expected types.
  */
  static get ExpectedTypes() {
    return this.default._expectedTypes;
  }

  /**
  * Set expect types.
  *
  * @static
  * @param {object} value - The new expect types.
  */
  static set ExpectedTypes(value) {
    this.default._expectedTypes = value;
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
