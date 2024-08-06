import axios from 'axios';

if (!import.meta.env.VITE_DOMAIN_NAME || !import.meta.env.VITE_API_VERSION)
  throw new Error('DOMAIN_NAME or API_VERSION env is missing');

const baseURL = import.meta.env.VITE_DOMAIN_NAME + import.meta.env.VITE_API_VERSION;

export const axiosInstance = axios.create({
  baseURL,
  timeout: 2000,
});
