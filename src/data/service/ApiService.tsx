import axiosInstance from "../../lib/axios";
import { Pesanan } from "../model/Pesanan";

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
    
    // Sesuaikan dengan response structure dari PesananController
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
    // Sesuaikan field name dengan yang ada di PesananController
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

// Interface untuk menambah pesanan sesuai dengan PesananController
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