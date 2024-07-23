import axios, { AxiosResponse } from 'axios';
import { showLoading, hideLoading } from 'utils';

const Api = axios.create({
  baseURL: process.env.BASE_URL,
  timeout: 3000,
});

Api.interceptors.request.use((config) => {
  showLoading();
  return config;
}, (error) => Promise.reject(error));

Api.interceptors.response.use((config) => {
  hideLoading();
  return config;
}, (error) => Promise.reject(error));

export type {
  AxiosResponse
};

export default Api;
