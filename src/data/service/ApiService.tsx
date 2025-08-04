import axiosInstance from "../../lib/axios";
import { Layanan, Pesanan } from "../model/Pesanan";

export interface Person {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  salary: number;
  join_date: string;
  status: string;
  avatar: string;
  id_owner: number;
}

export const getKaryawan = async (id_owner: number): Promise<Person[]> => {
  try {
    if (!id_owner) {
      throw new Error("ID Owner tidak ditemukan");
    }
    const response = await axiosInstance.get(`/person?id_owner=${id_owner}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || "Gagal mengambil data karyawan");
  }
};

export const getUrl = async (setPesanan: React.Dispatch<React.SetStateAction<Pesanan[]>>, id_owner?: number) => {
  try {
    if (!id_owner) {
      throw new Error("ID Owner tidak ditemukan");
    }
    const response = await axiosInstance.get(`/pesanan?id_owner=${id_owner}`);
    
    if (response.data && response.data.status && Array.isArray(response.data.data)) {
      setPesanan(response.data.data);
    } else if (Array.isArray(response.data)) {
      setPesanan(response.data);
    } else {
      console.error("Data pesanan bukan array:", response.data);
      setPesanan([]);
    }
  } catch (error: any) {
    setPesanan([]);
    throw new Error(error.message || "Gagal mengambil data pesanan");
  }
};

export const updateStatusPesanan = async (id: number, status: string): Promise<boolean> => {
  try {
    const response = await axiosInstance.put(`/pesanan/${id}`, { status });
    return response.status === 200;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Gagal merubah status pesanan";
    throw new Error(errorMessage);
  }
};

export const updateHargaPesanan = async (id: number, jumlah_harga: number): Promise<boolean> => {
  try {
    const response = await axiosInstance.put(`/pesanan/${id}`, { jumlah_harga });
    return response.status === 200;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Gagal merubah harga pesanan";
    throw new Error(errorMessage);
  }
};

export interface StatistikData {
  total_pendapatan: number;
  total_pesanan: number;
  total_pelanggan: number;
  pesanan_per_bulan: Array<{ bulan: string; jumlah: number }>;
  pendapatan_per_bulan: Array<{ bulan: string; jumlah: number }>;
}

export const getStatistik = async (id_owner: number): Promise<StatistikData> => {
  try {
    if (!id_owner) {
      throw new Error("ID Owner tidak ditemukan");
    }
    const response = await axiosInstance.get(`/statistik?id_owner=${id_owner}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || "Gagal mengambil data statistik");
  }
};

interface TambahPesananInput {
  id_owner: number;
  id_admin?: number;
  nama_pelanggan: string;
  nomor: string;
  alamat: string;
  layanan: string;
  berat?: number;
  jumlah_harga?: number;
  status?: 'pending' | 'diproses' | 'selesai' | 'lunas';
  jenis_pembayaran?: 'cash' | 'transfer';
}

export const tambahPesanan = async (data: TambahPesananInput): Promise<void> => {
  try {
    const response = await axiosInstance.post("/pesanan", data);
    if (response.status !== 201 && response.status !== 200) {
      throw new Error("Gagal menambahkan pesanan");
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Gagal menambahkan pesanan";
    throw new Error(errorMessage);
  }
};

export const getLayanan = async (id_owner?: number): Promise<Layanan[]> => {
  try {
    console.log('getLayanan called with id_owner:', id_owner);
    const url = id_owner ? `/layanan?id_owner=${id_owner}` : '/layanan';
    console.log('Request URL:', url);
    const response = await axiosInstance.get(url);
    console.log('getLayanan response:', response);
    console.log('getLayanan response.data:', response.data);
    
    if (response.data && response.data.status && Array.isArray(response.data.data)) {
      console.log('Response format: { status, data }');
      return response.data.data;
    } else if (Array.isArray(response.data)) {
      console.log('Response format: array');
      return response.data;
    } else if (response.data && Array.isArray(response.data.layanan)) {
      console.log('Response format: { layanan: [] }');
      return response.data.layanan;
    } else {
      console.warn('Unexpected response format:', response.data);
      return [];
    }
  } catch (error: any) {
    console.error("Error in getLayanan:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    throw new Error(error.response?.data?.message || error.message || "Gagal mengambil layanan");
  }
};

export const getLayananByOwner = async (id_owner: number): Promise<Layanan[]> => {
  try {
    if (!id_owner) {
      throw new Error("ID Owner tidak ditemukan");
    }
    console.log('getLayananByOwner called with id_owner:', id_owner);
    const response = await axiosInstance.get(`/layanan?id_owner=${id_owner}`);
    console.log('getLayananByOwner response:', response.data);
    
    if (response.data && response.data.status && Array.isArray(response.data.data)) {
      return response.data.data;
    } else if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.warn('Unexpected response format:', response.data);
      return [];
    }
  } catch (error: any) {
    console.error("Error in getLayananByOwner:", error);
    throw new Error(error.response?.data?.message || error.message || "Gagal mengambil layanan");
  }
};

interface TambahLayananInput {
  id_owner: number;
  nama_layanan: string;
  harga_layanan: string; // ← Ubah dari number ke string
  keterangan_layanan: string;
}

export const tambahLayanan = async (data: TambahLayananInput): Promise<void> => {
  try {
    console.log('tambahLayanan called with data:', data);
    
    // Pastikan format data sesuai dengan validasi controller PHP
    const formattedData = {
      nama_layanan: data.nama_layanan,
      harga_layanan: data.harga_layanan, // Sudah string
      keterangan_layanan: data.keterangan_layanan,
      id_owner: data.id_owner
    };
    
    console.log('Formatted data for API:', formattedData);
    
    const response = await axiosInstance.post("/layanan", formattedData);
    
    console.log('tambahLayanan response:', response);
    
    if (response.status !== 201 && response.status !== 200) {
      throw new Error("Gagal menambahkan layanan");
    }
  } catch (error: any) {
    console.error('Error in tambahLayanan:', error);
    console.error('Error response:', error.response?.data);
    
    if (error.response?.data?.errors) {
      // Handle validation errors
      const errorMessages = Object.entries(error.response.data.errors)
        .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
        .join('; ');
      throw new Error(`Validasi gagal: ${errorMessages}`);
    }
    
    const errorMessage = error.response?.data?.message || error.message || "Gagal menambahkan layanan";
    throw new Error(errorMessage);
  }
};