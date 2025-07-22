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
      // Get current owner to set id_owner
      const owner = await ownerService.getCurrentOwner();
      const fullAdminData = {
        ...adminData,
        id_owner: owner.id
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

  // Get admins for current owner only
  async getAdminsForCurrentOwner(): Promise<Admin[]> {
    try {
      // Get current owner's ID
      const owner = await ownerService.getCurrentOwner();
      
      const response = await axiosInstance.get<ApiResponse<Admin[]>>(`/admin?id_owner=${owner.id}`);
      return response.data.data || [];
    } catch (error: any) {
      console.error('Error fetching admins for current owner:', error);
      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error('Session expired. Please login again.');
      }
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch admins');
    }
  }

  // Get admin statistics (mock implementation since no specific endpoint exists)
  async getAdminStats(): Promise<AdminStats> {
    try {
      const admins = await this.getAdminsForCurrentOwner();
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

      return {
        total_karyawan: totalKaryawan,
        karyawan_aktif: karyawanAktif,
        karyawan_baru: karyawanBaru,
        ratarataRating: ratarataRating
      };
    } catch (error: any) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  }
}

export default new AdminService();