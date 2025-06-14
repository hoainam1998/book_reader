import { AxiosResponse } from 'axios';
import { UserService, ClientService, RequestBody } from 'services';

export const forgetPassword = (body: RequestBody): Promise<AxiosResponse> => {
  if (globalThis.isClient) {
    return ClientService.post('forget-password', body);
  }
  return UserService.post('forget-password', body);
};
