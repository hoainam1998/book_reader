import { AxiosResponse } from 'axios';
import { LoaderFunctionArgs } from 'react-router-dom';
import { UserService, RequestBody } from 'services';
import { UserType } from 'interfaces';

export const addUser = (user: UserType): Promise<AxiosResponse> => {
  return UserService.post('create-user', user);
};

export const updateMfaState = (userId: string, mfaEnable: boolean): Promise<AxiosResponse> => {
  const body: RequestBody = {
    userId,
    mfaEnable
  };
  return UserService.post('update-mfa', body);
};

export const updatePower = (userId: string, power: boolean): Promise<AxiosResponse> => {
  const body: RequestBody = {
    userId,
    power
  };
  return UserService.post('update-power', body);
};

export const deleteUser = (userId: string): Promise<AxiosResponse> => {
  return UserService.delete(`delete/${userId}`);
};

export const updateUser = (user: UserType): Promise<AxiosResponse> => {
  return UserService.put('update-user', user);
};

export const getAllUsers = (userId?: string): Promise<AxiosResponse> => {
  return UserService.post('all', {
    exclude: userId,
    query: {
      email: true,
      phone: true,
    },
  });
};

export const getUserDetail = (userId: string): Promise<AxiosResponse> => {
  const body: RequestBody = {
    userId,
    query: {
      firstName: true,
      lastName: true,
      email: true,
      avatar: true,
      mfaEnable: true,
      phone: true,
      power: true,
      sex: true,
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
      phone: true,
      sex: true,
      role: true,
      isAdmin: true,
      mfaEnable: true
    }
  };
  return await UserService.KeepAlive.post('pagination', body);
};
