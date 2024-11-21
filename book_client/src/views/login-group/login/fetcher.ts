import { AxiosResponse } from 'axios';
import { UserService, RequestBody } from 'services';

export const login = (email: string, password: string): Promise<AxiosResponse> => {
  const body: RequestBody = {
    query: `
      query Login($email: String, $password: String) {
        user {
          login(email: $email, password: $password) {
            name,
            avatar,
            email,
            mfaEnable,
            password,
            apiKey
          }
        }
      }
    `,
    email,
    password
  };
  return UserService.graphql('login', body);
};
