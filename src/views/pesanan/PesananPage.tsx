import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { getUrl, updateStatusPesanan } from "../../data/service/ApiService";
import { Pesanan } from "../../data/model/Pesanan";
import Search from "../../components/search";
import { Icon } from '@iconify/react';
import Lottie from "lottie-react";
import animasiData from "../../assets/Animation - 1739535831442.json";
import { useNavigate } from "react-router-dom";
 import { useStateContext } from "../../contexts/ContextsProvider";

export default function PesananPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pesanan, setPesanan] = useState<Pesanan[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  const { user } = useStateContext();

  useEffect(() => {
    const fetchPesanan = async () => {
      setLoading(true);
      try {
        await getUrl(setPesanan);
      } catch (error) {
        console.error("Error fetching pesanan:", error);
        setPesanan([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPesanan();
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

  // Sort data by tanggal_pesanan (newest first)
  const sortedPesanan = [...searchedPesanan].sort((a, b) => {
    return new Date(b.tanggal_pesanan).getTime() - new Date(a.tanggal_pesanan).getTime();
  });

  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedPesanan.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const dataPesanan = currentItems.map((item: Pesanan, index: number) => ({
    no: index + 1,
    id: item.id,
    id_user: item.id_user,
    alamat: item.alamat,
    tanggal: item.tanggal_pesanan,
    name: (item as any).user.name,
    phone: (item as any).user.phone,
    status: item.status,
    total_harga: item.total_harga,
    jenis_pembayaran: item.jenis_pembayaran,
    catatan: item.catatan
  }));

  const handleStatusChange = async (id: number, newStatus: string) => {
    setStatusUpdateLoading(true);
    const success = await updateStatusPesanan(id, newStatus);
    if (success) {
      setPesanan((prev) => prev.map((item) => item.id === id ? { ...item, status: newStatus } : item));
      if (newStatus === "Selesai") {
        navigate("/tagihan");
      }
    } else {
      alert("Gagal mengupdate status pesanan");
    }
    setStatusUpdateLoading(false);
  };

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
                  <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
                  <option value="Diproses">Diproses</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Dikembalikan">Dikembalikan</option>
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-gray-100 p-4 shadow rounded-[10px] overflow-x-auto max-h-[calc(100vh-250px)]">
          <div className="min-w-[1000px]">
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
                {loading ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-32 h-32 mx-auto">
                          <Lottie animationData={animasiData} loop={true} />
                        </div>
                        <span className="text-gray-500 text-lg mt-1">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  dataPesanan.length > 0 ? (
                    dataPesanan.map((item) => (
                      <tr key={item.id} className="bg-white rounded-[10px] text-sm text-black-600">
                        <td className="py-3 px-4 rounded-l-[5px]">{item.no}</td>
                        <td className="py-3 px-4">{item.name}</td>
                        <td className="py-3 px-4">{item.phone}</td>
                        <td className="py-3 px-4">{item.alamat}</td>
                        <td className="py-3 px-4">{item.tanggal}</td>
                        <td className="py-3 px-4">{item.catatan}</td>
                        <td className="py-3 px-4 rounded-r-[5px]">
                          <select
                            className="border rounded px-2 py-1"
                            value={item.status}
                            disabled={statusUpdateLoading}
                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          >
                            <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
                            <option value="Diproses">Diproses</option>
                            <option value="Selesai">Selesai</option>
                            <option value="Dikembalikan">Dikembalikan</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="py-4 text-gray-500">
                        Belum ada pesanan.
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {!loading && dataPesanan.length > 0 && (
              <div className="flex justify-center mt-4 gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-300' : 'bg-[#00ADB5] text-white hover:bg-[#008C94]'}`}
                >
                  &lt;
                </button>
                {Array.from({ length: Math.ceil(sortedPesanan.length / itemsPerPage) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => paginate(index + 1)}
                    className={`px-3 py-1 rounded ${currentPage === index + 1 ? 'bg-[#00ADB5] text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === Math.ceil(sortedPesanan.length / itemsPerPage)}
                  className={`px-3 py-1 rounded ${currentPage === Math.ceil(sortedPesanan.length / itemsPerPage) ? 'bg-gray-300' : 'bg-[#00ADB5] text-white hover:bg-[#008C94]'}`}
                >
                  &gt;
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
