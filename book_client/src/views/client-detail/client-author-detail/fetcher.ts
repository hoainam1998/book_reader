import { AxiosResponse } from 'axios';
import { AuthorService } from 'services';

export const getAuthorDetail = (authorId: string): Promise<AxiosResponse> => {
  return AuthorService.post('detail', {
    authorId,
    query: {
      name: true,
      sex: true,
      avatar: true,
      yearOfBirth: true,
      yearOfDead: true,
      storyFile: {
        html: true,
      },
    },
  });
};
