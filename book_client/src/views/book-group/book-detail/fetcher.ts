import { AxiosResponse } from 'axios';
import { CategoryService, BookService, RequestBody } from 'services';
import { StepStorage } from 'storage';
import { showToast } from 'utils';

type DefaultCategoryListType = {
  data: {
    category: {
      all: {
        name: string;
        category_id: string;
      }[]
    }
  };
};

const loadAllCategory = (): Promise<AxiosResponse | DefaultCategoryListType> => {
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
  const defaultCategoryList: DefaultCategoryListType = {
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
    query: `query GetBookDetail($bookId: ID) { book { detail(bookId: $bookId) { name, pdf, publishedTime, publishedDay, categoryId, images { image, name } } } }`,
    bookId,
  });
};

const shouldRevalidateBookLoader = (): boolean => {
  return +(StepStorage.getItem() || 1) === 1;
};

export {
  loadAllCategory,
  saveBookInformation,
  getBookDetail,
  shouldRevalidateBookLoader
};
