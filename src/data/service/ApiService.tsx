import axios from "axios";
import { Pesanan } from "../model/Pesanan";
 

export const getUrl = async (setPesanan: React.Dispatch<React.SetStateAction<Pesanan[]>>) => {
  try {
    const response = await axios.get("https://laundryku.rplrus.com/api/pesanan");
    if (response.data) {
      setPesanan(response.data);
    } else {
      console.error("Data pesanan kosong");
      setPesanan([]);
    }
  } catch (error) {
    console.error("Gagal mengambil data pesanan:", error);
    setPesanan([]);
    // Tambahkan notifikasi error ke user jika diperlukan
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