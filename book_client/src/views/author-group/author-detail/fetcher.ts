import { AxiosResponse } from 'axios';
import { LoaderFunctionArgs } from 'react-router-dom';
import { AuthorService } from 'services';

export const createAuthor = (formData: FormData): Promise<AxiosResponse> => {
  return AuthorService.post('create', formData);
};

export const updateAuthor = (formData: FormData): Promise<AxiosResponse> => {
  return AuthorService.put('update', formData);
};

export const loadAuthorDetail = ({ params }: LoaderFunctionArgs): Promise<AxiosResponse> | null => {
  const authorId: string | undefined = params.id;
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
        json: true,
      },
    },
  });
};
