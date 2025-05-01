const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');

module.exports = {
  PrismaNotFoundError: new PrismaClientKnownRequestError('Record not found!', { code: 'P2025' }),
  PrismaDuplicateError: new PrismaClientKnownRequestError('Some fields was duplicate!', { code: 'P2002' }),
};
