import { Icon } from "@iconify/react";
import CardStat from "../../../components/CardStat";
import { useState, useEffect } from "react";
import Search from "../../../components/search";
import { useNavigate } from "react-router-dom";
import React from "react";
import axiosInstance from "../../../lib/axios";
import { useStateContext } from "../../../contexts/ContextsProvider";

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

interface MonthlyData {
  month: number;
  year: number;
  monthName: string;
  totalPengeluaran: number;
  pengeluaranList: Pengeluaran[];
}

export default function PengeluaranPage() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOwnerMenu, setShowOwnerMenu] = useState(false);
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useStateContext();

  // Get current year
  const currentYear = new Date().getFullYear();

  // Form state
  const [formData, setFormData] = useState({
    kategori: "",
    jumlah: "",
    keterangan: "",
    tanggal: new Date().toISOString().split("T")[0],
  });

  // Data state
  const [pengeluaran, setPengeluaran] = useState<Pengeluaran[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_pendapatan: 0,
    total_pengeluaran: 0,
    laba_bersih: 0,
  });

  // Fetch data
  useEffect(() => {
    fetchPengeluaran(true);
    fetchStats();
    
    // Auto-refresh every 30 seconds
    const intervalId = setInterval(() => {
      fetchPengeluaran(false);
      fetchStats();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (pengeluaran.length > 0) {
      processMonthlyData();
    }
  }, [pengeluaran]);

  const fetchPengeluaran = async (showLoader = true) => {
    try {
      if (showLoader) setIsLoading(true);
      if (!showLoader) setIsRefreshing(true);
      const response = await axiosInstance.get("/pengeluaran");
      if (response.data.status) {
        setPengeluaran(response.data.data);
      } else {
        setError(response.data.message || "Gagal mengambil data pengeluaran");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mengambil data");
    } finally {
      if (showLoader) setIsLoading(false);
      if (!showLoader) setIsRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get(
        `/laporan-keuangan?tahun=${currentYear}`
      );
      if (response.data.status) {
        const { total } = response.data.data;
        setStats({
          total_pendapatan: total.pendapatan,
          total_pengeluaran: total.pengeluaran,
          laba_bersih: total.laba,
        });
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const processMonthlyData = () => {
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    const monthlyStats: { [key: number]: MonthlyData } = {};

    // Filter and group pengeluaran by month for current year
    pengeluaran
      .filter((item) => {
        const itemDate = new Date(item.tanggal);
        return itemDate.getFullYear() === currentYear;
      })
      .forEach((item) => {
        const itemDate = new Date(item.tanggal);
        const monthIndex = itemDate.getMonth();

        // Only create month entry if it has data
        if (!monthlyStats[monthIndex]) {
          monthlyStats[monthIndex] = {
            month: monthIndex,
            year: currentYear,
            monthName: months[monthIndex],
            totalPengeluaran: 0,
            pengeluaranList: [],
          };
        }

        monthlyStats[monthIndex].totalPengeluaran += Number(item.jumlah) || 0;
        monthlyStats[monthIndex].pengeluaranList.push(item);
      });

    // Only show months that have data
    const monthlyArray = Object.values(monthlyStats).sort(
      (a, b) => a.month - b.month
    );
    setMonthlyData(monthlyArray);
  };



const handleInputChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => {
  const { name, value } = e.target;

  if (name === "jumlah") {
    // Hapus semua karakter non-digit
    const rawValue = value.replace(/\D/g, "");
    // Format dengan titik ribuan
    const formattedValue = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  } else {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
};


 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const payload = {
      ...formData,
      jumlah: formData.jumlah.replace(/\./g, ""), // kirim tanpa titik
    };

    const response = await axiosInstance.post("/pengeluaran", payload);
    if (response.data.status) {
      setOpenDialog(false);
      fetchPengeluaran(false);
      fetchStats();
      setFormData({
        kategori: "",
        jumlah: "",
        keterangan: "",
        tanggal: new Date().toISOString().split("T")[0],
      });
    } else {
      setError(response.data.message || "Gagal menambahkan pengeluaran");
    }
  } catch (err: any) {
    setError(err.message || "Terjadi kesalahan saat menambahkan data");
  }
};


  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };


  const getFilteredPengeluaranForMonth = (monthData: MonthlyData) => {
    return monthData.pengeluaranList.filter(
      (item) =>
        item.kategori.toLowerCase().includes(searchText.toLowerCase()) ||
        item.keterangan?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.tanggal.includes(searchText)
    );
  };


  const getFilteredMonthlyData = () => {
    if (!searchText.trim()) {
      return monthlyData;
    }

    return monthlyData
      .map((monthData) => {
        const filteredPengeluaran = getFilteredPengeluaranForMonth(monthData);
        const totalFiltered = filteredPengeluaran.reduce(
          (sum, item) => sum + (Number(item.jumlah) || 0),
          0
        );

        return {
          ...monthData,
          pengeluaranList: filteredPengeluaran,
          totalPengeluaran: totalFiltered,
        };
      })
      .filter((monthData) => monthData.pengeluaranList.length > 0); // Hanya tampilkan bulan yang ada hasil
  };

  function formatRupiah(number: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number);
  }

  const toggleMonthExpansion = (monthIndex: number) => {
    setExpandedMonth(expandedMonth === monthIndex ? null : monthIndex);
  };

  

  return (
    <div className="flex-1 overflow-auto">
      <nav className="sticky top-0 z-10 w-full flex items-center justify-between bg-white px-6 py-6 shadow mb-2">
        <div className="flex items-center gap-2">
          <Icon
            icon="material-symbols-light:arrow-back-rounded"
            className="w-7 h-7 object-contain cursor-pointer"
            onClick={() => navigate("/dashboard/owner")}
          />
          <Icon icon="uil:chart-bar" className="w-7 h-7 text-[#ED3500]" />
          <span className="text-lg font-bold text-gray-900">
            Laporan Keuangan
          </span>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowOwnerMenu(!showOwnerMenu)}
            className="flex items-center gap-2 focus:outline-none rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-100 transition-colors"
            aria-haspopup="true"
            aria-expanded={showOwnerMenu}
            aria-label="User menu"
          >
            <Icon
              icon="mdi:account-circle-outline"
              width={24}
              className="text-gray-700"
            />
            <span className="text-sm font-semibold text-gray-700">
              {user?.nama_laundry || "Owner"}
            </span>
            <Icon
              icon={showOwnerMenu ? "mdi:chevron-up" : "mdi:chevron-down"}
              width={20}
              className="text-gray-500"
            />
          </button>

          {showOwnerMenu && (
            <div
              className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg z-50 border border-gray-200"
              role="menu"
              aria-orientation="vertical"
              aria-label="User menu"
            >
              <button
                onClick={() => {
                  localStorage.clear();
                  navigate("/login");
                }}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100 rounded-md transition-colors"
                role="menuitem"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="p-6">
        {/* Auto-refresh indicator */}
        {isRefreshing && (
          <div className="flex items-center justify-center mb-4 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <Icon icon="eos-icons:loading" className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-sm text-blue-600">Memperbarui data pengeluaran...</span>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <CardStat
            icon={<Icon icon="tdesign:money" width={24} />}
            label="Total Pendapatan"
            value={formatRupiah(stats.total_pendapatan)}
            subtitle={`Tahun ${currentYear}`}
            iconColor="#06923E"
          />
          <CardStat
            icon={<Icon icon="humbleicons:calendar" width={24} />}
            label="Total Pengeluaran"
            value={formatRupiah(stats.total_pengeluaran)}
            subtitle={`Tahun ${currentYear}`}
            iconColor="#ED3500"
          />
          <CardStat
            icon={<Icon icon="humbleicons:calendar" width={24} />}
            label="Keuntungan"
            value={formatRupiah(stats.laba_bersih)}
            subtitle={`Tahun ${currentYear}`}
            iconColor="#0065F8"
          />
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => navigate("/dashboard/owner/laporan-keuangan")}
            className="flex items-center gap-2 px-4 py-2 rounded border border-gray-300 bg-white text-black font-semibold shadow"
          >
            <Icon icon="mdi:credit-card-outline" width={18} />
            Statistik
          </button>
          <button
            onClick={() => navigate("/dashboard/owner/laporan-pengeluaran")}
            className="flex items-center gap-2 px-4 py-2 rounded bg-red-700 text-white font-semibold shadow"
          >
            <Icon icon="mdi:credit-card-outline" width={18} />
            Pengeluaran
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
                <h2 className="text-xl font-bold mb-4">
                  Tambah Pengeluaran Baru
                </h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kategori
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jumlah (Rp)
                    </label>
                    <input
                      type="text"
                      name="jumlah"
                      value={formData.jumlah}
                      onChange={handleInputChange}
                      placeholder="Jumlah pengeluaran"
                      className="w-full border p-2 rounded"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Keterangan (Opsional)
                    </label>
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
              <Icon
                icon="eos-icons:loading"
                className="w-8 h-8 mx-auto text-blue-500"
              />
              <p className="mt-2">Memuat data pengeluaran...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <Icon icon="mdi:alert-circle" className="w-8 h-8 mx-auto" />
              <p className="mt-2">{error}</p>
            </div>
          ) : getFilteredMonthlyData().length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Icon
                icon="mdi:file-document-outline"
                className="w-8 h-8 mx-auto"
              />
              <p className="mt-2">
                {searchText
                  ? `Tidak ada pengeluaran yang cocok dengan pencarian "${searchText}" untuk tahun ${currentYear}`
                  : `Belum ada data pengeluaran untuk tahun ${currentYear}`}
              </p>
            </div>
          ) : (
            <div className="space-y-4 mt-6">
              {getFilteredMonthlyData().map((monthData) => (
                <div
                  key={monthData.month}
                  className="border rounded-lg shadow-sm overflow-hidden"
                >
                  {/* Monthly Header */}
                  <div
                    className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleMonthExpansion(monthData.month)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Icon
                          icon={
                            expandedMonth === monthData.month
                              ? "mdi:chevron-down"
                              : "mdi:chevron-right"
                          }
                          className="w-5 h-5 text-gray-600"
                        />
                        <h4 className="text-lg font-semibold text-gray-800">
                          {monthData.monthName} {monthData.year}
                        </h4>
                        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">
                          {monthData.pengeluaranList.length} pengeluaran
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-red-600">
                          {formatRupiah(monthData.totalPengeluaran)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Details */}
                  {expandedMonth === monthData.month && (
                    <div className="p-4 bg-white">
                      {monthData.pengeluaranList.length === 0 ? (
                        <div className="text-center py-6 text-gray-500">
                          <Icon
                            icon="mdi:file-document-outline"
                            className="w-6 h-6 mx-auto mb-2"
                          />
                          <p>
                            {searchText
                              ? `Tidak ada pengeluaran yang cocok dengan pencarian "${searchText}"`
                              : `Tidak ada pengeluaran di bulan ${monthData.monthName}`}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {monthData.pengeluaranList.map((item) => (
                            <div
                              key={item.id}
                              className="border border-gray-200 p-3 rounded-lg bg-gray-50"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    Kategori
                                  </p>
                                  <p className="font-semibold text-gray-800">
                                    {item.kategori}
                                  </p>
                                  {item.keterangan && (
                                    <p className="text-sm text-gray-600 mt-1">
                                      {item.keterangan}
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">
                                    Pengeluaran
                                  </p>
                                  <p className="text-red-600 font-semibold">
                                    {formatRupiah(item.jumlah)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">
                                    Tanggal
                                  </p>
                                  <p className="text-gray-800">
                                    {new Date(item.tanggal).toLocaleDateString(
                                      "id-ID",
                                      {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                      }
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
