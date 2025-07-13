const { Type } = require('class-transformer');
const AuthorDTO = require('#dto/author/author');

class AuthorStory {
  @Type(() => String)
  html;

  @Type(() => String)
  json;
}

class AuthorDetailDTO extends AuthorDTO {
  @Type(() => AuthorStory)
  get storyFile() {
    const [html, json] = this.story?.split(', ') || ['', ''];

    return {
      html,
      json,
    };
  }
}

module.exports = AuthorDetailDTO;
