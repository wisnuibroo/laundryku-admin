import { Icon } from "@iconify/react";
import CardStat from "../../../components/CardStat";
import { useState, useEffect } from "react";
import Search from "../../../components/search";
import { useNavigate } from "react-router-dom";
import React from "react";
import axiosInstance from "../../../lib/axios";

// Tipe data
interface Pengeluaran {
  id: number;
  kategori: string;
  jumlah: number;
  keterangan: string;
  tanggal: string;
  created_at: string;
  updated_at: string;
}

interface Stats {
  total_pendapatan: number;
  total_pengeluaran: number;
  laba_bersih: number;
}

export default function PengeluaranPage() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    kategori: "",
    jumlah: "",
    keterangan: "",
    tanggal: new Date().toISOString().split('T')[0]
  });
  
  // Data state
  const [pengeluaran, setPengeluaran] = useState<Pengeluaran[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_pendapatan: 0,
    total_pengeluaran: 0,
    laba_bersih: 0
  });
  
  // Fetch data
  useEffect(() => {
    fetchPengeluaran();
    fetchStats();
  }, []);
  
  const fetchPengeluaran = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get('/pengeluaran');
      if (response.data.status) {
        setPengeluaran(response.data.data);
      } else {
        setError(response.data.message || 'Gagal mengambil data pengeluaran');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mengambil data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get('/laporan-keuangan');
      if (response.data.status) {
        const { total } = response.data.data;
        setStats({
          total_pendapatan: total.pendapatan,
          total_pengeluaran: total.pengeluaran,
          laba_bersih: total.laba
        });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/pengeluaran', formData);
      if (response.data.status) {
        setOpenDialog(false);
        fetchPengeluaran();
        fetchStats();
        setFormData({
          kategori: "",
          jumlah: "",
          keterangan: "",
          tanggal: new Date().toISOString().split('T')[0]
        });
      } else {
        setError(response.data.message || 'Gagal menambahkan pengeluaran');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menambahkan data');
    }
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleFilterClick = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  // Filter pengeluaran berdasarkan pencarian
  const filteredPengeluaran = pengeluaran.filter((item) =>
    item.kategori.toLowerCase().includes(searchText.toLowerCase()) ||
    item.keterangan?.toLowerCase().includes(searchText.toLowerCase()) ||
    item.tanggal.includes(searchText)
  );

  function formatRupiah(number: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number);
  }

  return (
    <div className="flex-1 overflow-auto">
      <nav className="sticky top-0 z-10 w-full flex items-center justify-between bg-white px-6 py-6 shadow mb-2">
        <div className="flex items-center gap-2">
          <Icon icon="material-symbols-light:arrow-back-rounded" className="w-7 h-7 object-contain cursor-pointer" onClick={() => navigate("/dashboard/owner")} />
          <Icon icon="uil:chart-bar" className="w-7 h-7 text-[#0065F8]" />
          <span className="text-lg font-bold text-gray-900">Laporan Keuangan</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon icon="mdi:account-circle-outline" width={22} className="text-gray-700" />
          <span className="text-sm text-gray-700">Owner</span>
        </div>
      </nav>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <CardStat icon={<Icon icon="tdesign:money" width={24} />} label="Total Pendapatan" value={formatRupiah(stats.total_pendapatan)} subtitle="Dari tagihan lunas" iconColor="#06923E" />
          <CardStat icon={<Icon icon="humbleicons:calendar" width={24} />} label="Total Pengeluaran" value={formatRupiah(stats.total_pengeluaran)} subtitle="Operasional & gaji" iconColor="#ED3500" />
          <CardStat icon={<Icon icon="humbleicons:calendar" width={24} />} label="Keuntungan" value={formatRupiah(stats.laba_bersih)} subtitle="Bulan ini" iconColor="#0065F8" />
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => navigate("/dashboard/owner/laporan-keuangan")}
            className="flex items-center gap-2 px-4 py-2 rounded border border-gray-300 bg-white text-black font-semibold shadow">
            <Icon icon="mdi:credit-card-outline" width={18} />Bulanan
          </button>
          <button
            onClick={() => navigate("/dashboard/owner/laporan-pengeluaran")}
            className="flex items-center gap-2 px-4 py-2 rounded bg-red-700 text-white font-semibold shadow">
            <Icon icon="mdi:credit-card-outline" width={18} />Pengeluaran
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow mt-5 border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-6">
            <h3 className="text-3xl font-semibold">Breakdown Pengeluaran</h3>
            
            <div className="flex gap-2">
              <div className="relative">
                <Search value={searchText} onChange={handleSearchChange} />
              </div>
              
              <button
                onClick={() => setOpenDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 transition"
              >
                <Icon icon="ic:sharp-plus" className="w-5 h-5" />
                <span className="font-semibold">Tambah Pengeluaran</span>
              </button>
            </div>
          </div>

          {openDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-md">
                <h2 className="text-xl font-bold mb-4">Tambah Pengeluaran Baru</h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                    <input 
                      type="text" 
                      name="kategori"
                      value={formData.kategori}
                      onChange={handleInputChange}
                      placeholder="Contoh: Gaji Karyawan, Listrik, dll" 
                      className="w-full border p-2 rounded" 
                      required 
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (Rp)</label>
                    <input 
                      type="number" 
                      name="jumlah"
                      value={formData.jumlah}
                      onChange={handleInputChange}
                      placeholder="Jumlah pengeluaran" 
                      className="w-full border p-2 rounded" 
                      required 
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                    <input 
                      type="date" 
                      name="tanggal"
                      value={formData.tanggal}
                      onChange={handleInputChange}
                      className="w-full border p-2 rounded" 
                      required 
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan (Opsional)</label>
                    <textarea 
                      name="keterangan"
                      value={formData.keterangan}
                      onChange={handleInputChange}
                      placeholder="Keterangan tambahan" 
                      className="w-full border p-2 rounded" 
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <button 
                      type="button" 
                      onClick={() => setOpenDialog(false)} 
                      className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Batal
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Tambah Pengeluaran
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8">
              <Icon icon="eos-icons:loading" className="w-8 h-8 mx-auto text-blue-500" />
              <p className="mt-2">Memuat data pengeluaran...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <Icon icon="mdi:alert-circle" className="w-8 h-8 mx-auto" />
              <p className="mt-2">{error}</p>
            </div>
          ) : filteredPengeluaran.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Icon icon="mdi:file-document-outline" className="w-8 h-8 mx-auto" />
              <p className="mt-2">Belum ada data pengeluaran</p>
            </div>
          ) : (
            <div className="space-y-6 mt-6">
              {filteredPengeluaran.map((item) => (
                <div key={item.id} className="border p-4 rounded-lg shadow-sm relative">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-500">Kategori</p>
                      <p className="text-xl text-black font-semibold">{item.kategori}</p>
                      {item.keterangan && (
                        <p className="text-sm text-gray-600 mt-1">{item.keterangan}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pengeluaran</p>
                      <p className="text-red-600 font-semibold">{formatRupiah(item.jumlah)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tanggal</p>
                      <p className="text-gray-800">{new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
