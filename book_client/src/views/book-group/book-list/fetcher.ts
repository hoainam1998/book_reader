import { AxiosResponse } from 'axios';
import { LoaderFunctionArgs } from 'react-router-dom';
import { BookService } from 'services';
import { handleNotfoundApiError } from 'utils';

export const bookPagination = ({ request }: LoaderFunctionArgs): Promise<AxiosResponse> => {
  const url: URL = new URL(request.url);
  const pageSize: number = parseInt(url.searchParams.get('pageSize') || '10');
  const pageNumber: number = parseInt(url.searchParams.get('pageNumber') || '1');
  const keyword: string | null = url.searchParams.get('keyword');

  return handleNotfoundApiError(
    BookService.post('pagination', {
      query: {
        bookId: true,
        name: true,
        pdf: true,
        publishedTime: true,
        publishedDay: true,
        category: true,
        introduce: true,
        avatar: true
      },
      pageSize,
      pageNumber,
      keyword
    })
  );
};

export const getBookDetail = (bookId: string): Promise<AxiosResponse> => {
  return BookService.post('detail', {
    query: {
      name: true,
      pdf: true,
      publishedTime: true,
      publishedDay: true,
      categoryId: true,
      avatar: true,
      introduce: {
        html: true,
        json: true
      },
      images: {
        image: true,
        name: true
      }
    },
    bookId
  });
};
