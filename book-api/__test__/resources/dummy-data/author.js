const DummyDataApi = require('./api');

const mockData = {
  author_id: Date.now().toString(),
  name: 'author name',
  sex: 0,
  avatar: 'avatar',
  year_of_birth: 1900,
  year_of_dead: 2000,
  story: `/html/author/${Date.now()}/author name.html, /json/author/${Date.now()}/author name.json`
};

const requestData = {
  ...mockData,
   story: {
    html: '<div>content</div>',
    json: '{ "json": content }',
  },
};

class AuthorDummyData extends DummyDataApi {
  static default = new AuthorDummyData();

  constructor() {
    super(
      mockData,
      requestData,
      {
      author_id: expect.any(String),
      name: expect.any(String),
      sex: expect.any(Number),
      avatar: expect.any(String),
      yearOfBirth: expect.any(Number),
      yearOfDead: expect.any(Number),
      story: expect.any(String),
    });
  }
}

module.exports = AuthorDummyData;
