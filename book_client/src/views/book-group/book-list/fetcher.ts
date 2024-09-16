import { AxiosResponse } from 'axios';
import { LoaderFunctionArgs } from 'react-router-dom';
import { BookService } from 'services';

export const bookPagination = ({ request }: LoaderFunctionArgs): Promise<AxiosResponse> => {
  const url: URL = new URL(request.url);
  const pageSize: number = parseInt(url.searchParams.get('pageSize') || '10');
  const pageNumber: number = parseInt(url.searchParams.get('pageNumber') || '1');

  return BookService.graphql('pagination', {
    query: `query BookPagination($pageSize: Int, $pageNumber: Int) {
      book {
        pagination(pageSize: $pageSize, pageNumber: $pageNumber) {
          list {
            bookId,
            name,
            pdf,
            publishedTime,
            publishedDay,
            category,
            introduce,
            avatar
          },
          total
        }
      }
    }`,
  pageSize,
  pageNumber
  });
};
