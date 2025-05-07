import { AxiosResponse, AxiosRequestConfig } from 'axios';
import Api from '../axios';
import { handleRequestResponse } from 'decorators';
import RequestBase, { RequestBody } from './request-base';

/**
 * A third party class, which config and call axios request.
 *
 * @class
 * @extends RequestBase
 */
export default class Request extends RequestBase {
  /**
  * Default request instance.
  *
  * @public
  * @static
  */
  static default: Request = new Request();

  /**
  * The root url.
  * @private
  */
  private _baseUrl: string;

  /**
  * Promise rejected will throw error, and breaking page.
  * When this flag turn on, error will not throw.
  * @private
  */
  private _keepAlive: boolean = false;

  /**
  * When turn on this flag, not found error will be resolve instead of reject like normal.
  * @private
  */
  private _notFoundAllowed: boolean = false;

  get KeepAlive() {
    return this._keepAlive;
  }

  get BaseUrl() {
    return this._baseUrl;
  }

  set NotFoundAllowed(value: boolean) {
    this._notFoundAllowed = value;
  }

  get NotFoundAllowed() {
    return this._notFoundAllowed;
  }

  /**
  * Initialized request instance.
  *
  * @constructor
  * @param {boolean} keepAlive - The keepAlive flag.
  * @param {string} [baseUrl] - The root url.
  */
  constructor(keepAlive: boolean = false, baseUrl?: string) {
    super();
    this._baseUrl = baseUrl || '';
    this._keepAlive = keepAlive;
  }

  /**
  * Post http method.
  *
  * @public
  * @param {string} url - The sub url.
  * @param {RequestBody} requestBody - The request body.
  */
  @handleRequestResponse
  post(url: string, requestBody: RequestBody): Promise<AxiosResponse> {
    return Api.post(url, requestBody);
  }

  /**
  * Put http method.
  *
  * @public
  * @param {string} url - The sub url.
  * @param {RequestBody} requestBody - The request body.
  */
  @handleRequestResponse
  put(url: string, requestBody: RequestBody): Promise<AxiosResponse> {
    return Api.put(url, requestBody);
  }

  /**
  * Get http method.
  *
  * @public
  * @param {string} url - The sub url.
  * @param {RequestBody} requestBody - The request body.
  */
  @handleRequestResponse
  get(url: string): Promise<AxiosResponse> {
    return Api.get(url);
  }

  /**
  * Delete http method.
  *
  * @public
  * @param {string} url - The sub url.
  * @param {RequestBody} requestBody - The request body.
  */
  @handleRequestResponse
  delete(url: string, options?: AxiosRequestConfig<any>): Promise<AxiosResponse> {
    return Api.delete(url, options);
  }
};
