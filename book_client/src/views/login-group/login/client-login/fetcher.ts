import { AxiosResponse } from 'axios';
import { UserService, RequestBody } from 'services';

export const login = (email: string, password: string): Promise<AxiosResponse> => {
  const body: RequestBody = {
    email,
    password,
    query: {
      name: true,
      avatar: true,
      email: true,
      mfaEnable: true,
      password: true,
      apiKey: true,
    },
  };
  return UserService.post('login', body);
};
