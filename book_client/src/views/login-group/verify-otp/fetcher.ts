import { AxiosResponse } from 'axios';
import { RequestBody, UserService } from 'services';

export const sendOtp = (email: string): Promise<AxiosResponse> => {
  return UserService.graphql('/send-otp', { email });
};

export const verifyOtp = (email: string, otp: string): Promise<AxiosResponse> => {
  const body: RequestBody = {
    query:
    `query VerifyOTP($email: String, $otp: String) {
      user {
        verifyOtp(email: $email, otp: $otp) {
          verify,
          apiKey
        }
      }
    }
    `,
    email,
    otp
  };

  return UserService.graphql('/verify-otp', body);
};
