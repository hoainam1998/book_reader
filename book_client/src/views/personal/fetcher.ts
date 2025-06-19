import { AxiosResponse } from 'axios';
import { UserService, ClientService } from 'services';

export const updatePerson = (formData: FormData): Promise<AxiosResponse> => {
  if (globalThis.isClient) {
    return ClientService.put('update-person', formData);
  }
  return UserService.put('update-person', formData);
};
