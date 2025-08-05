import axiosInstance from "../../lib/axios";
import { Pesanan } from "../model/Pesanan";

// Interface untuk menambah pesanan sesuai dengan PesananController
export interface AddPesananInput {
  id_owner?: number;
  id_admin?: number;
  name?: string; // akan dipetakan ke nama_pelanggan
  phone?: string; // akan dipetakan ke nomor
  nama_pelanggan?: string; // field langsung
  nomor?: string; // field langsung
  alamat: string;
  layanan: string;
  berat?: number;
  total_harga?: number; // akan dipetakan ke jumlah_harga
  jumlah_harga?: number; // field langsung
  jenis_pembayaran?: 'cash' | 'transfer';
  status?: 'pending' | 'diproses' | 'selesai' | 'lunas';
}

export const addPesanan = async (data: AddPesananInput): Promise<Pesanan> => {
  try {
    console.log("Raw data received in addPesanan:", data);
    console.log("Data type check:", {
      id_owner: typeof data.id_owner,
      id_admin: typeof data.id_admin,
      nama_pelanggan: typeof data.nama_pelanggan,
      nomor: typeof data.nomor,
      alamat: typeof data.alamat,
      layanan: typeof data.layanan
    });
    
    // Map data sesuai dengan field yang dibutuhkan PesananController
    const payload = {
      id_owner: data.id_owner,
      id_admin: data.id_admin,
      nama_pelanggan: data.nama_pelanggan || data.name || '',
      nomor: data.nomor || data.phone || '',
      alamat: data.alamat,
      layanan: data.layanan,
      berat: data.berat || 0,
      jumlah_harga: data.jumlah_harga || data.total_harga || 0,
      status: data.status || 'pending',
      jenis_pembayaran: data.jenis_pembayaran?.toLowerCase() === 'tunai' ? 'cash' : data.jenis_pembayaran?.toLowerCase()
    };

    console.log("Mapped payload for API:", payload);
    console.log("API endpoint: /pesanan");
    console.log("Payload type check:", {
      id_owner: typeof payload.id_owner,
      id_admin: typeof payload.id_admin,
      nama_pelanggan: typeof payload.nama_pelanggan,
      nomor: typeof payload.nomor,
      alamat: typeof payload.alamat,
      layanan: typeof payload.layanan
    });

    const response = await axiosInstance.post("/pesanan", payload);
    
    console.log("API response:", response.data);
    
    // Handle response sesuai dengan structure PesananController
    if (response.data && response.data.status && response.data.data) {
      return response.data.data;
    }
    
    return response.data;
  } catch (error: any) {
    console.error("Error in addPesanan:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    console.error("Error message:", error.message);
    
    // Log detail error jika ada
    if (error.response?.data?.errors) {
      console.error("Validation errors:", error.response.data.errors);
    }
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.errors || 
                        error.message || 
                        "Gagal menambahkan pesanan";
    throw new Error(errorMessage);
  }
};

export const getPesanan = async (id_owner?: number): Promise<Pesanan[]> => {
  try {
    if (!id_owner) {
      throw new Error("ID Owner tidak ditemukan");
    }
    
    console.log("Fetching pesanan with id_owner:", id_owner);
    const response = await axiosInstance.get(`/pesanan?id_owner=${id_owner}`);
    console.log("API Response:", response.data);
    
    // Handle response sesuai dengan structure PesananController
    if (response.data && response.data.status && Array.isArray(response.data.data)) {
      console.log("Returning pesanan data array:", response.data.data);
      return response.data.data;
    } else if (Array.isArray(response.data)) {
      console.log("Returning direct array:", response.data);
      return response.data;
    }
    
    console.log("No valid pesanan data found, returning empty array");
    return [];
  } catch (error: any) {
    console.error("Error in getPesanan:", error);
    throw new Error(error.message || "Gagal mengambil data pesanan");
  }
};

export const updatePesanan = async (id: number, data: Partial<AddPesananInput>): Promise<Pesanan> => {
  try {
    // Map data sesuai dengan field yang dibutuhkan PesananController
    const payload: any = {};
    
    if (data.name) payload.nama_pelanggan = data.name;
    if (data.nama_pelanggan) payload.nama_pelanggan = data.nama_pelanggan;
    if (data.phone) payload.nomor = data.phone;
    if (data.nomor) payload.nomor = data.nomor;
    if (data.alamat) payload.alamat = data.alamat;
    if (data.layanan) payload.layanan = data.layanan;
    if (data.berat !== undefined) payload.berat = data.berat;
    if (data.total_harga !== undefined) payload.jumlah_harga = data.total_harga;
    if (data.jumlah_harga !== undefined) payload.jumlah_harga = data.jumlah_harga;
    if (data.status) payload.status = data.status;
    if (data.jenis_pembayaran) {
      payload.jenis_pembayaran = data.jenis_pembayaran.toLowerCase() === 'tunai' ? 'cash' : data.jenis_pembayaran.toLowerCase();
    }

    const response = await axiosInstance.put(`/pesanan/${id}`, payload);
    
    // Handle response sesuai dengan structure PesananController
    if (response.data && response.data.status && response.data.data) {
      return response.data.data;
    }
    
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.errors || 
                        error.message || 
                        "Gagal mengupdate pesanan";
    throw new Error(errorMessage);
  }
};

export const deletePesanan = async (id: number): Promise<boolean> => {
  try {
    const response = await axiosInstance.delete(`/pesanan/${id}`);
    return response.status === 200;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Gagal menghapus pesanan";
    throw new Error(errorMessage);
  }
};

export const getPesananById = async (id: number): Promise<Pesanan> => {
  try {
    const response = await axiosInstance.get(`/pesanan/${id}`);
    
    // Handle response sesuai dengan structure PesananController
    if (response.data && response.data.status && response.data.data) {
      return response.data.data;
    }
    
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Pesanan tidak ditemukan";
    throw new Error(errorMessage);
  }
};