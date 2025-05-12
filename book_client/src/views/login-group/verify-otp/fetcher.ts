import { AxiosResponse } from 'axios';
import { RequestBody, UserService } from 'services';

export const sendOtp = (): Promise<AxiosResponse> => {
  return UserService.post('send-otp', {
    query: {
      message: true,
      otp: true
    }
  });
};

export const verifyOtp = (otp: string): Promise<AxiosResponse> => {
  const body: RequestBody = {
    otp,
    query: {
      apiKey: true
    }
  };

  return UserService.post('verify-otp', body);
};
