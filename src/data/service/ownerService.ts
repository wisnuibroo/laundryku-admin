import axiosInstance from '../../lib/axios';

export interface Owner {
  id: number;
  username: string;
  email: string;
  nama_laundry: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data?: T;
  errors?: any;
}

class OwnerService {
  private cachedOwner: Owner | null = null;
  private lastFetchTime: number = 0;
  private cacheExpiryMs: number = 5 * 60 * 1000; // 5 minutes cache

  // Get current owner profile
  async getCurrentOwner(): Promise<Owner> {
    try {
      // Try to get owner from localStorage first
      const userData = localStorage.getItem('USER_DATA');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          if (parsedUser && parsedUser.id) {
            // If we have a valid user in localStorage, use it
            return parsedUser as Owner;
          }
        } catch (e) {
          console.error('Error parsing user data from localStorage', e);
        }
      }
      
      // Check if we have a cached owner and if it's still valid
      const now = Date.now();
      if (this.cachedOwner && (now - this.lastFetchTime < this.cacheExpiryMs)) {
        return this.cachedOwner;
      }
      
      // If no cache or expired, fetch from API
      const response = await axiosInstance.get<ApiResponse<Owner>>('/owner/profile');
      if (!response.data.data) {
        throw new Error('Owner data not found');
      }
      
      // Update cache
      this.cachedOwner = response.data.data;
      this.lastFetchTime = now;
      
      // Also update localStorage
      localStorage.setItem('USER_DATA', JSON.stringify(response.data.data));
      
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching current owner:', error);
      throw error;
    }
  }

  private cachedStats: any = null;
  private lastStatsFetchTime: number = 0;
  private statsCacheExpiryMs: number = 2 * 60 * 1000; // 2 minutes cache for stats

  // Get owner dashboard stats
  async getDashboardStats(): Promise<any> {
    try {
      // Check if we have cached stats and if they're still valid
      const now = Date.now();
      if (this.cachedStats && (now - this.lastStatsFetchTime < this.statsCacheExpiryMs)) {
        return this.cachedStats;
      }
      
      // If no cache or expired, fetch from API
      const response = await axiosInstance.get('/owner/dashboard-stats');
      
      if (response.data.data) {
        // Update cache
        this.cachedStats = response.data.data;
        this.lastStatsFetchTime = now;
      }
      
      return response.data.data || {
        total_pesanan: 0,
        total_pendapatan: 0,
        pesanan_by_status: {
          baru: 0,
          proses: 0,
          selesai: 0,
          diambil: 0,
          dibatalkan: 0
        },
        pesanan_terbaru: []
      };
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      
      // Return default values instead of throwing to prevent UI breakage
      return {
        total_pesanan: 0,
        total_pendapatan: 0,
        pesanan_by_status: {
          baru: 0,
          proses: 0,
          selesai: 0,
          diambil: 0,
          dibatalkan: 0
        },
        pesanan_terbaru: []
      };
    }
  }

  // Update owner profile
  async updateProfile(profileData: Partial<Owner>): Promise<Owner> {
    try {
      const response = await axiosInstance.put<ApiResponse<Owner>>('/owner/profile', profileData);
      if (!response.data.data) {
        throw new Error('Failed to update profile');
      }
      return response.data.data;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
}

export default new OwnerService();