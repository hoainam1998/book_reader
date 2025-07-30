import type { AxiosResponse, AxiosRequestConfig } from '../axios';
import { formatSubUrl } from 'decorators';
import RequestBase from './request-base';
import type { RequestBody, IQueryType } from './request-base';
import Request from './request';
import SilentPromise from './silent-promise';

/**
 * Organizing http method.
 *
 * @class
 * @extends RequestBase
 */
class Service extends RequestBase {
  private readonly _url: string;

/**
 * Create service instance.
 *
 * @constructor
 * @param {string} url - The base url.
 */
  constructor(url: string) {
    super();
    this._url = url;
  }

  get KeepAlive() {
    return new Request(true, this._url);
  }

  get Url() {
    return this._url;
  }

  /**
  * Post http method.
  *
  * @public
  * @param {string} subUrl - The sub url.
  * @param {RequestBody} requestBody - The request body.
  */
  @formatSubUrl
  post(subUrl: string, requestBody: RequestBody): Promise<AxiosResponse> {
    return Request.default.post(`${this._url}/${subUrl}`, requestBody);
  }

  /**
  * Put http method.
  *
  * @public
  * @param {string} subUrl - The sub url.
  * @param {RequestBody} requestBody - The request body.
  */
  @formatSubUrl
  put(subUrl: string, requestBody?: RequestBody): Promise<AxiosResponse> {
    return Request.default.put(`${this._url}/${subUrl}`, requestBody || {});
  }

  /**
  * Get http method.
  *
  * @public
  * @param {string} subUrl - The sub url.
  * @param {RequestBody} requestBody - The request body.
  */
  @formatSubUrl
  get(subUrl: string): Promise<AxiosResponse> {
    return Request.default.get(`${this._url}/${subUrl}`);
  }

  /**
  * Delete http method.
  *
  * @public
  * @param {string} subUrl - The sub url.
  * @param {RequestBody} requestBody - The request body.
  */
  @formatSubUrl
  delete(subUrl: string, options?: AxiosRequestConfig<any>): Promise<AxiosResponse> {
    return Request.default.delete(`${this._url}/${subUrl}`, options);
  }
}

export const CategoryService = new Service('/category');
export const BookService = new Service('/book');
export const UserService = new Service('/user');
export const AuthorService = new Service('/author');
export const ClientService = new Service('/client');
export { SilentPromise, Request, Service, RequestBody, IQueryType };
