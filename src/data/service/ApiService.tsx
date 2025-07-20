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
  id_laundry: number;
}

export const getKaryawan = async (id_laundry: number): Promise<Person[]> => {
  try {
    if (!id_laundry) {
      throw new Error("ID Laundry tidak ditemukan");
    }
    const response = await axiosInstance.get(`/person?id_laundry=${id_laundry}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || "Gagal mengambil data karyawan");
  }
};

export const getUrl = async (setPesanan: React.Dispatch<React.SetStateAction<Pesanan[]>>, id_laundry?: number) => {
  try {
    if (!id_laundry) {
      throw new Error("ID Laundry tidak ditemukan");
    }
    const response = await axiosInstance.get(`/pesanan?id_laundry=${id_laundry}`);
    setPesanan(response.data || []);
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

export const updateHargaPesanan = async (id: number, total_harga: number): Promise<boolean> => {
  try {
    const response = await axiosInstance.put(`/pesanan/${id}`, { total_harga });
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

export const getStatistik = async (id_laundry: number): Promise<StatistikData> => {
  try {
    if (!id_laundry) {
      throw new Error("ID Laundry tidak ditemukan");
    }
    const response = await axiosInstance.get(`/statistik?id_laundry=${id_laundry}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || "Gagal mengambil data statistik");
  }
};