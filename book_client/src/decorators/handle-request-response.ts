import { AxiosError, AxiosResponse, HttpStatusCode } from 'axios';
import { SilentPromise } from 'services';
import { NOT_FOUND_ERROR_CODE } from 'enums';
import { Request } from 'services';

/**
 * Return boolean determinate not found error should be resolve or reject.
 *
 * @param {AxiosError} error - The axios error.
 * @returns {boolean} - The checking result.
 */
const shouldResolveError = (error: AxiosError): boolean => {
  return error.request.status === HttpStatusCode.NotFound
    && (error.response as AxiosResponse).data.errorCode !== NOT_FOUND_ERROR_CODE.URL_NOT_FOUND;
};

/**
 * Handle request response.
 *
 * @param {Object} target - The decorator binding object.
 * @param {string} propertyKey - The property name.
 * @param {TypedPropertyDescriptor<any>} descriptor - The descriptor value.
 * @returns {TypedPropertyDescriptor<any>} - The descriptor.
 */
export default function (
  target: Object,
  propertyKey: string,
  descriptor: TypedPropertyDescriptor<any>): TypedPropertyDescriptor<any> {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const request = (this as unknown as Request);
      const notFoundAllowed = request.NotFoundAllowed;
      const keepAlive = request.KeepAlive;
      const subUrl = args[0];
      args[0] = request.BaseUrl ? `${request.BaseUrl}/${subUrl}` : subUrl;
      if (keepAlive) {
        return originalMethod.apply(this, args).catch((error: AxiosError) => {
          if (shouldResolveError(error) && notFoundAllowed) {
            return error.response;
          } else {
            throw error;
          }
        });
      }
      return new SilentPromise((resolve, reject, final) => {
        originalMethod.apply(this, args)
          .then((res: AxiosResponse) => resolve(res))
          .catch((error: AxiosError) => {
            if (shouldResolveError(error) && notFoundAllowed) {
              resolve(error.response);
            } else {
              reject(error);
            }
          })
          .finally(final);
      });
    };
  return descriptor;
};
