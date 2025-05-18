import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { getUrl } from "../../data/service/ApiService";
import { Pesanan } from "../../data/model/Pesanan";
 

export default function PesananPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pesanan, setPesanan] = useState<Pesanan[]>([]);

  useEffect(() => {
    getUrl(setPesanan);
  }, []);

  // Buat parameter baru yang memetconst [pesanan, setPesanan] = useState([]);const [pesanan, setPesanan] = useState([]);const [pesanan, setPesanan] = useState([]);akan data pesanan ke format yang sudah siap pakai di UI
  const dataPesanan = pesanan.map((item: Pesanan, index: number) => ({
    no: index + 1,
    id: item.id,
    id_user: item.id_user,
    alamat: item.alamat,
    tanggal: item.tanggal_pesanan,
    name: (item as any).user.name || item.name,
    phone: (item as any).user.phone || item.phone,
    status: item.status,
    total_harga: item.total_harga,
    jenis_pembayaran: item.jenis_pembayaran,
    catatan: item.catatan
  }));
  
  

  return (
    <div className="flex h-screen bg-white-100">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 p-6">
        <h1 className="text-2xl font-semibold">Pesanan</h1>

      

        <div className="mt-6 bg-gray-100 p-4 shadow rounded-[10px]">
          <table className="w-full text-center">
            <thead>
              <tr className="bg-gray-10 text-gray-600 text-sm">
                <th className="py-2 px-4">No</th>
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">No.Hp</th>
                <th className="py-2 px-4">Alamat</th>
                <th className="py-2 px-4">Tanggal Pesan</th>
                <th className="py-2 px-4">Catatan</th>
                <th className="py-2 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {dataPesanan.length > 0 ? (
                dataPesanan.map((item) => (
                  <tr key={item.id} className="bg-white rounded-[10px] text-sm text-black-600">
                    <td className="py-3 px-4 rounded-l-[19px]">{item.no}</td>
                    <td className="py-3 px-4">{item.name}</td>
                    <td className="py-3 px-4">{item.phone}</td>
                    <td className="py-3 px-4">{item.alamat}</td>
                    <td className="py-3 px-4">{item.tanggal}</td>
                    <td className="py-3 px-4">{item.catatan}</td>
                    <td className="py-3 px-4 rounded-r-[19px]">{item.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="py-4 text-gray-500">
                    Belum ada pesanan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
