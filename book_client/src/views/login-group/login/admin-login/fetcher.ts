import { AxiosResponse } from 'axios';
import { UserService, RequestBody } from 'services';

export const login = (email: string, password: string): Promise<AxiosResponse> => {
  const body: RequestBody = {
    email,
    password,
    query: {
      userId: true,
      firstName: true,
      lastName: true,
      avatar: true,
      email: true,
      mfaEnable: true,
      passwordMustChange: true,
      resetPasswordToken: true,
      apiKey: true,
      role: true,
      phone: true,
      sex: true,
    },
  };
  return UserService.post('login', body);
};

export const logout = (): Promise<AxiosResponse> => {
  return UserService.get('logout');
};
