import Api from '../axios';
import type { AxiosResponse, AxiosRequestConfig } from '../axios';
import { formatSubUrl } from 'decorators';

interface IQueryType {
  [key: string]: boolean | IQueryType;
}

export type RequestBody = {
  query?: IQueryType ;
  [key: string]: any;
} | FormData;

class Service {
  private readonly _url: string;

  constructor(url: string) {
    this._url = url;
  }

  @formatSubUrl
  post(subUrl: string, requestBody: RequestBody): Promise<AxiosResponse> {
    return Api.post(`${this._url}/${subUrl}`, requestBody);
  }

  @formatSubUrl
  put(subUrl: string, requestBody: RequestBody): Promise<AxiosResponse> {
    return Api.put(`${this._url}/${subUrl}`, requestBody);
  }

  @formatSubUrl
  get(subUrl: string) {
    return Api.get(`${this._url}/${subUrl}`);
  }

  @formatSubUrl
  delete(subUrl: string, options?: AxiosRequestConfig<any>): Promise<AxiosResponse> {
    return Api.delete(`${this._url}/${subUrl}`, options);
  }
}

export const CategoryService = new Service('/category');
export const BookService = new Service('/book');
export const UserService = new Service('/user');
export const AuthorService = new Service('/author');
