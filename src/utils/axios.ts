import axios from 'axios';
import Cookies from 'js-cookie';

if (!import.meta.env.VITE_DOMAIN_NAME || !import.meta.env.VITE_API_VERSION)
  throw new Error('DOMAIN_NAME or API_VERSION env is missing');

const baseURL = import.meta.env.VITE_DOMAIN_NAME + import.meta.env.VITE_API_VERSION;
const token = Cookies.get('token');

export const axiosInstance = axios.create({
  baseURL,
  timeout: 2000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
});
