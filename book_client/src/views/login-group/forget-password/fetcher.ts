import { AxiosResponse } from 'axios';
import { UserService, RequestBody } from 'services';

export const forgetPassword = (body: RequestBody): Promise<AxiosResponse> => {
  return UserService.post('forget-password', body);
};
