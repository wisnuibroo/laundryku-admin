import axios from "axios";
import { Pesanan } from "../model/Pesanan";
 

export const getUrl = async (setPesanan: React.Dispatch<React.SetStateAction<Pesanan[]>>, id_laundry?: number) => {
  try {
    if (!id_laundry) {
      console.error("ID Laundry tidak ditemukan");
      setPesanan([]);
      return;
    }
    const url = `https://laundryku.rplrus.com/api/pesanan?id_laundry=${id_laundry}`;
    const response = await axios.get(url);
    if (response.data) {
      setPesanan(response.data);
    } else {
      console.error("Data pesanan kosong");
      setPesanan([]);
    }
  } catch (error) {
    console.error("Gagal mengambil data pesanan:", error);
    setPesanan([]);
  }
};

export const updateStatusPesanan = async (id: number, status: string): Promise<boolean> => {
  try {
    const response = await axios.put(`https://laundryku.rplrus.com/api/pesanan/${id}`, { status });
    return response.status === 200;
  } catch (error: any) {
    if (error.response) {
      console.error("Gagal mengupdate status pesanan:", error.response.data);
      alert("Error: " + JSON.stringify(error.response.data));
    } else {
      console.error("Gagal mengupdate status pesanan:", error);
      alert("Error: " + error.message);
    }
    return false;
  }
};

export const updateHargaPesanan = async (id: number, total_harga: number): Promise<boolean> => {
  try {
    const response = await axios.put(`https://laundryku.rplrus.com/api/pesanan/${id}`, { total_harga });
    return response.status === 200;
  } catch (error: any) {
    if (error.response) {
      console.error("Gagal mengupdate harga pesanan:", error.response.data);
      alert("Error: " + JSON.stringify(error.response.data));
    } else {
      console.error("Gagal mengupdate harga pesanan:", error);
      alert("Error: " + error.message);
    }
    return false;
  }
};