import { AxiosResponse } from 'axios';
import { CategoryService, BookService, AuthorService, RequestBody } from 'services';

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
    }
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

const getAllBookName = (): Promise<AxiosResponse> => {
  return BookService.get('book-name');
};

const getAllAuthor = (): Promise<AxiosResponse> => {
  return AuthorService.post('all', {
    query: {
      authorId: true,
      avatar: true,
      name: true
    }
  });
};

const getBookIntroduceFile = (bookId: string) => {
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
    bookId
  };
  return BookService.post('/save-introduce', body);
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
  return BookService.put('/update-introduce', body);
};

export {
  loadAllCategory,
  saveBookInformation,
  getBookDetail,
  saveIntroduceFile,
  getBookIntroduceFile,
  getAllBookName,
  updateBookInformation,
  updateIntroduceFile,
  getAllAuthor,
};
