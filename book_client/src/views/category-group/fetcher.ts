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
      .catch((err) => {
        console.log(err);
        reject(err);
      });
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
      const body = {
        query: `query CategoryPagination($pageSize: Int, $pageNumber: Int) { 
          category { 
            pagination (pageSize: $pageSize, pageNumber: $pageNumber) { 
              name, avatar 
            } 
          } 
        }`,
        pageSize: 10,
        pageNumber: 1
      };
      return handlePromise(CategoryService.graphql('pagination', body));
  }
};
