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
