module.exports = jest.mock('#services/prisma-client', () => ({
  user: {
    findFirstOrThrow: jest.fn().mockResolvedValue(new Promise(() => {})),
    update: jest.fn().mockResolvedValue(new Promise(() => {})),
    create: jest.fn().mockResolvedValue(),
    count: jest.fn().mockResolvedValue(),
    findMany: jest.fn().mockResolvedValue(),
    findUniqueOrThrow: jest.fn().mockResolvedValue(),
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
  author: {
    create: jest.fn().mockResolvedValue(),
    update: jest.fn().mockResolvedValue(),
    findUniqueOrThrow: jest.fn().mockResolvedValue(),
    findMany: jest.fn().mockResolvedValue(),
    count: jest.fn().mockResolvedValue(),
  },
  $transaction: jest.fn().mockResolvedValue(),
}));
