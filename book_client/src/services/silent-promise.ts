import { AxiosError, AxiosResponse } from 'axios';

type PromiseOperationCallbackType = (
  resolve: (data: any) => void,
  reject: (error: any) => void,
  final: () => void)
=> void;

/**
 * A class simulate promise, but it will not throw error when promise rejected.
 *
 * @class
 */
export default class SilentPromise {
  /**
  * Simulate then callback.
  * Note: I will re-update this function if it out of date.
  *
  * @private
  * @param {AxiosResponse} data - The promise resolved data.
  */
  private _thenCallback?: (data: AxiosResponse) => void;

  /**
  * Simulate catch callback.
  * Note: I will re-update this function if it out of date.
  *
  * @private
  * @param {AxiosResponse} error - The promise rejected error.
  */
  private _catchCallback?: (error?: AxiosError | null) => void;

  /**
  * Simulate finally callback.
  *
  * @private
  */
  private _finallyCallback: () => void = () => {};

  /**
  * Default silent promise instance.
  *
  * @public
  * @static
  */
  static default: SilentPromise;

  /**
  * Default silent promise instance.
  *
  * @public
  * @constructor
  * @param {PromiseOperationCallbackType} cb - The simulate promise callback passed on promise constructor.
  */
  constructor(cb: PromiseOperationCallbackType) {
    SilentPromise.default = this;
    cb(this.resolve, this.reject, this.final);
  }

  /**
  * Run then callback, if it was provided.
  *
  * @public
  * @param {AxiosResponse} data - The promise resolve data.
  */
  resolve(data: AxiosResponse): void {
    if (SilentPromise.default._thenCallback) {
      SilentPromise.default._thenCallback(data);
    }
  }

  /**
  * Run catch callback, if it was provided.
  *
  * @public
  * @param {AxiosError} error- The promise rejected error.
  */
  reject(error: AxiosError): void {
    if (SilentPromise.default._catchCallback) {
      SilentPromise.default._catchCallback(error);
    }
  }

  /**
  * Run finally callback, if it was provided.
  *
  * @public
  */
  final(): void {
    if (SilentPromise.default._finallyCallback) {
      SilentPromise.default._finallyCallback();
    }
  }

  /**
  * Simulate then method.
  * Note: I will re-update this function if it out of date.
  *
  * @public
  * @param {(data: AxiosResponse) => Promise<AxiosResponse>} callback - The then callback.
  * @returns {SilentPromise} - The this object.
  */
  then(callback: (data: AxiosResponse) => Promise<AxiosResponse>): SilentPromise {
    this._thenCallback = callback;
    return this;
  }

  /**
  * Simulate catch method.
  * Note: I will re-update this function if it out of date.
  *
  * @public
  * @param {(error?: AxiosError | null) => Promise<AxiosError>} callback - The catch callback.
  * @returns {SilentPromise} - The this object.
  */
  catch(callback?: (error?: AxiosError | null) => Promise<AxiosError>): SilentPromise {
    this._catchCallback = callback;
    return this;
  }

  /**
  * Simulate finally method.
  * Note: I will re-update this function if it out of date.
  *
  * @public
  */
  finally(callback: () => void): void {
    this._finallyCallback = callback;
  }
}
