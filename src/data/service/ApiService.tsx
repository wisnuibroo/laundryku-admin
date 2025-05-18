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