import { AxiosResponse } from 'axios';
import { LoaderFunctionArgs } from 'react-router-dom';
import { CategoryService, RequestBody } from 'services';

export const getCategoryDetail = (categoryId: string): Promise<AxiosResponse> => {
  const body: RequestBody = {
    categoryId,
    query: {
      name: true,
      avatar: true,
    }
  };
  return CategoryService.NotFoundAccepted.post('detail', body);
};

export const createCategory = (formData: FormData): Promise<AxiosResponse> => {
  return CategoryService.post('create', formData);
};

export const updateCategory = (formData: FormData): Promise<AxiosResponse> => {
  return CategoryService.NotFoundAccepted.put('update', formData);
};

export const deleteCategory = (categoryId: string): Promise<AxiosResponse> => {
  return CategoryService.NotFoundAccepted.delete(`delete/${categoryId}`);
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
  return CategoryService.KeepAlive.NotFoundAccepted.post('pagination', body);
};
