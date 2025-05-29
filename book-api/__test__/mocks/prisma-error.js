const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');

/**
 * Simulate foreign key conflict error.
 *
 * @class
 * @extends PrismaClientKnownRequestError
 */
class PrismaForeignConflict extends PrismaClientKnownRequestError {
  constructor(field) {
    super(`Foreign key constraint failed on the field: ${field}`, { code: 'P2003' });
  }
}

module.exports = {
  PrismaNotFoundError: new PrismaClientKnownRequestError('Record not found!', { code: 'P2025' }),
  PrismaDuplicateError: new PrismaClientKnownRequestError('Some fields was duplicate!', { code: 'P2002' }),
  PrismaForeignConflict,
};
