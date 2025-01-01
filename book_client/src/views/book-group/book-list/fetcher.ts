import { AxiosResponse } from 'axios';
import { LoaderFunctionArgs } from 'react-router-dom';
import { BookService } from 'services';
import { handleNotfoundApiError } from 'utils';

export const bookPagination = ({ request }: LoaderFunctionArgs): Promise<AxiosResponse> => {
  const url: URL = new URL(request.url);
  const pageSize: number = parseInt(url.searchParams.get('pageSize') || '10');
  const pageNumber: number = parseInt(url.searchParams.get('pageNumber') || '1');
  const keyword: string | null = url.searchParams.get('keyword');

  return handleNotfoundApiError(BookService.graphql('pagination', {
    query: `query BookPagination($pageSize: Int, $pageNumber: Int, $keyword: String) {
      book {
        pagination(pageSize: $pageSize, pageNumber: $pageNumber, keyword: $keyword) {
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
    pageNumber,
    keyword
  }));
};

export const getBookDetail = (bookId: string): Promise<AxiosResponse> =>  {
  return BookService.graphql('detail', {
    query: `query GetBookDetail($bookId: ID)
      {
        book {
          detail(bookId: $bookId) {
            name,
            pdf,
            publishedTime,
            publishedDay,
            categoryId,
            avatar,
            introduce {
              html,
              json
            },
            images {
              image,
              name
            }
          }
        }
      }`,
    bookId
  });
};
