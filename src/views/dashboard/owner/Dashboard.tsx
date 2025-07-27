"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
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

import Sidebar from "../../../components/Sidebar";
import CardStat from "../../../components/CardStat";
import logo from "../../../assets/logo.png";
import ownerService from "../../../data/service/ownerService";
import { useStateContext } from "../../../contexts/ContextsProvider";
import CardManage from "../../../components/CardManage";
import OverviewSection from "../../../components/OverviewCard";
import { Pesanan } from "../../../data/model/Pesanan";
import { updateStatusPesanan } from "../../../data/service/ApiService";
import { getPesanan } from "../../../data/service/pesananService";
// import My_EmployeeTabs from "../../../components/My_EmployeeTabs"; // uncomment if you have this component

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

   const [dateRange, setDateRange] = useState(() => ({
    start: new Date(new Date().setMonth(new Date().getMonth() - 6))
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  }));

   
  

  useEffect(() => {
    const fetchPesanan = async (showLoader = true) => {
      if (showLoader) setLoading(true);
      try {
        const localToken = localStorage.getItem("ACCESS_TOKEN");
        if (!localToken && !token) {
          navigate("/login");
          return;
        }

        if (!user?.id) {
          setError("ID Admin tidak ditemukan");
          if (showLoader) setLoading(false);
          navigate("/login");
          return;
        }

        const data = await getPesanan(Number(user.id));
        setPesanan(data);
        setError("");
      } catch (error: any) {
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
    localStorage.removeItem("ACCESS_TOKEN"); // Hapus token dari localStorage
    localStorage.removeItem("user"); // Hapus data user dari localStorage
    navigate("/login"); // Arahkan ke halaman login
  };
 
   // Pastikan pesanan adalah array sebelum menggunakan filter
    const filteredPesanan = Array.isArray(pesanan)
      ? pesanan.filter((p) => {
          const orderDate = new Date(p.created_at);
          const startDate = new Date(dateRange.start);
          const endDate = new Date(dateRange.end);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          const matchesDate = orderDate >= startDate && orderDate <= endDate;
          const matchesStatus = filterStatus
            ? p.status.toLowerCase() === filterStatus.toLowerCase()
            : true;
          const keyword = searchKeyword.toLowerCase();
          const matchesKeyword =
            p.nama_pelanggan.toLowerCase().includes(keyword) ||
            p.alamat.toLowerCase().includes(keyword) ||
            p.nomor.toLowerCase().includes(keyword) ||
            p.layanan.toLowerCase().includes(keyword);
          return (
            matchesDate &&
            matchesStatus &&
            (searchKeyword ? matchesKeyword : true)
          );
        })
      : [];

      const totalPesanan = Array.isArray(filteredPesanan)
        ? filteredPesanan.length
        : 0;
      const menungguKonfirmasi = Array.isArray(filteredPesanan)
        ? filteredPesanan.filter((p) => p.status === "pending").length
        : 0;
      const dalamProses = Array.isArray(filteredPesanan)
        ? filteredPesanan.filter((p) => p.status === "diproses").length
        : 0;
      const selesai = Array.isArray(filteredPesanan)
        ? filteredPesanan.filter((p) => p.status === "selesai").length
        : 0;
     
    const handleStatusChange = async (
      id: number,
      newStatus: "pending" | "diproses" | "selesai" | "lunas"
    ) => {
      try {
        await updateStatusPesanan(id, newStatus);
        setPesanan((prev) => {
          if (Array.isArray(prev)) {
            return prev.map((item) =>
              item.id === id ? { ...item, status: newStatus } : item
            );
          }
          return [];
        });
      } catch (error: any) {
        alert(error.message || "Gagal mengubah status");
      }
    };
  

  return (
    <div className="flex h-screen bg-gray-100">
      {/* <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} /> */}

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
            onClick={() => setShowOwnerMenu((prev) => !prev)}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <CardStat
              icon={<Icon icon="streamline-cyber:money-bag-1" width={24} />}
              label="Total Pendapatan"
              value={formatCurrency(stats.total_pendapatan)}
              subtitle="Bulan ini"
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
              icon={<Icon icon="stash:user-group-duotone" width={24} />}
              label="Pesanan Baru"
              value={stats.pesanan_by_status.baru.toString()}
              subtitle="Menunggu Proses"
              iconColor="#9929EA"
            />
            <CardStat
              icon={<Icon icon="material-symbols:warning-outline-rounded" width={24} />}
              label="Pesanan Proses"
              value={stats.pesanan_by_status.proses.toString()}
              subtitle="Sedang Dikerjakan"
              iconColor="#EB5B00"
            />
          </div>

          
          
       <div className="flex justify-center flex-wrap gap-6 mt-8">
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
                  Manajemen Pesanan
                </h1>
                <p className="text-gray-500">
                  Kelola semua pesanan laundry pelanggan
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
                        <td className="px-4 py-3">{item.layanan}</td>
                        <td className="px-4 py-3">{item.berat} kg</td>
                        <td className="px-4 py-3">
                          Rp {item.jumlah_harga?.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={item.status}
                            disabled={loading}
                            onChange={(e) =>
                              handleStatusChange(
                                item.id,
                                e.target.value as
                                  | "pending"
                                  | "diproses"
                                  | "selesai"
                              )
                            }
                            className="border px-2 py-1 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            style={{
                              backgroundColor:
                                item.status === "pending"
                                  ? "#FEF3C7"
                                  : item.status === "diproses"
                                  ? "#DBEAFE"
                                  : item.status === "selesai"
                                  ? "#D1FAE5"
                                  : "",
                              borderColor:
                                item.status === "pending"
                                  ? "#F59E0B"
                                  : item.status === "diproses"
                                  ? "#3B82F6"
                                  : item.status === "selesai"
                                  ? "#10B981"
                                  : "",
                              color:
                                item.status === "pending"
                                  ? "#92400E"
                                  : item.status === "diproses"
                                  ? "#1E40AF"
                                  : item.status === "selesai"
                                  ? "#065F46"
                                  : "",
                            }}
                          >
                            <option value="pending">Menunggu</option>
                            <option value="diproses">Proses</option>
                            <option value="selesai">Selesai</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          {new Date(item.created_at).toLocaleDateString(
                            "id-ID",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
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
