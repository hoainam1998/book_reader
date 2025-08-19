import { AxiosResponse } from 'axios';
import { RequestBody, UserService } from 'services';

export const signUp = (body: RequestBody): Promise<AxiosResponse> => {
  return UserService.post('signup', body);
};
