import { AxiosError, AxiosResponse } from 'axios';
import { HTTP_CODE } from 'enums';

type DataNotFoundType = {
  list: any[];
  total: number;
};

export class DataNotFound {
  private data: DataNotFoundType;
  constructor(data: DataNotFoundType) {
    this.data = data;
  }

  static compare(value: any): boolean {
    return value instanceof DataNotFound;
  }

  get Data() {
    return this.data;
  }
}

/**
 * Handle response when api called with status 404
 *
 * @param {Promise} promiseApiCalled - promise return from api call.
 * @returns {Promise<any>} - new promise.
 */
const handleNotfoundApiError = (promiseApiCalled: Promise<AxiosResponse>): Promise<any> => {
  return promiseApiCalled.catch((error: AxiosError<any, any>) => {
    if ((error.response as any).status === HTTP_CODE.NOT_FOUND) {
      return Promise.resolve(new DataNotFound((error.response as any).data));
    }
    throw error;
  });
};

export default handleNotfoundApiError;
