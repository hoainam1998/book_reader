const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');
const { PRISMA_ERROR_CODE } = require('#constants');

/**
 * Simulate foreign key conflict error.
 *
 * @class
 * @extends PrismaClientKnownRequestError
 */
class PrismaForeignConflict extends PrismaClientKnownRequestError {
  constructor(field) {
    super(`Foreign key constraint failed on the field: ${field}`, { code: PRISMA_ERROR_CODE.FOREIGN_KEY_CONFLICT });
  }
}

/**
 * Simulate data validation error.
 *
 * @class
 * @extends PrismaClientKnownRequestError
 */
class PrismaDataValidationError extends PrismaClientKnownRequestError {
  constructor(message) {
    super(message, { code: PRISMA_ERROR_CODE.DATA_VALIDATION });
  }
}

module.exports = {
  PrismaNotFoundError: new PrismaClientKnownRequestError('Record not found!', {
    code: PRISMA_ERROR_CODE.RECORD_NOT_FOUND,
  }),
  PrismaDuplicateError: new PrismaClientKnownRequestError('Some fields was duplicate!', {
    code: PRISMA_ERROR_CODE.UNIQUE_DUPLICATE,
  }),
  PrismaDataValidationError,
  PrismaForeignConflict,
};
