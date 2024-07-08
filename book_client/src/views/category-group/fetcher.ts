import { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router-dom';
import { CategoryService } from 'services';
import { showToast } from 'utils';

export const action = async(args: ActionFunctionArgs) =>  {
  const { request } = args;

  switch (request.method) {
    case 'POST': {
      const formData = await request.formData();
      formData.append('query',
        'mutation CreateCategory($category: CategoryInput) { category { create (category:$category) { message } } }');
      return new Promise((resolve, reject) => {
        CategoryService.graphql('create', formData)
        .then(res => {
          showToast('Category', res.data.category.create.message);
          resolve(res);
        })
        .catch(err => {
          console.log(err);
          reject(err);
        });
      });
    };
    case 'PUT': return true;
    case 'DELETE': return true;
    default: return true;
  }
};

export const loader = async(args: LoaderFunctionArgs<any>) => {
  console.log(args);
  return true;
};