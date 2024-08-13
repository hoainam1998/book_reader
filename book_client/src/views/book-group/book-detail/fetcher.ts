import { AxiosResponse } from 'axios';
import { CategoryService, RequestBody } from 'services';
import { showToast } from 'utils';

export const loadAllCategory = (): Promise<AxiosResponse> => {
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
