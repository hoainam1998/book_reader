import { AxiosResponse } from 'axios';
import { LoaderFunctionArgs } from 'react-router-dom';
import { UserService, RequestBody } from 'services';
import { showToast } from 'utils';

export const handlePromise = (promise: Promise<AxiosResponse>): Promise<AxiosResponse> => {
  return promise.then((res) => {
    showToast('User', res.data?.message);
    return res;
  });
};

export const addUser = (formData: FormData): Promise<AxiosResponse> => {
  return handlePromise(UserService.post('add', formData));
};

export const updateMfaState = (userId: string, mfaEnable: boolean): Promise<AxiosResponse> => {
  const body: RequestBody = {
    userId,
    mfaEnable
  };
  return handlePromise(UserService.post('update-mfa', body));
};

export const deleteUser = (userId: string): Promise<AxiosResponse> => {
  return handlePromise(UserService.delete(`delete-user/${userId}`));
};

export const updateUser = (formData: FormData): Promise<AxiosResponse> => {
  return handlePromise(UserService.put('update-user', formData));
};

export const getAllEmail = (): Promise<AxiosResponse> => {
  return UserService.get('emails');
};

export const loadUserDetail = ({ params }: LoaderFunctionArgs): Promise<AxiosResponse> | null => {
  const userId: string | undefined = params.id;
  const body: RequestBody = {
    userId,
    query: {
      firstName: true,
      lastName: true,
      email: true,
      avatar: true,
      mfaEnable: true,
    }
  };
  return UserService.post('user-detail', body);
};

export const loadInitUser = async ({
  request
}: LoaderFunctionArgs): Promise<AxiosResponse | Response> => {
  const url: URL = new URL(request.url);
  const pageSize: number = parseInt(url.searchParams.get('pageSize') || '10');
  const pageNumber: number = parseInt(url.searchParams.get('pageNumber') || '1');
  const keyword: string = url.searchParams.get('keyword') || '';
  const body: RequestBody = {
    keyword,
    pageSize,
    pageNumber,
    query: {
      userId: true,
      name: true,
      avatar: true,
      email: true,
      mfaEnable: true
    }
  };
  return await UserService.post('pagination', body);
};
