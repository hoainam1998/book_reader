const { Type, Exclude } = require('class-transformer');
const OutputValidate = require('#services/output-validate');

class AuthorDTO extends OutputValidate {
  @Exclude()
  @Type(() => String)
  author_id;

  @Type(() => String)
  name;

  @Type(() => Number)
  sex;

  @Type(() => String)
  avatar;

  @Exclude()
  @Type(() => Number)
  year_of_dead;

  @Type(() => Number)
  get yearOfDead() {
    return this.year_of_dead;
  }

  @Exclude()
  @Type(() => Number)
  year_of_birth;

  @Type(() => Number)
  get yearOfBirth() {
    return this.year_of_birth;
  }

  @Type(() => String)
  story;

  @Type(() => String)
  get storyFile() {
    return this.story?.split(', ')[0] || '';
  }

  @Type(() => String)
  get authorId() {
    return this.author_id;
  }
}

module.exports = AuthorDTO;
