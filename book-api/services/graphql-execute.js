const { execute } = require('graphql');
const { validateExecuteQuery } = require('#decorators');

class GraphqlExecute {
  _prismaField;

  /**
  * Create graphql execute service class.
  * @param {object} schema - The schema.
  * @param {class} PrismaField - PrismaField class.
  */
  constructor(schema, PrismaField) {
    this._schema = schema;
    this._prismaField = new PrismaField();
  }

  /**
  * Getting prisma field instance.
  * @return {object} - The prisma field instance.
  */
  get PrismaField() {
    return this._prismaField;
  }

  /**
  * Execute graphql query.
  * @param {string} query - The graphql query string.
  * @param {object} variables - The graphql variables.
  * @param {string} select - The fields selected.
  * @return {(object | promise)} - The graphql execute result.
  */
  @validateExecuteQuery
  execute(query, variables, select) {
    return execute({
      schema: this._schema,
      document: query,
      variableValues: variables,
      contextValue: select,
    });
  }
}

module.exports = GraphqlExecute;
