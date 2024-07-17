import { AxiosResponse } from 'axios';
import { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router-dom';
import { CategoryService } from 'services';
import { showToast } from 'utils';

const handlePromise = (promise: Promise<AxiosResponse>) => {
  return new Promise((resolve, reject) => {
    promise.then((res) => {
        res.data?.category?.create?.message && showToast('Category', res.data.category.create.message);
        resolve(res);
      })
      .catch((err) => reject(err));
  });
};

export const action = async (args: ActionFunctionArgs) => {
  const { request } = args;

  switch (request.method) {
    case 'POST': {
      const formData = await request.formData();
      formData.append(
        'query',
        'mutation CreateCategory($category: CategoryInput) { category { create (category:$category) { message } } }'
      );
      return handlePromise(CategoryService.graphql('create', formData));
    }
    case 'PUT':
      return true;
    case 'DELETE':
      return true;
    default:
      return true;
  }
}

export const loader = async (args: LoaderFunctionArgs<any>) => {
  const { request } = args;

  switch (request.method) {
    case 'POST': return true;
    case 'PUT':
      return true;
    case 'DELETE':
      return true;
    default:
      const url = new URL(request.url);
      const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
      const pageNumber = parseInt(url.searchParams.get('pageNumber') || '1');
      const body = {
        query: `query CategoryPagination($pageSize: Int, $pageNumber: Int) {
          category {
            pagination (pageSize: $pageSize, pageNumber: $pageNumber) {
              list {
                name,
                avatar
              },
              total
            }
          }
        }`,
        pageSize,
        pageNumber
      };
      return handlePromise(CategoryService.graphql('pagination', body));
  }
};
