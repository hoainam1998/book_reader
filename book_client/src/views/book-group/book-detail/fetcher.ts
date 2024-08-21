import { AxiosResponse } from 'axios';
import { CategoryService, BookService, RequestBody } from 'services';
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

export {
  loadAllCategory,
  saveBookInformation
};
