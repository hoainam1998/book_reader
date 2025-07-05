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

export const getReaderDetail = (): Promise<AxiosResponse> => {
  return ClientService.post('detail', {
    query: {
      clientId: true,
      firstName: true,
      lastName: true,
      avatar: true,
      email: true,
      sex: true,
      favoriteBooks: {
        name: true
      },
      readLate: {
        name: true
      },
      usedRead: {
        name: true
      }
    }
  });
};
