import { AxiosResponse } from 'axios';
import { LoaderFunctionArgs } from 'react-router-dom';
import { AuthorService } from 'services';
import { handleNotfoundApiError } from 'utils';

export const authorPagination = ({ request }: LoaderFunctionArgs): Promise<AxiosResponse> => {
  const url: URL = new URL(request.url);
  const pageSize: number = parseInt(url.searchParams.get('pageSize') || '10');
  const pageNumber: number = parseInt(url.searchParams.get('pageNumber') || '1');
  const keyword: string | null = url.searchParams.get('keyword');

  return handleNotfoundApiError(
    AuthorService.post('pagination', {
      query: {
        authorId: true,
        name: true,
        sex: true,
        avatar: true,
        storyFile: true,
        yearOfBirth: true,
        yearOfDead: true,
      },
      pageSize,
      pageNumber,
      keyword
    })
  );
};

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
