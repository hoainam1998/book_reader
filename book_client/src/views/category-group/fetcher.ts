import { AxiosResponse } from 'axios';
import { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router-dom';
import { CategoryService } from 'services';
import { showToast } from 'utils';

const handlePromise = (promise: Promise<AxiosResponse>) => {
  return new Promise((resolve, reject) => {
    promise
      .then((res) => {
        res.data?.category?.create?.message &&
          showToast('Category', res.data.category.create.message);
        res.data?.category.delete?.message &&
          showToast('Category', res.data?.category.delete?.message);
        resolve(res);
      })
      .catch((err) => reject(err));
  });
};

export const shouldRevalidate = (args: any) => {
  return true;
};

export const action = async (args: ActionFunctionArgs) => {
  const { request } = args;

  switch (request.method) {
    case 'POST': {
      const formData = await request.formData();
      const action = formData.get('action');
      if (action === 'add') {
        formData.append(
          'query',
          'mutation CreateCategory($category: CategoryInput) { category { create (category:$category) { message } } }'
        );
      } else {
        formData.append(
        'query',
        'mutation UpdateCategory($category: CategoryInput) { category { update (category:$category) { message } } }'
        );
      }
      formData.delete('action');
      return handlePromise(CategoryService.graphql('create', formData));
    }
    case 'PUT': {
      const formData = await request.formData();
      formData.append(
        'query',
        'mutation UpdateCategory($category: CategoryInput) { category { update (category:$category) { message } } }'
      );
      return handlePromise(CategoryService.graphql('update', formData));
    }
    case 'DELETE': {
      const formData = await request.formData();
      const categoryId = formData.get('categoryId');
      const body = {
        query:
          'query DeleteCategory($categoryId: ID) { category { delete (categoryId: $categoryId) { message } } }',
        categoryId
      };
      return handlePromise(CategoryService.graphql('delete', body));
    }
    default:
      return true;
  }
};

export const loader = (args: LoaderFunctionArgs<any>) => {
  const { request } = args;

  switch (request.method) {
    case 'POST':
      return true;
    case 'PUT':
      return true;
    case 'DELETE':
      return true;
    default: {
      const url = new URL(request.url);
      const action = url.searchParams.get('action');
      if (action === 'fetch-category' || !action) {
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
      } else {
        const categoryId = url.searchParams.get('categoryId');
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
      }
    }
  }
};
