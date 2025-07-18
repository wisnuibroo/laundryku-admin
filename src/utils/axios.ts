import axios from 'axios';

const ACCESS_TOKEN = 'ACCESS_TOKEN';
const USER_TYPE = 'USER_TYPE';
const USER_DATA = 'USER_DATA';

const axiosInstance = axios.create({
  baseURL: 'https://laundryku.rplrus.com/api',
  timeout: 15000, // 15 detik timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
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
          // Hapus semua data autentikasi
          localStorage.removeItem(ACCESS_TOKEN);
          localStorage.removeItem(USER_TYPE);
          localStorage.removeItem(USER_DATA);
          // Gunakan format hash router
          window.location.href = '/#/login';
          break;
        case 422:
          console.error(`Validasi gagal: ${errorMessage}`);
          return Promise.reject({
            errors: data?.errors || { general: [errorMessage] },
          });
        case 500:
          console.error(`Server error: ${errorMessage}`);
          return Promise.reject({
            errors: { general: [`Server error: ${errorMessage}`] },
          });
        default:
          console.error(`API error (${status}): ${errorMessage}`);
          return Promise.reject({
            errors: { general: [errorMessage] },
          });
      }
    } else if (error.request) {
      console.error('Network error - no response:', error.request);
      return Promise.reject({
        errors: { general: ['Koneksi ka server gagal, mangga cek koneksi internet anjeun!'] },
      });
    } else {
      console.error('Error:', error.message);
      return Promise.reject({
        errors: { general: [error.message || 'Aya kasalahan nu teu dipikawanoh'] },
      });
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;