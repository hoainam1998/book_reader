import { AxiosResponse } from 'axios';
import { CategoryService, BookService, RequestBody } from 'services';
import { StepStorage } from 'storage';

export type CategoryListType = {
  data: {
    category: {
      all: {
        name: string;
        category_id: string;
      }[]
    }
  };
};

const loadAllCategory = (): Promise<AxiosResponse | CategoryListType> => {
  if (shouldRevalidateBookLoader()) {
    const body: RequestBody = {
      query: `query AllCategory {
        category {
          all {
            name,
            category_id
          }
        }
      }`
    };
    return CategoryService.graphql('all', body);
  }
  const defaultCategoryList: CategoryListType = {
    data: {
      category: {
        all: []
      }
    }
  };
  return Promise.resolve(defaultCategoryList);
};

const saveBookInformation = (formData: FormData): Promise<AxiosResponse> => {
  return BookService.graphql('save-book-info', formData);
};

const getBookDetail = (bookId: string): Promise<AxiosResponse> =>  {
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
            images
              {
                image,
                name
              }
            }
          }
        }`,
    bookId
  });
};

const getAllBookName = (): Promise<AxiosResponse> => {
  return BookService.graphql('get-all-book-name', {
    query: `query GetAllBookName { book { allName } }`
  });
};

const getBookIntroduceFile = (bookId: string) => {
  return BookService.graphql('detail', {
    query: `query GetBookDetail($bookId: ID) {
      book {
        detail(bookId: $bookId) {
          introduce {
            html,
            json
          }
        }
      }
    }`,
    bookId
  });
};

const saveIntroduceFile = (html: string, json: string, fileName: string, bookId: string): Promise<AxiosResponse> => {
  const body: RequestBody = {
    query: `mutation BookMutation($html: String, $json: String, $name: String, $bookId: ID) {
      book {
        saveIntroduce(html: $html, json: $json, name: $name, bookId: $bookId) {
          message
        }
      }
    }`,
    html,
    json,
    fileName,
    bookId
  };
  return BookService.graphql('/save-introduce', body);
};

const shouldRevalidateBookLoader = (): boolean => {
  return [1, 3].includes((StepStorage.getItem() || 1));
};

export {
  loadAllCategory,
  saveBookInformation,
  getBookDetail,
  saveIntroduceFile,
  getBookIntroduceFile,
  getAllBookName,
  shouldRevalidateBookLoader
};
