import { AxiosResponse } from 'axios';
import { AuthorService } from 'services';

const createAuthor = (formData: FormData): Promise<AxiosResponse> => {
  formData.append('query',
    `query CreateAuthor($author: AuthorInformation) {
      author {
        create(author: $author) {
          message
        }
      }
    }`
  );
  return AuthorService.graphql('/create-author', formData);
};

export {
  createAuthor
};
