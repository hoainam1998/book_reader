import { AxiosResponse } from 'axios';
import { CategoryService, BookService, RequestBody } from 'services';
import { StepStorage } from 'storage';
import { showToast } from 'utils';

const loadAllCategory = (): Promise<AxiosResponse> => {
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
};

const saveBookInformation = (formData: FormData): Promise<AxiosResponse> => {
  return BookService.graphql('save-book-info', formData);
};

const getBookDetail = (bookId: string): Promise<AxiosResponse> =>  {
  return BookService.graphql('detail', {
    query: 'query GetBookDetail($bookId: ID) { book { detail(bookId: $bookId) { name } } }',
    bookId,
  });
};

const shouldRevalidateBookLoader = (): boolean => {
  return !!StepStorage.getItem();
};

export {
  loadAllCategory,
  saveBookInformation,
  getBookDetail,
  shouldRevalidateBookLoader
};
