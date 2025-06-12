const { GraphQLError } = require('graphql');
const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');
const {
  graphqlErrorOption,
  graphqlNotFoundErrorOption,
  graphqlUnauthorizedErrorOption,
} = require('../modules/common-schema');
const { PRISMA_ERROR_CODE } = require('#constants');

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
const handleError = (err, messages, errorCodes) => {
  if (err instanceof PrismaClientKnownRequestError) {
    let message = '';
    switch (err.code) {
      case PRISMA_ERROR_CODE.RECORD_NOT_FOUND:
      case PRISMA_ERROR_CODE.UNAUTHORIZED:
        message = 'Data not found!';
        if (messages['UNAUTHORIZED']) {
          message = messages['UNAUTHORIZED'];
          if (errorCodes && errorCodes['UNAUTHORIZED']) {
            graphqlUnauthorizedErrorOption.error_code = errorCodes['UNAUTHORIZED'];
          }
          throw new GraphQLError(message, graphqlUnauthorizedErrorOption);
        } else {
          message = messages['RECORD_NOT_FOUND'];
          throw new GraphQLError(message, graphqlNotFoundErrorOption);
        }
      case PRISMA_ERROR_CODE.UNIQUE_DUPLICATE:
        message = messages['UNIQUE_DUPLICATE'] || 'Data is duplicate!';
        throw new GraphQLError(message, graphqlErrorOption);
      case PRISMA_ERROR_CODE.FOREIGN_KEY_CONFLICT:
        message = messages['FOREIGN_KEY_CONFLICT'] || 'Can not delete this record!';
        throw new  GraphQLError(message, graphqlErrorOption);
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
module.exports = (resolveFunction, messages, errorCodes) => {
  // checking whether properties and data type is valid or not.
  // if true run resolve function, else throw an error.
  if (Object.keys(messages).every((code) => Object.keys(PRISMA_ERROR_CODE).includes(code) && typeof messages[code] === 'string')) {
    return resolveFunction().catch((err) => handleError(err, messages, errorCodes));
  } else {
    throw new Error('Messages is not valid!');
  }
};
