import { AxiosError, AxiosResponse } from 'axios';
import { stringRandom as id } from 'utils';

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
  * Request stored with key.
  *
  * @private
  * @static
  */
  private static request = new Map<string, SilentPromise>();

  /**
  * Create silent promise instance.
  *
  * @public
  * @constructor
  * @param {PromiseOperationCallbackType} cb - The simulate promise callback passed on promise constructor.
  */
  constructor(cb: PromiseOperationCallbackType) {
    const requestId = id();
    SilentPromise.addRequest(requestId, this);
    cb(
      (data: AxiosResponse) => this.resolve(requestId, data),
      (error: AxiosError) => this.reject(requestId, error),
      () => this.final(requestId)
    );
  }

  /**
  * Add request to request memory.
  *
  * @private
  * @static
  * @param {string} requestId - The request id.
  * @param {SilentPromise} request - The request.
  */
  private static addRequest(requestId: string, request: SilentPromise): void {
    SilentPromise.request.set(requestId, request);
  }

  /**
  * Get request by id.
  *
  * @private
  * @static
  * @param {string} requestId - The request id.
  * @return {SilentPromise} - The request.
  */
  private static getCurrentRequest(requestId: string): SilentPromise | undefined {
    return SilentPromise.request.get(requestId);
  }

  /**
  * Delete request out of memory.
  *
  * @private
  * @static
  * @param {string} requestId - The request id.
  */
  private static freeingRequest(requestId: string): void {
    SilentPromise.request.delete(requestId);
  }

  /**
  * Clear request memory.
  *
  * @public
  * @static
  */
  public static clearRequestMemory(): void {
    SilentPromise.request.clear();
  }

  /**
  * Run then callback, if it was provided.
  *
  * @public
  * @param {AxiosResponse} data - The promise resolve data.
  */
  resolve(requestId: string, data: AxiosResponse): void {
    const context = SilentPromise.getCurrentRequest(requestId);
    if (context && context._thenCallback) {
      context._thenCallback(data);
      if (!context._finallyCallback) {
        SilentPromise.freeingRequest(requestId);
      }
    }
  }

  /**
  * Run catch callback, if it was provided.
  *
  * @public
  * @param {AxiosError} error- The promise rejected error.
  */
  reject(requestId: string, error: AxiosError): void {
    const context = SilentPromise.getCurrentRequest(requestId);
    if (context && context._catchCallback) {
      context._catchCallback(error);
      if (!context._finallyCallback) {
        SilentPromise.freeingRequest(requestId);
      }
    }
  }

  /**
  * Run finally callback, if it was provided.
  *
  * @public
  */
  final(requestId: string): void {
    const context = SilentPromise.getCurrentRequest(requestId);
    if (context && context._finallyCallback) {
      context._finallyCallback();
      SilentPromise.freeingRequest(requestId);
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
