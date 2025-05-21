import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://laundryku.rplrus.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ACCESS_TOKEN');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Log request data
    console.log('Request Data:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Log response data
    console.log('Response Data:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    if (error.response) {
      // Log detailed error response
      console.error('Error Response:', {
        url: error.config.url,
        method: error.config.method,
        requestData: error.config.data,
        status: error.response.status,
        responseData: error.response.data,
        headers: error.config.headers
      });

      switch (error.response.status) {
        case 401:
          localStorage.removeItem('ACCESS_TOKEN');
          window.location.href = '/login';
          break;
        case 422:
          console.error('Validation Error:', error.response.data);
          break;
        case 500:
          console.error('Server Error:', error.response.data);
          break;
        default:
          console.error('API Error:', error.response.data);
      }
    } else if (error.request) {
      console.error('Network Error:', {
        url: error.config.url,
        method: error.config.method,
        requestData: error.config.data
      });
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;