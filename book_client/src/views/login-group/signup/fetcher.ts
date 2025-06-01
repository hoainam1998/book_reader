import { AxiosResponse } from 'axios';
import { RequestBody, ClientService } from 'services';

export const signUp = (body: RequestBody): Promise<AxiosResponse> => {
  return ClientService.post('sign-up', body);
};
