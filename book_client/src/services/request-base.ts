/* eslint-disable no-unused-vars */
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Request, Service } from 'services';

export interface IQueryType {
  [key: string]: boolean | IQueryType;
};

export type RequestBody = {
  query?: IQueryType ;
  [key: string]: any;
} | FormData;

/**
 * Declare all http method needed.
 *
 * @class
 * @abstract
 */
export default abstract class RequestBase {
  abstract post(subUrl: string, requestBody: RequestBody): Promise<AxiosResponse>;
  abstract put(subUrl: string, requestBody: RequestBody): Promise<AxiosResponse>;
  abstract get(subUrl: string): Promise<AxiosResponse>;
  abstract delete(subUrl: string, options?: AxiosRequestConfig<any>): Promise<AxiosResponse>;

  /**
  * Turn on _notFoundAllowed flag, which determinate not found error should be resolve or not.
  * @return {RequestBase} - The request object.
  */
  get NotFoundAccepted(): RequestBase {
    const that = this instanceof Request ? this : new Request(false, (this as unknown as Service).Url);
    that.NotFoundAllowed = true;
    return that;
  }
};
