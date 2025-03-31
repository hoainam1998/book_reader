import { AxiosResponse } from 'axios';
import { LoaderFunctionArgs } from 'react-router-dom';
import { CategoryService, BookService, AuthorService, RequestBody, IQueryType } from 'services';
import { handleNotfoundApiError } from 'utils';

const loadAllCategory = (): Promise<AxiosResponse> => {
  return CategoryService.post('all', {
    query: {
      name: true,
      categoryId: true
    }
  });
};

const saveBookInformation = (formData: FormData): Promise<AxiosResponse> => {
  return BookService.post('create-book', formData);
};

const updateBookInformation = (formData: FormData): Promise<AxiosResponse> => {
  return BookService.put('update-book', formData);
};

const getBookDetail = (bookId: string, includeIntroduceFieldFlag?: boolean): Promise<AxiosResponse> => {
  let select: RequestBody = {
    name: true,
    pdf: true,
    publishedTime: true,
    publishedDay: true,
    categoryId: true,
    avatar: true,
    images: {
      image: true,
      name: true
    },
    authors: true
  };

  if (includeIntroduceFieldFlag) {
    select = {
      ...select,
      introduce: {
        html: true,
        json: true
      }
    };
  }

  return BookService.post('detail', {
    query: select,
    bookId
  });
};

const getAllBooks = (): Promise<AxiosResponse> => {
  return BookService.post('all', {
    query: {
      name: true
    },
  });
};

const getAuthors = (authorIds?: string[], query?: IQueryType): Promise<AxiosResponse> => {
  const queries = query
  ? query
  : {
    authorId: true,
    avatar: true,
    name: true
  };

  return AuthorService.post('filter', {
    query: queries,
    authorIds,
  });
};

const getBookIntroduceFile = (bookId: string): Promise<AxiosResponse> => {
  return BookService.post('detail', {
    query: {
      introduce: {
        html: true,
        json: true,
      }
    },
    bookId
  });
};

const saveIntroduceFile = (
  html: string,
  json: string,
  fileName: string,
  bookId: string
): Promise<AxiosResponse> => {
  const body: RequestBody = {
    html,
    json,
    fileName,
    bookId,
  };
  return BookService.post('save-introduce', body);
};

const updateIntroduceFile = (
  html: string,
  json: string,
  fileName: string,
  bookId: string
): Promise<AxiosResponse> => {
  const body: RequestBody = {
    html,
    json,
    fileName,
    bookId
  };
  return BookService.put('update-introduce', body);
};

const bookPagination = ({ request }: LoaderFunctionArgs): Promise<AxiosResponse> => {
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

export {
  loadAllCategory,
  bookPagination,
  saveBookInformation,
  getBookDetail,
  saveIntroduceFile,
  getBookIntroduceFile,
  getAllBooks,
  updateBookInformation,
  updateIntroduceFile,
  getAuthors,
};
