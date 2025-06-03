import { AxiosResponse } from 'axios';
import { LoaderFunctionArgs, redirect } from 'react-router-dom';
import paths from 'router/paths';
import { ClientService, RequestBody } from 'services';

export const resetPassword = (body: RequestBody): Promise<AxiosResponse> => {
  return ClientService.post('reset-password', body);
};

export const getResetPasswordToken = ({ request }: LoaderFunctionArgs): string | Response => {
  const url: URL = new URL(request.url);
  const token: string | null = url.searchParams.get('token');
  return token || redirect(paths.LOGIN);
};
