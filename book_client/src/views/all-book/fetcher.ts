import { AxiosResponse } from 'axios';
import path from 'router/paths';
import { BookService, RequestBody } from 'services';
import { PaginationCondition } from 'interfaces';

const query = {
  bookId: true,
  name: true,
  avatar: true,
  category: true,
  authors: {
    authorId: true,
    name: true,
    avatar: true,
  }
};

export const bookPagination = (pageNumber: number, condition?: PaginationCondition): Promise<AxiosResponse> => {
  const requestBody: RequestBody = {
    query,
    pageSize: 10,
    pageNumber,
  };

  if (condition && condition.id) {
    if (window.location.pathname.includes(path.CATEGORIES)) {
      requestBody.by = {
        categoryId: condition.id
      };
    } else if (window.location.pathname.includes(path.AUTHORS)) {
      requestBody.by = {
        authorId: condition.id
      };
    }
  }

  return BookService.KeepAlive.NotFoundAccepted.post('pagination', requestBody);
};
