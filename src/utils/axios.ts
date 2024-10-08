import axios from 'axios';
import Cookies from 'js-cookie';

if (!import.meta.env.VITE_BACKEND_API_DOMAIN_NAME || !import.meta.env.VITE_BACKEND_API_VERSION)
  throw new Error('BACKEND_API_DOMAIN_NAME or BACKEND_API_VERSION env is missing');

const baseURL =
  import.meta.env.VITE_BACKEND_API_DOMAIN_NAME + import.meta.env.VITE_BACKEND_API_VERSION;

export const axiosInstance = axios.create({
  baseURL,
  timeout: 5000,
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
