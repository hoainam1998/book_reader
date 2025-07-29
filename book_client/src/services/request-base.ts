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
  private _alwayRunCatchCallback: boolean = false;
  abstract post(subUrl: string, requestBody: RequestBody): Promise<AxiosResponse>;
  abstract put(subUrl: string, requestBody: RequestBody): Promise<AxiosResponse>;
  abstract get(subUrl: string): Promise<AxiosResponse>;
  abstract delete(subUrl: string, options?: AxiosRequestConfig<any>): Promise<AxiosResponse>;

  /**
  * Turn on _notFoundAllowed flag, which determinate not found error should be resolve or not.
  *
  * @return {Request} - The request object.
  */
  get NotFoundAccepted(): Request {
    const that = this instanceof Request ? this : new Request(false, (this as unknown as Service).Url);
    that.NotFoundAllowed = true;
    return that;
  }

  /**
  * Turn on _alwayRunCatchCallback flag, which determinate catch call back should run in all cases or not.
  *
  * @return {RequestBase} - The request object.
  */
  get AlwayRunCatchCallback(): RequestBase {
    const that = this instanceof Request ? this : new Request(false, (this as unknown as Service).Url);
    that._alwayRunCatchCallback = true;
    return that;
  }

  /**
  * Access _alwayRunCatchCallback flag.
  *
  * @return {RequestBase} - The request object.
  */
  get AlwayRunCatch(): boolean {
    return this._alwayRunCatchCallback;
  }
};
