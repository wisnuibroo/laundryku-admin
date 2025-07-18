import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { getUrl, updateStatusPesanan,  } from "../../data/service/ApiService";
import { Pesanan } from "../../data/model/Pesanan";
import { Icon } from "@iconify/react";
import Lottie from "lottie-react";
import animasiData from "../../assets/Animation - 1739535831442.json";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../../contexts/ContextsProvider";
import Search from "../../components/search";

export default function PesananPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pesanan, setPesanan] = useState<Pesanan[]>([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const { user } = useStateContext();

  // Form input state
  const [nama, setNama] = useState("");
  const [phone, setPhone] = useState("");
  const [alamat, setAlamat] = useState("");
  const [catatan, setCatatan] = useState("");
  const [totalHarga, setTotalHarga] = useState(0);
  const [jenisPembayaran, setJenisPembayaran] = useState("Tunai");

  // Fetch data
  useEffect(() => {
    const fetchPesanan = async () => {
      if (!user?.id_laundry) {
        setPesanan([]);
        return;
      }
      setLoading(true);
      try {
        await getUrl(setPesanan, Number(user.id_laundry));
      } catch (error: any) {
        alert(error.message || "Gagal mengambil data pesanan");
      } finally {
        setLoading(false);
      }
    };

    fetchPesanan();
  }, [user?.id_laundry]);

  // Filter dan pencarian
  const filteredPesanan = filterStatus
    ? pesanan.filter((p) => p.status.toLowerCase() === filterStatus.toLowerCase())
    : pesanan;

  const searchedPesanan = searchKeyword
    ? filteredPesanan.filter((p) => {
        const keyword = searchKeyword.toLowerCase();
        return (
          p.name?.toLowerCase().includes(keyword) ||
          (p as any).user?.name?.toLowerCase().includes(keyword) ||
          p.phone?.toLowerCase().includes(keyword) ||
          (p as any).user?.phone?.toLowerCase().includes(keyword) ||
          p.alamat?.toLowerCase().includes(keyword)
        );
      })
    : filteredPesanan;

  const sortedPesanan = [...searchedPesanan].sort(
    (a, b) => new Date(b.tanggal_pesanan).getTime() - new Date(a.tanggal_pesanan).getTime()
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const currentItems = sortedPesanan.slice(indexOfLastItem - itemsPerPage, indexOfLastItem);

  const dataPesanan = currentItems.map((item, index) => ({
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
    catatan: item.catatan,
  }));

  const paginate = (page: number) => setCurrentPage(page);

  const handleStatusChange = async (id: number, newStatus: string) => {
    setStatusUpdateLoading(true);
    try {
      await updateStatusPesanan(id, newStatus);
      setPesanan((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      if (newStatus === "Selesai") navigate("/tagihan");
    } catch (error: any) {
      alert(error.message || "Gagal mengubah status");
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1 p-6 overflow-auto">
        <div className="bg-white shadow-md rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-black">Manajemen Pesanan</h1>
              <p className="text-gray-500">Kelola semua pesanan laundry pelanggan</p>
            </div>
          </div>

          <div className="flex justify-between mt-4">
            <div className="flex items-center gap-2 w-full max-w-xl">
              <Search value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
              <div className="relative">
                <button
                  onClick={() => setShowFilter(!showFilter)}
                  className="flex items-center gap-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 text-sm"
                >
                  <Icon icon="mdi:filter-outline" width={18} />
                  Filter
                </button>
                {showFilter && (
                  <div className="absolute mt-2 bg-white border rounded shadow-lg z-10 p-3 w-48">
                    <div className="mb-2 font-semibold text-sm">Filter Status</div>
                    <select
                      className="border rounded px-2 py-1 w-full text-sm"
                      value={filterStatus}
                      onChange={(e) => {
                        setFilterStatus(e.target.value);
                        setShowFilter(false);
                      }}
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

            <button
              onClick={() => setShowModal(true)}
              className="bg-[#00ADB5] hover:bg-[#00AFC5] text-white px-4 py-2 rounded shadow text-sm font-semibold"
            >
              + Pesanan Baru
            </button>
          </div>

          <table className="min-w-full table-auto mt-6">
            <thead className="bg-gray-100 text-gray-700 text-sm">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Pelanggan</th>
                <th className="px-4 py-2 text-left">Alamat</th>
                <th className="px-4 py-2 text-left">Catatan</th>
                <th className="px-4 py-2 text-left">Berat</th>
                <th className="px-4 py-2 text-left">Harga</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Tanggal</th>
                <th className="px-4 py-2 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-10">
                    <div className="w-32 mx-auto">
                      <Lottie animationData={animasiData} loop />
                    </div>
                    <p className="text-gray-500 mt-2">Memuat pesanan...</p>
                  </td>
                </tr>
              ) : dataPesanan.length > 0 ? (
                dataPesanan.map((item) => (
                  <tr key={item.id} className="border-t text-sm">
                    <td className="px-4 py-3">ORD-{String(item.id).padStart(3, "0")}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-gray-500">{item.phone}</div>
                    </td>
                    <td className="px-4 py-3">{item.alamat}</td>
                    <td className="px-4 py-3">{item.catatan}</td>
                    <td className="px-4 py-3">-</td>
                    <td className="px-4 py-3">Rp {item.total_harga?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <select
                        value={item.status}
                        disabled={statusUpdateLoading}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        className="border px-2 py-1 rounded text-sm"
                      >
                        <option value="Menunggu Konfirmasi">Menunggu</option>
                        <option value="Diproses">Proses</option>
                        <option value="Selesai">Selesai</option>
                        <option value="Dikembalikan">Dikembalikan</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">{item.tanggal}</td>
                    <td className="px-4 py-3">
                      <button className="text-gray-500 hover:text-black">
                        <Icon icon="mdi:dots-horizontal" width={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-6 text-gray-500">
                    Tidak ada pesanan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {!loading && dataPesanan.length > 0 && (
            <div className="flex justify-center mt-4 gap-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${
                  currentPage === 1 ? "bg-gray-300" : "bg-[#00ADB5] text-white"
                }`}
              >
                &lt;
              </button>
              {Array.from({ length: Math.ceil(sortedPesanan.length / itemsPerPage) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => paginate(i + 1)}
                  className={`px-3 py-1 rounded ${
                    currentPage === i + 1 ? "bg-[#00ADB5] text-white" : "bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === Math.ceil(sortedPesanan.length / itemsPerPage)}
                className={`px-3 py-1 rounded ${
                  currentPage === Math.ceil(sortedPesanan.length / itemsPerPage)
                    ? "bg-gray-300"
                    : "bg-[#00ADB5] text-white"
                }`}
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Tambah Pesanan */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
              onClick={() => setShowModal(false)}
            >
              <Icon icon="mdi:close" width={20} />
            </button>

            <h2 className="text-xl font-bold mb-4">Tambah Pesanan Baru</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await tambahPesanan({
                    name: nama,
                    phone,
                    alamat,
                    catatan,
                    total_harga: totalHarga,
                    jenis_pembayaran: jenisPembayaran,
                    id_laundry: user?.id_laundry,
                  });
                  alert("Pesanan berhasil ditambahkan!");
                  setShowModal(false);
                  window.location.reload();
                } catch (error: any) {
                  alert(error.message || "Gagal menambahkan pesanan");
                }
              }}
              className="space-y-4"
            >
              <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama" className="w-full border px-3 py-2 rounded" required />
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telepon" className="w-full border px-3 py-2 rounded" required />
              <textarea value={alamat} onChange={(e) => setAlamat(e.target.value)} placeholder="Alamat" className="w-full border px-3 py-2 rounded" required />
              <textarea value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Catatan" className="w-full border px-3 py-2 rounded" />
              <input type="number" value={totalHarga} onChange={(e) => setTotalHarga(parseInt(e.target.value))} placeholder="Total Harga" className="w-full border px-3 py-2 rounded" required />
              <select value={jenisPembayaran} onChange={(e) => setJenisPembayaran(e.target.value)} className="w-full border px-3 py-2 rounded">
                <option value="Tunai">Tunai</option>
                <option value="Transfer">Transfer</option>
              </select>
              <div className="flex justify-end">
                <button type="submit" className="bg-[#00ADB5] hover:bg-[#008B92] text-white px-4 py-2 rounded">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
