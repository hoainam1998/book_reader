const { Expose, Exclude } = require('class-transformer');
const { getGraphqlFinalData } = require('#utils');

class GraphqlResponse {
  @Exclude()
  data;

  @Expose({ toClassOnly: true })
  get response() {
    return getGraphqlFinalData(this.data);
  }
}

module.exports = GraphqlResponse;
