import axios from 'axios';

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
    const token = localStorage.getItem("token");
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
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired atau invalid
      console.error('Authentication error:', error);
      
      // Hapus semua data auth
      localStorage.clear();
      
      // Redirect ke login
      window.location.href = '/login';
      
      return Promise.reject(new Error('Sesi Anda telah berakhir. Silakan login kembali.'));
    }
    
    // Handle error lainnya
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Terjadi kesalahan pada server';
                        
    console.error('Response error:', errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

export default axiosInstance;