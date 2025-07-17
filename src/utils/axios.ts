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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const errorMessage = data?.message || data?.error || 'Aya masalah di server';

      switch (status) {
        case 401:
          localStorage.removeItem('ACCESS_TOKEN');
          window.location.href = '/login';
          break;
        case 422:
          throw new Error(`Validasi gagal: ${errorMessage}`);
        case 500:
          throw new Error(`Server error: ${errorMessage}`);
        default:
          throw new Error(`API error: ${errorMessage}`);
      }
    } else if (error.request) {
      throw new Error('Koneksi ka server gagal, mangga cek koneksi internet anjeun!');
    } else {
      throw new Error(error.message || 'Aya kasalahan nu teu dipikawanoh');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;