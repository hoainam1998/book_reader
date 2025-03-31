import { AxiosResponse } from 'axios';
import { LoaderFunctionArgs } from 'react-router-dom';
import { CategoryService, RequestBody } from 'services';
import { handleNotfoundApiError, showToast } from 'utils';

const showToastWithName = (message: string) => showToast('Category', message);

export const handlePromise = (promise: Promise<AxiosResponse>): Promise<AxiosResponse> => {
  return promise.then(res => {
    showToastWithName(res.data.message);
    return res;
  }).catch((error) => {
    showToastWithName(error.response.data.message);
    throw error;
  });
};

export const getCategoryDetail = (categoryId: string): Promise<AxiosResponse> => {
  const body: RequestBody = {
    categoryId,
    query: {
      name: true,
      avatar: true,
    }
  };
  return CategoryService.post('detail', body);
};

export const createCategory = (formData: FormData): Promise<AxiosResponse> => {
  return CategoryService.post('create', formData);
};

export const updateCategory = (formData: FormData): Promise<AxiosResponse> => {
  return handlePromise(CategoryService.put('update', formData));
};

export const deleteCategory = (categoryId: string): Promise<AxiosResponse> => {
  return handlePromise(CategoryService.delete(`delete/${categoryId}`));
};

export const loadInitCategory = ({ request }: LoaderFunctionArgs): Promise<AxiosResponse> => {
  const url: URL = new URL(request.url);
  const pageSize: number = parseInt(url.searchParams.get('pageSize') || '10');
  const pageNumber: number = parseInt(url.searchParams.get('pageNumber') || '1');
  const body: RequestBody = {
    pageSize,
    pageNumber,
    query: {
      name: true,
      avatar: true,
      categoryId: true,
      disabled: true,
    },
  };
  return handleNotfoundApiError(CategoryService.post('pagination', body));
};
