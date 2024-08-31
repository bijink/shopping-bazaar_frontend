import axios from 'axios';
import Cookies from 'js-cookie';

if (!import.meta.env.VITE_DOMAIN_NAME || !import.meta.env.VITE_API_VERSION)
  throw new Error('DOMAIN_NAME or API_VERSION env is missing');

const baseURL = import.meta.env.VITE_DOMAIN_NAME + import.meta.env.VITE_API_VERSION;

export const axiosInstance = axios.create({
  baseURL,
  timeout: 3000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  function (config) {
    const token = Cookies.get('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);
