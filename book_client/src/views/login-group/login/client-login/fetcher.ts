import { AxiosResponse } from 'axios';
import { ClientService, RequestBody } from 'services';

export const login = (email: string, password: string): Promise<AxiosResponse> => {
  const body: RequestBody = {
    email,
    password,
    query: {
      clientId: true,
      firstName: true,
      lastName: true,
      avatar: true,
      email: true,
      resetPasswordToken: true,
      passwordMustChange: true,
      apiKey: true,
    },
  };
  return ClientService.post('login', body);
};

export const logout = (): Promise<AxiosResponse> => {
  return ClientService.get('logout');
};
