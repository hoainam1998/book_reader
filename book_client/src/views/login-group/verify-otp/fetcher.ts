import { AxiosResponse } from 'axios';
import { RequestBody, UserService } from 'services';

export const sendOtp = (email: string): Promise<AxiosResponse> => {
  return UserService.post('send-otp', {
    email,
    query: {
      message: true,
      otp: true
    }
  });
};

export const verifyOtp = (email: string, otp: string): Promise<AxiosResponse> => {
  const body: RequestBody = {
    email,
    otp,
    query: {
      verify: true,
      apiKey: true
    }
  };

  return UserService.post('verify-otp', body);
};
