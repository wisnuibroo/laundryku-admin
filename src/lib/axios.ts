import axios from 'axios';

const ACCESS_TOKEN = 'ACCESS_TOKEN';
const USER_TYPE = 'USER_TYPE';
const USER_DATA = 'USER_DATA';

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
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

// Variabel untuk melacak apakah kita sedang dalam proses redirect ke login
let isRedirectingToLogin = false;

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Jika sudah dalam proses redirect, jangan lakukan apa-apa
    if (isRedirectingToLogin) {
      return Promise.reject(error);
    }
    
    if (error.response) {
      const { status, data } = error.response;
      const errorMessage = data?.message || data?.error || 'Aya masalah di server';
      const originalRequest = error.config;

      // Jika error 401 (Unauthorized) dan belum pernah mencoba retry
      if (status === 401 && !originalRequest._retry) {
        // Cek apakah ini adalah request ke endpoint login
        const isLoginRequest = originalRequest.url.includes('/login') || 
                              originalRequest.url.includes('/register');
        
        if (isLoginRequest) {
          // Jika ini adalah request login yang gagal, biarkan error diproses normal
          console.error('Login failed:', errorMessage);
          return Promise.reject({
            errors: data?.errors || { general: [errorMessage] },
          });
        }
        
        console.log('Session expired, redirecting to login');
        isRedirectingToLogin = true;
        
        // Hapus semua data autentikasi
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(USER_TYPE);
        localStorage.removeItem(USER_DATA);
        
        // Simpan URL saat ini untuk redirect kembali setelah login
        try {
          localStorage.setItem('REDIRECT_AFTER_LOGIN', window.location.pathname);
        } catch (e) {
          console.error('Error saving redirect URL:', e);
        }
        
        // Gunakan format hash router dengan timeout untuk mencegah multiple redirects
        setTimeout(() => {
          window.location.href = '/#/login';
          isRedirectingToLogin = false;
        }, 300);
        
        return Promise.reject({
          errors: { general: ['Sesi anda telah berakhir. Silakan login kembali.'] },
        });
      }
      
      switch (status) {
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
        case 503:
          console.error(`Service unavailable: ${errorMessage}`);
          return Promise.reject({
            errors: { general: ['Server sedang dalam pemeliharaan. Silakan coba beberapa saat lagi.'] },
          });
        default:
          console.error(`API error (${status}): ${errorMessage}`);
          return Promise.reject({
            errors: { general: [errorMessage] },
          });
      }
    } else if (error.request) {
      console.error('Network error - no response:', error.request);
      
      // Cek apakah ada koneksi internet
      if (!navigator.onLine) {
        return Promise.reject({
          errors: { general: ['Anda sedang offline. Silakan periksa koneksi internet Anda.'] },
        });
      }
      
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