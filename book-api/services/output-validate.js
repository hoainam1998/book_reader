const Singleton = require('#services/singleton');

/**
 * Class provided prisma instance.
 * @class
 * @extends Singleton
 */
class Validate extends Singleton {

  /**
   * Function will validate the out put.
   * @static
   * @function parse
   * @param {Object} val - Value compare.
   * @return {{
   *  success: boolean,
   *  message: string,
   *  data: Object
   * }}
   */
  static parse;

  /**
  * Convert object value to z schema object.
  *
  * @static
  * @param {Object} value - The value to convert.
  */
  static prepare(value) {
    /**
    * Determinate output value is the equal with original value.
    *
    * @param {Object} graphQlResult - The object will be compare with value.
    * @return {boolean} - The compare result.
    */
    const recursiveCheck = (graphQlResult) => {
      if (!graphQlResult) {
        return false;
      }

      if (graphQlResult.isValueEqual(value)) {
        return true;
      } else {
        return Object.values(graphQlResult).some((v) => {
          if (typeof v === 'object') {
            return recursiveCheck(v);
          }
          return false;
        });
      }
    };

    Validate.parse = (dtoValue) => {
      const { data, response } = dtoValue;

      if (recursiveCheck(data ?? response ?? dtoValue)) {
        return {
          success: true,
          data: response
        };
      } else {
        return {
          success: false,
          message: 'Output did not expect!',
          data: response
        };
      }
    };
  }
}

module.exports = Validate;

