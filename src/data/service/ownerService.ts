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
  // Get current owner profile
  async getCurrentOwner(): Promise<Owner> {
    try {
      const response = await axiosInstance.get<ApiResponse<Owner>>('/owner/profile');
      if (!response.data.data) {
        throw new Error('Owner data not found');
      }
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching current owner:', error);
      throw error;
    }
  }

  // Get owner dashboard stats
  async getDashboardStats(): Promise<any> {
    try {
      const response = await axiosInstance.get('/owner/dashboard-stats');
      return response.data.data || {};
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
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