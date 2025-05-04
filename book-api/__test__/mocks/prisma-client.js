module.exports = jest.mock('#services/prisma-client', () => ({
  user: {
    findFirstOrThrow: jest.fn().mockResolvedValue(new Promise(() => {})),
    update: jest.fn().mockResolvedValue(new Promise(() => {})),
    create: jest.fn().mockResolvedValue(),
  },
}));
