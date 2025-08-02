import axios, { InternalAxiosRequestConfig, AxiosRequestHeaders } from 'axios';

export const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080/api',
});

axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`,
            } as AxiosRequestHeaders;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);