"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import CardStat from "../../../components/CardStat";
import logo from "/logo.png";
import { useStateContext } from "../../../contexts/ContextsProvider";
import CardManage from "../../../components/CardManage";
import { Pesanan } from "../../../data/model/Pesanan";
import { getPesanan } from "../../../data/service/pesananService";
import axiosInstance from "../../../lib/axios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardStats {
  total_pesanan: number;
  total_pendapatan: number;
  pesanan_by_status: {
    baru: number;
    proses: number;
    selesai: number;
    diambil: number;
    dibatalkan: number;
  };
  pesanan_terbaru: any[];
}

export default function OwnerDashboard() {
  const [pesanan, setPesanan] = useState<Pesanan[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const { user, token } = useStateContext();
   const [showOwnerMenu, setShowOwnerMenu] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    total_pesanan: 0,
    total_pendapatan: 0,
    pesanan_by_status: {
      baru: 0,
      proses: 0,
      selesai: 0,
      diambil: 0,
      dibatalkan: 0
    },
    pesanan_terbaru: []
  });

   const [dateRange, setDateRange] = useState(() => {
    // Default tanpa filter tanggal
    return {
      start: "",  // Kosongkan untuk tidak memfilter tanggal
      end: "",    // Kosongkan untuk tidak memfilter tanggal
    };
  });

   
  

  useEffect(() => {
    const fetchPesanan = async (showLoader = true) => {
      if (showLoader) setLoading(true);
      try {
        const localToken = localStorage.getItem("token");
        if (!localToken && !token) {
          navigate("/login");
          return;
        }

        if (!user?.id) {
          setError("ID Owner tidak ditemukan");
          if (showLoader) setLoading(false);
          navigate("/login");
          return;
        }

        // Gunakan ID owner untuk fetch pesanan
        console.log("Fetching pesanan for owner ID:", user.id);
        const data = await getPesanan(Number(user.id));
        console.log("Fetched pesanan:", data);
        setPesanan(data);

        // Fetch total pendapatan dari TagihanLunasPage
        const responseLunas = await axiosInstance.get("/tagihan/siap-ditagih", {
          params: { id_owner: user.id },
        });
        const lunasData = responseLunas.data.data;
        if (Array.isArray(lunasData)) {
          // Filter data untuk pesanan dengan status "lunas"
          const totalPendapatan = lunasData
            .filter((item: any) => item.status === "lunas")
            .reduce((acc: number, item: any) => acc + (parseFloat(item.jumlah_harga) || 0), 0);

          setStats(prevStats => ({
            ...prevStats,
            total_pendapatan: totalPendapatan
          }));
        }

        setError("");
      } catch (error: any) {
        console.error("Error fetching pesanan:", error);
        setError(error.message || "Gagal mengambil data pesanan");
        setPesanan([]);
      } finally {
        if (showLoader) setLoading(false);
      }
    };

    // Fetch pertama (dengan loading)
    fetchPesanan(true);

    // Refresh otomatis tiap 30 detik tanpa loading spinner
    const intervalId = setInterval(() => {
      fetchPesanan(false);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [token, navigate, user?.id]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

 
  const handleLogout = () => {
    localStorage.clear();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Pastikan pesanan adalah array sebelum menggunakan filter
  const allowedStatuses = ['pending', 'diproses', 'selesai']; // Hanya tampilkan status ini
  const filteredPesanan = Array.isArray(pesanan)
    ? pesanan.filter((p) => {
        try {
          // Debug log untuk melihat data yang difilter
          console.log("Filtering pesanan:", p);

          // Validasi tanggal pesanan
          if (!p.created_at) {
            console.log("Pesanan tidak memiliki created_at:", p);
            return false;
          }

          // Parse tanggal dengan benar
          const orderDate = new Date(p.created_at);
          
          // Validasi orderDate
          if (isNaN(orderDate.getTime())) {
            console.log("Invalid order date:", p.created_at);
            return false;
          }

          // Hanya check tanggal jika ada filter tanggal aktif
          if (dateRange.start && dateRange.end) {
            const startDate = new Date(dateRange.start + "T00:00:00");
            const endDate = new Date(dateRange.end + "T23:59:59");

            // Validasi tanggal filter
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
              console.log("Invalid filter dates:", {start: dateRange.start, end: dateRange.end});
              return false;
            }

            const matchesDate = orderDate >= startDate && orderDate <= endDate;
            if (!matchesDate) {
              console.log("Pesanan tidak masuk range tanggal:", {
                orderDate: orderDate.toISOString(),
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
              });
              return false;
            }
          }

          const matchesStatus = filterStatus
            ? p.status.toLowerCase() === filterStatus.toLowerCase()
            : true;

          const keyword = searchKeyword.toLowerCase();
          const matchesKeyword = !searchKeyword || (
            p.nama_pelanggan?.toLowerCase().includes(keyword) ||
            p.alamat?.toLowerCase().includes(keyword) ||
            p.nomor?.toLowerCase().includes(keyword) ||
            p.layanan?.toLowerCase().includes(keyword)
          );

          const matchesAllowedStatus = allowedStatuses.includes(p.status.toLowerCase());

          return matchesStatus && matchesKeyword && matchesAllowedStatus;
        } catch (error) {
          console.error("Error filtering pesanan:", error, p);
          return false;
        }
      })
    : [];

      const totalPesanan = Array.isArray(filteredPesanan)
        ? filteredPesanan.length
        : 0;

      return (
        <div className="flex h-screen bg-gray-100">
          <div className="flex-1 overflow-auto">
            <nav className="sticky top-0 z-10 w-full flex items-center justify-between bg-white px-6 py-6 shadow mb-2">
              <div className="flex items-center gap-2">
                <img src={logo} alt="Laundry Logo" className="w-7 h-7 object-contain" />
                <span className="text-lg font-bold text-gray-900">Laundry Owner</span>
                <span className="ml-2 px-2 py-0.5 bg-green-100 text-xs text-gray-700 rounded">
                  Dashboard
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
                  <Icon icon="mdi:account-circle-outline" width={24} className="text-gray-700" />
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
                      onClick={handleLogout}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <CardStat
                  icon={<Icon icon="streamline-cyber:money-bag-1" width={24} />}
                  label="Total Pendapatan"
                  value={formatCurrency(stats.total_pendapatan)}
                  subtitle="Dari tagihan lunas"
                  iconColor="#06923E"
                />
                <CardStat
                  icon={<Icon icon="solar:box-linear" width={24} />}
                  label="Total Pesanan"
                  value={totalPesanan.toString()}
                  subtitle="Bulan ini"
                  iconColor="#0065F8"
                />
                <CardStat
                  icon={<Icon icon="material-symbols:warning-outline-rounded" width={24} />}
                  label="Tagihan pesanan"
                  value={Array.isArray(pesanan) ? pesanan.filter(p => p.status === "selesai").length.toString() : "0"}
                  subtitle="Belum lunas"
                  iconColor="#EB5B00"
                />
              </div>

          
       <div className="flex gap-6 mt-8">
          <CardManage
            icon="mdi:account-plus"
            title="Kelola Karyawan"
            subtitle="Tambah & kelola tim"
            bgColor="#9B35EC"
            to="/dashboard/owner/kelolakaryawan"
          />
           <CardManage
            icon="uil:chart-bar"
            title="Laporan Keuangan"
            subtitle="Analisis bisnis"
            bgColor="#217ccc"
            to="/dashboard/owner/laporan-keuangan"
          />
           <CardManage
            icon="material-symbols:local-laundry-service"
            title="Daftar Layanan"
            subtitle="Kelola layanan"
            bgColor="#0432b3"
            to="/dashboard/owner/layanan"
          />
          <CardManage
            icon="mdi:credit-card"
            title="Tagihan"
            subtitle="Kelola pembayaran"
            bgColor="#E53935"
            to="/dashboard/owner/tagihan/belum-bayar"
          />
         
          <CardManage
            icon="mdi:check-bold"
            title="Lunas"
            subtitle="Pembayaran"
            bgColor="#43A047"
            to="/dashboard/owner/tagihan/lunas"
          />
        </div>
 
              <div className="bg-white shadow-md rounded-lg p-4  border mt-6">
                 <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-3xl font-bold text-black">
                      Pesanan Terbaru
                    </h1>
                    <p className="text-gray-500">
                      Lihat semua pesanan laundry pelanggan
                    </p>
                  </div>
                </div>
                <div className="flex justify-between mt-4">
                  <div className="flex items-center gap-2 w-full max-w-xl">
                    <input
                      type="text"
                      placeholder="Cari pesanan..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      className="border rounded px-3 py-2 w-full text-sm"
                    />
                    <div className="relative">
                      <button
                        onClick={() => setShowFilter(!showFilter)}
                        className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium transition-all duration-200 shadow-sm"
                      >
                        <Icon icon="mdi:filter-outline" className="w-4 h-4" />
                        <span>Filter</span>
                        <Icon
                          icon={
                            showFilter ? "mdi:chevron-up" : "mdi:chevron-down"
                          }
                          className="w-4 h-4 ml-1"
                        />
                      </button>
                      {showFilter && (
                        <div className="absolute mt-2 bg-white border rounded-md shadow-lg z-10 p-4 w-56 transition-all duration-200 ease-in-out transform origin-top-right">
                          <div className="mb-3 font-semibold text-sm text-gray-700 flex items-center">
                            <Icon
                              icon="mdi:filter-variant"
                              className="w-4 h-4 mr-2 text-blue-500"
                            />
                            Filter Status
                          </div>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200"
                            value={filterStatus}
                            onChange={(e) => {
                              setFilterStatus(e.target.value);
                              setShowFilter(false);
                            }}
                          >
                            <option value="">Semua Status</option>
                            <option value="pending">Menunggu Konfirmasi</option>
                            <option value="diproses">Diproses</option>
                            <option value="selesai">Selesai</option>
                          </select>

                            <div className="mt-4">
                              <button
                                onClick={() => {
                                  setFilterStatus("");
                                  setSearchKeyword("");
                                  setDateRange({ start: "", end: "" });
                                  setShowFilter(false);
                                }}
                                className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium transition-all duration-200"
                              >
                                Reset Filter
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm mt-6">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Pelanggan
                          </th>
                          <th className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Alamat
                          </th>
                          <th className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Layanan
                          </th>
                          <th className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Berat
                          </th>
                          <th className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Harga
                          </th>
                          <th className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tanggal
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                          <tr>
                            <td colSpan={9} className="text-center py-10">
                              <div className="flex flex-col items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
                                <p className="text-gray-500">Memuat pesanan...</p>
                              </div>
                            </td>
                          </tr>
                        ) : error ? (
                          <tr>
                            <td colSpan={9} className="text-center py-10">
                              <div className="flex flex-col items-center justify-center">
                                <Icon icon="mdi:alert-circle-outline" className="w-8 h-8 text-red-500 mb-2" />
                                <p className="text-red-500">{error}</p>
                              </div>
                            </td>
                          </tr>
                        ) : filteredPesanan.length > 0 ? (
                          filteredPesanan.map((item) => (
                            <tr
                              key={item.id}
                              className="hover:bg-gray-50 transition-colors duration-150 ease-in-out"
                            >
                              <td className="px-4 py-3">
                                ORD-{String(item.id).padStart(3, "0")}
                              </td>
                              <td className="px-4 py-3">
                                <div className="font-medium">
                                  {item.nama_pelanggan || "Unknown"}
                                </div>
                                <div className="text-gray-500">{item.nomor}</div>
                              </td>
                              <td className="px-4 py-3">{item.alamat}</td>
                              <td className="px-4 py-3">
                                {typeof item.layanan === 'string' 
                                  ? item.layanan 
                                  : (item.layanan as any)?.nama_layanan || 'Layanan tidak tersedia'
                                }
                              </td>
                              <td className="px-4 py-3">{item.berat || 0} kg</td>
                              <td className="px-4 py-3">
                                Rp {item.jumlah_harga ? Math.round(item.jumlah_harga).toLocaleString() : '0'}
                              </td>
                              <td className="px-4 py-3 capitalize">{item.status}</td>
                              <td className="px-4 py-3">
                                {item.created_at ? (
                                  new Date(item.created_at).toLocaleDateString(
                                    "id-ID",
                                    {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    }
                                  )
                                ) : (
                                  "-"
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={9} className="text-center py-10">
                              <div className="flex flex-col items-center justify-center">
                                <Icon
                                  icon="mdi:package-variant-remove"
                                  width="40"
                                  className="text-gray-400 mb-2"
                                />
                                <p className="text-gray-500 font-medium">
                                  Tidak ada pesanan ditemukan
                                </p>
                                <p className="text-gray-400 text-sm mt-1">
                                  Coba ubah filter atau tambahkan pesanan baru
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
            </div>
              

             
            </div>
          </div>
        </div>
      );
}
