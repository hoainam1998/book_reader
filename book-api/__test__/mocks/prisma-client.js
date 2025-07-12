module.exports = jest.mock('#services/prisma-client', () => ({
  user: {
    findFirstOrThrow: jest.fn().mockResolvedValue(),
    update: jest.fn().mockResolvedValue(),
    create: jest.fn().mockResolvedValue(),
    count: jest.fn().mockResolvedValue(),
    findMany: jest.fn().mockResolvedValue(),
    findUniqueOrThrow: jest.fn().mockResolvedValue(),
    delete: jest.fn().mockResolvedValue(),
  },
  book: {
    create: jest.fn().mockResolvedValue(),
    update: jest.fn().mockResolvedValue(),
    findUniqueOrThrow: jest.fn().mockResolvedValue(),
    findMany: jest.fn().mockResolvedValue(),
    count: jest.fn().mockResolvedValue(),
  },
  book_image: {
    deleteMany: jest.fn().mockResolvedValue(),
    createMany: jest.fn().mockResolvedValue(),
  },
  book_author: {
    createMany: jest.fn().mockResolvedValue(),
    deleteMany: jest.fn().mockResolvedValue(),
  },
  favorite_books: {
    create: jest.fn().mockResolvedValue(),
    deleteMany: jest.fn().mockResolvedValue(),
  },
  read_late: {
    create: jest.fn().mockResolvedValue(),
    deleteMany: jest.fn().mockResolvedValue(),
  },
  used_read: {
    create: jest.fn().mockResolvedValue(),
    deleteMany: jest.fn().mockResolvedValue(),
  },
  author: {
    create: jest.fn().mockResolvedValue(),
    update: jest.fn().mockResolvedValue(),
    findUniqueOrThrow: jest.fn().mockResolvedValue(),
    findMany: jest.fn().mockResolvedValue(),
    count: jest.fn().mockResolvedValue(),
  },
  category: {
    create: jest.fn().mockResolvedValue(),
    update: jest.fn().mockResolvedValue(),
    findMany: jest.fn().mockResolvedValue(),
    count: jest.fn().mockResolvedValue(),
    findUniqueOrThrow: jest.fn().mockResolvedValue(),
    delete: jest.fn().mockResolvedValue(),
  },
  reader: {
    update: jest.fn().mockResolvedValue(),
    create: jest.fn().mockResolvedValue(),
    findFirstOrThrow: jest.fn().mockResolvedValue(),
    findUniqueOrThrow: jest.fn().mockResolvedValue(),
    update: jest.fn().mockResolvedValue(),
    findMany: jest.fn().mockResolvedValue(),
    count: jest.fn().mockResolvedValue(),
  },
  $transaction: jest.fn().mockResolvedValue(),
}));
