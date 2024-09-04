import axios, {
  AxiosInstance,
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';
import { toast } from '@instasync/ui/ui/sonner';

// Create an Axios instance

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

const onRequestFulfilled = (config: InternalAxiosRequestConfig<any>) => {
  // const userState = userStore.getState();
  // if (userState.computed.isAuthenticated) {
  //     config.headers.Authorization = userState.computed.bearerToken;
  // }
  // appStore.state.isLoading = true;
  return config;
};

const onRequestRejected = (error: AxiosError) => {
  // Handle errors before they are sent
  console.error('HTTP REQUEST ERROR:', error);
  return Promise.reject(error);
};

const onResponseFulfilled = (response: AxiosResponse) => {
  // Any status code that lie within the range of 2xx cause this function to trigger
  // useMessage('success')
  return response;
};

const onResponseRejected = (error: AxiosError) => {
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  if (error.response?.status === 401) {
    localStorage.removeItem('auth');

    // if (location.pathname !== '/auth/login') {
    // history.replaceState({}, '', '/auth/login');
    // }

    toast.error('請重新登入');
  } else {
    if (error?.request?.responseType === 'blob') {
      return Promise.reject(error);
    }

    console.log(error);
    let errMsg =
      (error.response?.data as any)?.message ??
      (error.response?.data as any)?.data ??
      error.response?.data ??
      error?.message ??
      error;

    if (errMsg instanceof ArrayBuffer) {
      const uint8Array = new Uint8Array(errMsg);
      const decoder = new TextDecoder('utf-8');
      const resultString = decoder.decode(uint8Array);
      if (resultString !== '404: Not Found') {
        errMsg = resultString;
      }
    }

    toast.error(errMsg);
  }
  return Promise.reject(error);
};

[axiosInstance].forEach((instance) => {
  instance.interceptors.request.use(onRequestFulfilled, onRequestRejected);
  instance.interceptors.response.use(onResponseFulfilled, onResponseRejected);
});

export { axiosInstance };
