import Api from '../axios';
import type { AxiosResponse } from '../axios';

export type RequestBody = {
  query?: string;
  [key: string]: any;
} | FormData;

class Service {
  private readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  graphql(subUrl: string, requestBody: RequestBody): Promise<AxiosResponse> {
    return Api.post(`${this.url}/${subUrl}`, requestBody);
  }
}

export const CategoryService = new Service('/category');
export const BookService = new Service('/book');
export const UserService = new Service('/user');
