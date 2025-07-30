import { AxiosResponse } from 'axios';
import { LoaderFunctionArgs } from 'react-router-dom';
import { ClientService } from 'services';

export const clientPagination = ({ request }: LoaderFunctionArgs): Promise<AxiosResponse> => {
  const url: URL = new URL(request.url);
  const pageSize: number = parseInt(url.searchParams.get('pageSize') || '10');
  const pageNumber: number = parseInt(url.searchParams.get('pageNumber') || '1');
  const keyword: string | null = url.searchParams.get('keyword');

  return ClientService.KeepAlive.NotFoundAccepted.post('pagination', {
    query: {
      clientId: true,
      name: true,
      sex: true,
      email: true,
      avatar: true,
      phone: true,
      blocked: true,
    },
    pageSize,
    pageNumber,
    keyword,
  });
};

export const blockClient = (clientId: string): Promise<AxiosResponse> => {
  return ClientService.put(`block/${clientId}`);
};

export const unblockClient = (clientId: string): Promise<AxiosResponse> => {
  return ClientService.put(`unblock/${clientId}`);
};
