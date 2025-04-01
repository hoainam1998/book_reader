const { HTTP_CODE } = require('#constants');
const { COMMON } = require('#messages');

module.exports = {
  urlNotFound: (describe, request) => {
    test(describe, (done) => {
      request
        .expect(HTTP_CODE.NOT_FOUND)
        .expect('Content-Type', /application\/json/)
        .then((response) => {
          expect(response.body.message).toBe(COMMON.URL_INVALID.format(response.req.path));
          done();
        });
    }, 1000);
  },
  methodNotAllowed: (describe, request) => {
    test(describe, (done) => {
      request
        .expect(HTTP_CODE.METHOD_NOT_ALLOWED)
        .expect('Content-Type', /application\/json/)
        .then((response) => {
          expect(response.body.message)
            .toBe(COMMON.METHOD_NOT_ALLOWED.format(response.req.method, response.req.path));
          done();
        });
    }, 1000);
  }
};
