import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { showLoading, hideLoading } from 'utils';
import auth from 'store/auth';

const Api: AxiosInstance = axios.create({
  baseURL: process.env.BASE_URL,
  timeout: 30000,
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
  AxiosResponse
};

export default Api;
