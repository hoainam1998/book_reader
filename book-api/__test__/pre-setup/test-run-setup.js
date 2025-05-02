const TestServer = require('#test/resources/test-server');
const prismaClientMock = require('#test/mocks/prisma-client');
const prismaClient = require('#services/prisma-client');
require('#test/pre-setup/pre-require-test-suite');
globalThis.prismaClient = prismaClient;

globalThis.expressMiddleware = {
  req: {
    get: function(field) {
      return this[field];
    },
  },
  res: {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  },
  next: jest.fn(),
};

beforeAll((done) => {
  globalThis.TestServer = TestServer;
  globalThis.api = TestServer.startTestServer(done, global.name);
});

afterAll((done) => TestServer.closeTestServer(done, global.name));

afterEach((done) => {
  prismaClientMock.clearAllMocks();
  globalThis.expressMiddleware.res.status.mockClear();
  globalThis.expressMiddleware.res.json.mockClear();
  globalThis.expressMiddleware.next.mockClear();
  done();
});
