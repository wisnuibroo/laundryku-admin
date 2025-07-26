import axiosInstance from '../../lib/axios';
import ownerService from './ownerService';

export interface Admin {
  id: number;
  name: string;
  email: string;
  nomor: string;
  status: 'aktif' | 'nonaktif';
  id_owner: number;
  created_at?: string;
  updated_at?: string;
  owner?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface AdminStats {
  total_karyawan: number;
  karyawan_aktif: number;
  karyawan_baru: number;
  ratarataRating: number;
}

export interface CreateAdminRequest {
  name: string;
  email: string;
  nomor: string;
  status: 'aktif' | 'nonaktif';
  id_owner: number;
  password: string;
}

export interface UpdateAdminRequest {
  name?: string;
  email?: string;
  nomor?: string;
  status?: 'aktif' | 'nonaktif';
  id_owner?: number;
  password?: string;
}

export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data?: T;
  errors?: any;
}

class AdminService {
  // Get all admins
  async getAdmins(): Promise<Admin[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<Admin[]>>('/admin');
      return response.data.data || [];
    } catch (error: any) {
      console.error('Error fetching admins:', error);
      throw error;
    }
  }

  // Get admin by ID
  async getAdminById(id: number): Promise<Admin> {
    try {
      const response = await axiosInstance.get<ApiResponse<Admin>>(`/admin/${id}`);
      if (!response.data.data) {
        throw new Error('Admin not found');
      }
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching admin:', error);
      throw error;
    }
  }

  // Create new admin
  async createAdmin(adminData: Omit<CreateAdminRequest, 'id_owner'>): Promise<Admin> {
    try {
      // Get owner ID from localStorage first
      const userData = localStorage.getItem('USER_DATA');
      let ownerId: number | null = null;
      
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          if (parsedUser && parsedUser.id) {
            ownerId = parsedUser.id;
          }
        } catch (e) {
          console.error('Error parsing user data from localStorage', e);
        }
      }
      
      // If we couldn't get the ID from localStorage, try the API
      if (!ownerId) {
        const owner = await ownerService.getCurrentOwner();
        ownerId = owner.id;
      }
      
      if (!ownerId) {
        throw new Error('Owner ID not found');
      }
      
      const fullAdminData = {
        ...adminData,
        id_owner: ownerId
      };
      
      console.log('Sending admin data:', fullAdminData);
      
      const response = await axiosInstance.post<ApiResponse<Admin>>('/admin', fullAdminData);
      if (!response.data.status || !response.data.data) {
        throw new Error(response.data.message || 'Failed to create admin');
      }
      return response.data.data;
    } catch (error: any) {
      console.error('Error creating admin:', error);
      console.error('Error response:', error.response?.data);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error('Session expired. Please login again.');
      }
      if (error.response?.status === 422) {
        const validationErrors = error.response.data?.errors;
        console.error('Validation errors:', validationErrors);
        if (validationErrors) {
          const errorMessages = Object.values(validationErrors).flat();
          throw new Error(errorMessages.join(', '));
        }
      }
      throw new Error(error.response?.data?.message || error.message || 'Failed to create admin');
    }
  }

  // Update admin
  async updateAdmin(id: number, adminData: UpdateAdminRequest): Promise<Admin> {
    try {
      const response = await axiosInstance.put<ApiResponse<Admin>>(`/admin/${id}`, adminData);
      if (!response.data.data) {
        throw new Error('Failed to update admin');
      }
      return response.data.data;
    } catch (error: any) {
      console.error('Error updating admin:', error);
      throw error;
    }
  }

  // Delete admin
  async deleteAdmin(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`/admin/${id}`);
    } catch (error: any) {
      console.error('Error deleting admin:', error);
      throw error;
    }
  }

  // Cache for admins list
  private cachedAdmins: Admin[] | null = null;
  private lastAdminsFetchTime: number = 0;
  private adminsCacheExpiryMs: number = 2 * 60 * 1000; // 2 minutes cache

  // Get admins for current owner only
  async getAdminsForCurrentOwner(): Promise<Admin[]> {
    try {
      // Check if we have cached admins and if they're still valid
      const now = Date.now();
      if (this.cachedAdmins && (now - this.lastAdminsFetchTime < this.adminsCacheExpiryMs)) {
        return this.cachedAdmins;
      }

      // Try to get admins from localStorage cache first
      const cachedAdminsJson = localStorage.getItem('CACHED_ADMINS');
      if (cachedAdminsJson) {
        try {
          const cachedAdmins = JSON.parse(cachedAdminsJson);
          if (Array.isArray(cachedAdmins) && cachedAdmins.length > 0) {
            // Update memory cache with localStorage data
            this.cachedAdmins = cachedAdmins;
            this.lastAdminsFetchTime = now - (this.adminsCacheExpiryMs / 2); // Set to half-expired to refresh soon
            console.log('Using cached admins from localStorage');
            
            // Start a background refresh but don't wait for it
            this.refreshAdminsInBackground();
            
            return cachedAdmins;
          }
        } catch (parseErr) {
          console.error('Error parsing cached admins:', parseErr);
        }
      }
      
      // Get current owner's ID from localStorage first
      const userData = localStorage.getItem('USER_DATA');
      let ownerId: number | null = null;
      
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          if (parsedUser && parsedUser.id) {
            ownerId = parsedUser.id;
          }
        } catch (e) {
          console.error('Error parsing user data from localStorage', e);
        }
      }
      
      // If we couldn't get the ID from localStorage, try the API
      if (!ownerId) {
        try {
          const owner = await ownerService.getCurrentOwner();
          ownerId = owner.id;
        } catch (ownerError) {
          console.error('Error fetching owner:', ownerError);
          // If we have cached admins, return them instead of failing
          if (this.cachedAdmins && this.cachedAdmins.length > 0) {
            return this.cachedAdmins;
          }
          throw new Error('Failed to get owner ID');
        }
      }
      
      if (!ownerId) {
        throw new Error('Owner ID not found');
      }
      
      const response = await axiosInstance.get<ApiResponse<Admin[]>>(`/admin?id_owner=${ownerId}`);
      const admins = response.data.data || [];
      
      // Update cache
      this.cachedAdmins = admins;
      this.lastAdminsFetchTime = now;
      
      // Also update localStorage
      localStorage.setItem('CACHED_ADMINS', JSON.stringify(admins));
      
      return admins;
    } catch (error: any) {
      console.error('Error fetching admins for current owner:', error);
      
      // Try to use cached data if available
      if (this.cachedAdmins && this.cachedAdmins.length > 0) {
        console.log('Using memory-cached admins due to fetch error');
        return this.cachedAdmins;
      }
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error('Session expired. Please login again.');
      }
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch admins');
    }
  }
  
  // Refresh admins in background without blocking
  private async refreshAdminsInBackground() {
    try {
      // Get owner ID
      let ownerId: number | null = null;
      const userData = localStorage.getItem('USER_DATA');
      
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          if (parsedUser && parsedUser.id) {
            ownerId = parsedUser.id;
          }
        } catch (e) {
          console.error('Error parsing user data in background refresh', e);
          return;
        }
      }
      
      if (!ownerId) {
        try {
          const owner = await ownerService.getCurrentOwner();
          ownerId = owner.id;
        } catch (e) {
          console.error('Error fetching owner in background refresh', e);
          return;
        }
      }
      
      if (!ownerId) return;
      
      const response = await axiosInstance.get<ApiResponse<Admin[]>>(`/admin?id_owner=${ownerId}`);
      const admins = response.data.data || [];
      
      // Update cache
      this.cachedAdmins = admins;
      this.lastAdminsFetchTime = Date.now();
      
      // Also update localStorage
      localStorage.setItem('CACHED_ADMINS', JSON.stringify(admins));
      
      console.log('Background refresh of admins completed');
    } catch (error) {
      console.error('Error in background refresh of admins:', error);
    }
  }

  // Cache for admin statistics
  private cachedStats: AdminStats | null = null;
  private lastStatsFetchTime: number = 0;
  private statsCacheExpiryMs: number = 2 * 60 * 1000; // 2 minutes cache

  // Get admin statistics (mock implementation since no specific endpoint exists)
  async getAdminStats(): Promise<AdminStats> {
    try {
      // Check if we have cached stats and if they're still valid
      const now = Date.now();
      if (this.cachedStats && (now - this.lastStatsFetchTime < this.statsCacheExpiryMs)) {
        return this.cachedStats;
      }

      // Use try-catch to handle potential errors in getAdminsForCurrentOwner
      let admins: Admin[] = [];
      try {
        admins = await this.getAdminsForCurrentOwner();
      } catch (err) {
        console.error('Error in getAdminsForCurrentOwner during stats calculation:', err);
        // Try to get admins from localStorage if API call fails
        const cachedAdminsJson = localStorage.getItem('CACHED_ADMINS');
        if (cachedAdminsJson) {
          try {
            admins = JSON.parse(cachedAdminsJson);
            console.log('Using cached admins from localStorage for stats calculation');
          } catch (parseErr) {
            console.error('Error parsing cached admins:', parseErr);
          }
        }
      }
      
      // Cache admins in localStorage for future use
      if (admins.length > 0) {
        localStorage.setItem('CACHED_ADMINS', JSON.stringify(admins));
      }
      
      const totalKaryawan = admins.length;
      const karyawanAktif = admins.filter(admin => admin.status === 'aktif').length;
      
      // For new employees, we'll count those created in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const karyawanBaru = admins.filter(admin => {
        if (!admin.created_at) return false;
        const createdDate = new Date(admin.created_at);
        return createdDate >= thirtyDaysAgo;
      }).length;

      // Mock rating since there's no rating system in the API
      const ratarataRating = 4.6;

      const stats = {
        total_karyawan: totalKaryawan,
        karyawan_aktif: karyawanAktif,
        karyawan_baru: karyawanBaru,
        ratarataRating: ratarataRating
      };
      
      // Update cache
      this.cachedStats = stats;
      this.lastStatsFetchTime = now;
      
      return stats;
    } catch (error: any) {
      console.error('Error fetching admin stats:', error);
      // Return default values instead of throwing to prevent UI breakage
      return {
        total_karyawan: 0,
        karyawan_aktif: 0,
        karyawan_baru: 0,
        ratarataRating: 0
      };
    }
  }
}

export default new AdminService();