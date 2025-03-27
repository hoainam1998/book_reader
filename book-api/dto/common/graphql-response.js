const { Expose, Exclude } = require('class-transformer');
const { getGraphqlFinalData } = require('#utils');

/**
 * The graphql response base class.
 *
 * @class
 */
class GraphqlResponse {
  static dto;

    /**
  * Create graphql response instance.
  *
  * @param {class} express - The express object.
  */
  constructor(dto) {
    GraphqlResponse.dto = dto;
  }

  @Exclude()
  data;

  @Expose({ toClassOnly: true })
  get response() {
    return getGraphqlFinalData(this.data);
  }

  /**
  * Validate output value.
  *
  * @static
  * @param {Object} value - The value to convert.
  */
  static parse(value) {
    return GraphqlResponse.dto.parse(value);
  }
}

module.exports = GraphqlResponse;
