import axiosInstance from "../../lib/axios";

export interface PelangganData {
  nama_pelanggan: string;
  nomor: string;
  alamat: string;
}

export const getPelangganList = async (id_owner: number): Promise<PelangganData[]> => {
  try {
    const response = await axiosInstance.get(`/pelanggan?id_owner=${id_owner}`);
    
    if (response.data && response.data.status && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    
    return [];
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.errors || 
                        error.message || 
                        "Gagal mengambil daftar pelanggan";
    throw new Error(errorMessage);
  }
};

export const findPelangganByNomor = async (nomor: string, id_owner: number): Promise<PelangganData | null> => {
  try {
    const response = await axiosInstance.post("/pelanggan/find-by-nomor", {
      nomor,
      id_owner
    });

    if (response.data && response.data.status && response.data.data) {
      return response.data.data;
    }

    return null;
  } catch (error: any) {
    // Jika pelanggan tidak ditemukan, return null saja tanpa throw error
    if (error.response?.status === 404) {
      return null;
    }
    
    // Untuk error lainnya, throw error
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.errors || 
                        error.message || 
                        "Gagal mencari data pelanggan";
    throw new Error(errorMessage);
  }
};