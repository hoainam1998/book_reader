const DummyDataApi = require('./api');

class AuthorDummyData extends DummyDataApi {
  static default = new AuthorDummyData();

  constructor() {
    super({
      author_id: Date.now().toString(),
      name: 'author name',
      sex: 0,
      avatar: 'avatar',
      yearOfBirth: 1900,
      yearOfDead: 2000,
      story: {
        html: '<div>content</div>',
        json: '{ "json": content }',
      },
    }, {
      author_id: expect.any(String),
      name: expect.any(String),
      sex: expect.any(Number),
      avatar: expect.any(String),
      yearOfBirth: expect.any(Number),
      yearOfDead: expect.any(Number),
      story: {
        html: expect.any(String),
        json: expect.any(String),
      },
    });
  }
}

module.exports = AuthorDummyData;
