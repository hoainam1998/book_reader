const mockAxios = jest.createMockFromModule('axios');

export default {
  post: () => new Promise(() => {}),
  create: jest.fn(() => mockAxios),
  default: () => new Promise(() => {}),
  get: () => new Promise(() => {}),
  put: () => new Promise(() => {}),
  delete: () => new Promise(() => {}),
  patch: () => new Promise(() => {}),
};
