import axios, { AxiosResponse } from 'axios';

const Api = axios.create({
  baseURL: process.env.BASE_URL,
  timeout: 3000,
});

export type {
  AxiosResponse
};

export default Api;
