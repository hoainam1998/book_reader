import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';
import { showLoading, hideLoading } from 'utils';
import auth from 'store/auth';

const Api: AxiosInstance = axios.create({
  baseURL: process.env.BASE_URL,
  timeout: 5000,
});

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
  hideLoading();
  return Promise.reject(error);
});

export type {
  AxiosResponse,
  AxiosRequestConfig,
};

export default Api;
