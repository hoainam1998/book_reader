import { AxiosResponse } from 'axios';
import { LoaderFunctionArgs } from 'react-router-dom';
import { CategoryService } from 'services';
import { showToast } from 'utils';

const handlePromise = (promise: Promise<AxiosResponse>): Promise<AxiosResponse> => {
  return new Promise((resolve, reject) => {
    promise
      .then((res) => {
        res.data?.category?.create?.message &&
          showToast('Category', res.data.category.create.message);
        res.data?.category.delete?.message &&
          showToast('Category', res.data?.category.delete?.message);
        res.data?.category.update?.message &&
          showToast('Category', res.data?.category.update?.message);
        resolve(res);
      })
      .catch((err) => reject(err));
  });
};

export const getCategoryDetail = (categoryId: string): Promise<AxiosResponse> => {
  const body = {
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
  const body = {
    query:
      'query DeleteCategory($categoryId: ID) { category { delete (categoryId: $categoryId) { message } } }',
    categoryId
  };
  return handlePromise(CategoryService.graphql('delete', body));
};

export const loadInitCategory = ({ request}: LoaderFunctionArgs<any>) => {
  const url = new URL(request.url);

  const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
  const pageNumber = parseInt(url.searchParams.get('pageNumber') || '1');
  const body = {
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
  return CategoryService.graphql('pagination', body);
};
