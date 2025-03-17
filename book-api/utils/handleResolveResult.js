const { GraphQLError } = require('graphql');
const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');
const { graphqlErrorOption, graphqlNotFoundErrorOption } = require('../modules/common-schema')

/*
* Prisma error code enum defined.
*/
const PRISMA_ERROR_CODE = Object.freeze({
  RECORD_NOT_FOUND: 'P2025',
  UNIQUE_DUPLICATE: 'P2002',
});

/**
 * @typedef PrismaErrorCodeMessages
 * @type {Object}
 * @property {string} RECORD_NOT_FOUND - The record not found error message.
 * @property {string} UNIQUE_DUPLICATE - The duplicate error message.
 */

/**
 * Return freezed object.
 *
 * @param {Error} err - The error object.
 * @param {PrismaErrorCodeMessages} messages - The error message object.
 * @throws {GraphQLError | Error}
 */
const handleError = (err, messages) => {
  if (err instanceof PrismaClientKnownRequestError) {
    let message = '';
    switch (err.code) {
      case PRISMA_ERROR_CODE.RECORD_NOT_FOUND:
        message = messages['RECORD_NOT_FOUND'] || 'Data is not found!';
        throw new GraphQLError(message, graphqlNotFoundErrorOption);
      case PRISMA_ERROR_CODE.UNIQUE_DUPLICATE:
        message = messages['UNIQUE_DUPLICATE'] || 'Data is duplicate!';
        throw new GraphQLError(message, graphqlErrorOption);
      default:
        throw new GraphQLError(err.meta.cause, graphqlErrorOption);
    }
  }
  throw err;
};

/**
 * This function is graphql resolve function.
 *
 * @async
 * @callback resolveCallback
 * @return {Promise<*>} - The result.
 */

/**
 * Wrapper resolve result and handle error if it have.
 *
 * @param {resolveCallback} resolveFunction - The resolve function callback.
 * @param {PrismaErrorCodeMessages} messages - The error message object.
 * @return {Promise} - The result.
 * @throws {Error} - Throw error if it have.
 */
module.exports = (resolveFunction, messages) => {
  const prismaErrorCodeNames = Object.keys(PRISMA_ERROR_CODE);
  // checking whether properties and data type is valid or not.
  // if true run resolve function, else throw an error.
  if (Object.keys(messages).every((code) => prismaErrorCodeNames.includes(code) && typeof messages[code] === 'string')) {
    return resolveFunction().catch((err) => handleError(err, messages));
  } else {
    throw new Error('Messages is not valid!');
  }
};
