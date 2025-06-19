import { AxiosResponse } from 'axios';
import { ClientService } from 'services';

export const getAllReaders = (userId?: string): Promise<AxiosResponse> => {
  return ClientService.post('all', {
    exceptedUserId: userId,
    query: {
      email: true,
      phone: true,
    },
  });
};
