import { AxiosResponse } from 'axios';
import { ClientService, BookService } from 'services';

const READER_DETAIL_QUERY = {
  clientId: true,
  firstName: true,
  lastName: true,
  avatar: true,
  email: true,
  sex: true,
  phone: true,
  favoriteBooks: {
    name: true,
    avatar: true,
    bookId: true,
    authors: {
      name: true,
      authorId: true,
    }
  },
  readLate: {
    name: true,
    avatar: true,
    bookId: true,
    authors: {
      name: true,
      authorId: true,
    },
    createAt: true
  },
  usedRead: {
    name: true,
    avatar: true,
    bookId: true,
    authors: {
      name: true,
      authorId: true,
    },
    createAt: true
  }
};

const excludeQuery = (...keys: string[]): { [key: string]: any } => {
  return Object.keys(READER_DETAIL_QUERY)
    .reduce<{ [key: string]: any }>((newQuery, key) => {
      if (!keys.includes(key)) {
        newQuery[key] = READER_DETAIL_QUERY[key as keyof typeof READER_DETAIL_QUERY];
      }
      return newQuery;
    }, {});
};

export const getAllReaders = (clientId?: string): Promise<AxiosResponse> => {
  return ClientService.post('all', {
    exclude: clientId,
    query: {
      email: true,
      phone: true,
    },
  });
};

export const getReaderDetail = (): Promise<AxiosResponse> => {
  return ClientService.post('detail', {
    query: READER_DETAIL_QUERY,
  });
};

export const getReaderInformation = (): Promise<AxiosResponse> => {
  return ClientService.post('detail', {
    query: excludeQuery('favoriteBooks', 'readLate', 'usedRead'),
  });
};

export const getFavoriteBooks = (): Promise<AxiosResponse> => {
  return ClientService.post('detail', {
    query: {
      favoriteBooks: READER_DETAIL_QUERY.favoriteBooks,
    }
  });
};

export const getReadLateBooks = (): Promise<AxiosResponse> => {
  return ClientService.post('detail', {
    query: {
      readLate: READER_DETAIL_QUERY.readLate,
    }
  });
};

export const getUsedReadBooks = (): Promise<AxiosResponse> => {
  return ClientService.post('detail', {
    query: {
      usedRead: READER_DETAIL_QUERY.usedRead,
    }
  });
};

export const logout = (): Promise<any> => {
  return new Promise((resolve) => resolve('ok'));
};

export const deleteFavoriteBook = (bookId: string): Promise<AxiosResponse> => {
  return BookService.delete(`delete-favorite-book/${bookId}`);
};

export const deleteUsedReadBook = (bookId: string): Promise<AxiosResponse> => {
  return BookService.delete(`delete-used-read-book/${bookId}`);
};

export const deleteReadLateBook = (bookId: string): Promise<AxiosResponse> => {
  return BookService.delete(`delete-read-late-book/${bookId}`);
};
