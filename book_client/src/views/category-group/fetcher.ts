import { AxiosResponse } from 'axios';
import { LoaderFunctionArgs } from 'react-router-dom';
import { CategoryService, RequestBody } from 'services';
import { handleNotfoundApiError, showToast } from 'utils';

const showToastWithName = (message: string) => showToast('Category', message);

export const handlePromise = (promise: Promise<AxiosResponse>): Promise<AxiosResponse> => {
  return promise.then(res => {
    res.data?.category?.create?.message &&
    showToastWithName(res.data.category.create.message);
    res.data?.category.delete?.message &&
    showToastWithName(res.data?.category.delete?.message);
    res.data?.category.update?.message &&
    showToastWithName(res.data?.category.update?.message);
    return res;
  }).catch((error) => {
    showToastWithName(error.response.data.message);
    return error;
  });
};

export const getCategoryDetail = (categoryId: string): Promise<AxiosResponse> => {
  const body: RequestBody = {
    query: `query CategoryDetail($categoryId: ID) {
      category {
        detail (categoryId: $categoryId) {
          name,
          avatar
        }
      }
    }`,
    categoryId
  };
  return CategoryService.graphql('detail', body);
};

export const createCategory = (formData: FormData): Promise<AxiosResponse> => {
  formData.append(
    'query',
    'mutation CreateCategory($category: CategoryInput) { category { create (category:$category) { message } } }'
  );
  return handlePromise(CategoryService.graphql('create', formData));
};

export const updateCategory = (formData: FormData): Promise<AxiosResponse> => {
  formData.append(
    'query',
    'mutation UpdateCategory($category: CategoryInput) { category { update (category:$category) { message } } }'
  );
  return handlePromise(CategoryService.graphql('update', formData));
};

export const deleteCategory = (categoryId: string): Promise<AxiosResponse> => {
  const body: RequestBody = {
    query:
      'query DeleteCategory($categoryId: ID) { category { delete (categoryId: $categoryId) { message } } }',
    categoryId
  };
  return handlePromise(CategoryService.graphql('delete', body));
};

export const loadInitCategory = ({ request }: LoaderFunctionArgs): Promise<AxiosResponse> => {
  const url: URL = new URL(request.url);
  const pageSize: number = parseInt(url.searchParams.get('pageSize') || '10');
  const pageNumber: number = parseInt(url.searchParams.get('pageNumber') || '1');
  const body: RequestBody = {
    query: `query CategoryPagination($pageSize: Int, $pageNumber: Int) {
      category {
        pagination (pageSize: $pageSize, pageNumber: $pageNumber) {
          list {
            name,
            avatar,
            category_id,
            disabled
          },
          total
        }
      }
    }`,
    pageSize,
    pageNumber
  };
  return handleNotfoundApiError(CategoryService.graphql('pagination', body));
};
