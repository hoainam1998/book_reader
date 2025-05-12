const { HTTP_CODE } = require('#constants');
const { COMMON } = require('#messages');

/**
 * Determine test case skip or not.
 *
 * @param {Object} testInfo - The test information.
 * @return {boolean} - The flag determine test case will be skip or not.
 */
const isTestSkip = (testInfo) => {
  if (!testInfo) {
    return true;
  }
  return testInfo && Object.hasOwn(testInfo, 'skip') && testInfo.skip === true;
};

/**
 * Determine test case skip or not.
 *
 * @param {string} describeTitle - The test describe name.
 * @param {{
 * describe: string,
 * name: string,
 * method: string,
 * url: string,
 * [origin]: string,
 * }[]} testParameter - An array of test information.
 * @param {string} serverName - Name of test server are running.
 * @return {Function} The test describe.
 */
module.exports = (describeTitle, testParameter, serverName) => {
  return describe(describeTitle, () => {

    let urlInvalidRequest;
    let methodAllowedRequest;
    let corsOriginRequest;
    testParameter.forEach((info) => {
      switch (info.name) {
        case 'url test':
          urlInvalidRequest = info;
          break;
        case 'method test':
          methodAllowedRequest = info;
          break;
        case 'cors test':
          corsOriginRequest = info;
          break;
        default: break;
      }
    });

    if (!isTestSkip(urlInvalidRequest)) {
      test(urlInvalidRequest.describe, (done) => {
        expect.hasAssertions();
        globalThis.api[urlInvalidRequest.method](urlInvalidRequest.url)
          .expect(HTTP_CODE.NOT_FOUND)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            expect(response.body.message).toBe(COMMON.URL_INVALID.format(response.req.path));
            done();
          });
      });
    }

    if (!isTestSkip(methodAllowedRequest)) {
      test(methodAllowedRequest.describe, (done) => {
        expect.hasAssertions();
        globalThis.api[methodAllowedRequest.method](methodAllowedRequest.url)
          .expect(HTTP_CODE.METHOD_NOT_ALLOWED)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            expect(response.body.message).toBe(COMMON.METHOD_NOT_ALLOWED.format(response.req.method, response.req.path));
            done();
          });
      });
    }

    if (!isTestSkip(corsOriginRequest)) {
      test(corsOriginRequest.describe, (done) => {
        expect.hasAssertions();
        globalThis.api[corsOriginRequest.method](corsOriginRequest.url)
          .then((response) => {
            const originUrl = `${response.request.protocol}//${response.request.host}`;
            expect(response.header['access-control-allow-origin']).toBe(corsOriginRequest.origin || originUrl);
            done();
          });
      });
    }
  });
};
