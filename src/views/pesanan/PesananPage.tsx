import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { getUrl } from "../../data/service/ApiService";
import { Pesanan } from "../../data/model/Pesanan";
import Search from "../../components/search";
import { Icon } from '@iconify/react';

export default function PesananPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pesanan, setPesanan] = useState<Pesanan[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [searchKeyword, setSearchKeyword] = useState<string>("");

  useEffect(() => {
    getUrl(setPesanan);
  }, []);

  const filteredPesanan = filterStatus ? pesanan.filter((item: Pesanan) => item.status.toLowerCase() === filterStatus.toLowerCase()) : pesanan;
  const searchedPesanan = searchKeyword
    ? filteredPesanan.filter((item: Pesanan) => {
        const keyword = searchKeyword.toLowerCase();
        return (
          (item.name && item.name.toLowerCase().includes(keyword)) ||
          ((item as any).user?.name && (item as any).user?.name.toLowerCase().includes(keyword)) ||
          (item.phone && item.phone.toLowerCase().includes(keyword)) ||
          ((item as any).user?.phone && (item as any).user?.phone.toLowerCase().includes(keyword)) ||
          (item.alamat && item.alamat.toLowerCase().includes(keyword))
        );
      })
    : filteredPesanan;
  const dataPesanan = searchedPesanan.map((item: Pesanan, index: number) => ({
    no: index + 1,
    id: item.id,
    id_user: item.id_user,
    alamat: item.alamat,
    tanggal: item.tanggal_pesanan,
    name: (item as any).user?.name || item.name,
    phone: (item as any).user?.phone || item.phone,
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
        
        <div className="mt-10 flex items-center gap-3">
          <Search value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} />

          <div className="relative">
            <button type="button" className="ml-1 p-2 rounded bg-gray-100 hover:bg-gray-300 transition-colors flex items-center gap-2 text-black shadow" aria-label="Filter" onClick={() => setShowFilter(!showFilter)}>
              <Icon icon="mdi:filter-variant" width="24" height="24" />
            </button>
            {showFilter && (
              <div className="absolute top-full left-0 mt-2 bg-white border rounded shadow-lg z-10 p-3">
                <div className="mb-2 font-semibold">Filter Status</div>
                <select
                  className="border rounded px-2 py-1 w-40"
                  value={filterStatus}
                  onChange={e => { setFilterStatus(e.target.value); setShowFilter(false); }}
                >
                  <option value="">Semua Status</option>
                  <option value="Menunggu">Menunggu</option>
                  <option value="Diproses">Diproses</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Diambil">Diambil</option>
                </select>
              </div>
            )}
          </div>
        </div>
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
                <th className="py-2 px-4 relative">
                  <div className="flex items-center justify-center gap-1">
                    Status
                  </div>
                </th>
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
