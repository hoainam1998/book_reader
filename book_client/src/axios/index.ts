import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig, AxiosError, HttpStatusCode } from 'axios';
import { redirect } from 'react-router-dom';
import paths from 'router/paths';
import { UNAUTHORIZED_ERROR_CODE } from 'enums';
import { showLoading, hideLoading, showToast } from 'utils';
import auth from 'store/auth';

const Api: AxiosInstance = axios.create({
  baseURL: process.env.BASE_URL,
  timeout: 5000,
  withCredentials: true,
});

/**
 * Handle axios request errors.
 *
 * @param {AxiosError} error - The axios error.
 */
const handleRequestError = (error: AxiosError<any, any>): void => {
  switch (error.code) {
    case AxiosError.ERR_BAD_REQUEST:
      switch (error.request.status) {
        case HttpStatusCode.Unauthorized: {
          const code = (error.response as AxiosResponse).data.errorCode || undefined;
          if (Object.values(UNAUTHORIZED_ERROR_CODE).includes(code)) {
            auth.logout();
            redirect(paths.LOGIN);
          }
        };
        break;
        default: break;
      }
      break;
    default: {
      showToast(error.code || '', error.message);
      break;
    };
  }
};

Api.interceptors.request.use((config) => {
  config.headers['Authorization'] = auth.ApiKey;
  showLoading();
  return config;
}, (error) => {
  hideLoading();
  return Promise.reject(error);
});

Api.interceptors.response.use((config) => {
  hideLoading();
  return config;
}, (error) => {
  handleRequestError(error);
  hideLoading();
  return Promise.reject(error);
});

export type {
  AxiosResponse,
  AxiosRequestConfig,
};

export default Api;
