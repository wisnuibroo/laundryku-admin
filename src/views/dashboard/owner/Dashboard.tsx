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
  Legend,
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
  const [dateRange, setDateRange] = useState(() => ({
    start: "",
    end: "",
  }));
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
      dibatalkan: 0,
    },
    pesanan_terbaru: [],
  });
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const getLayananTypeAndDisplay = (item: Pesanan) => {
    // Jika layanan adalah object dengan tipe
    if (typeof item.layanan === "object" && (item.layanan as any)?.tipe) {
      const tipe = (item.layanan as any).tipe;
      if (tipe === "Satuan") {
        return {
          tipe: "Satuan",
          display: `${item.banyak_satuan || 0} item`,
          value: item.banyak_satuan || 0,
        };
      } else {
        return {
          tipe: "Kiloan",
          display: `${item.berat || 0} kg`,
          value: item.berat || 0,
        };
      }
    }

    return {
      tipe: "Kiloan",
      display: `${item.berat || 0} kg`,
      value: item.berat || 0,
    };
  };

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

        console.log("Fetching pesanan for owner ID:", user.id);
        const data = await getPesanan(Number(user.id));
        console.log("Fetched pesanan:", data);
        setPesanan(data);

        const responseLunas = await axiosInstance.get("/tagihan/siap-ditagih", {
          params: { id_owner: user.id },
        });
        const lunasData = responseLunas.data.data;
        if (Array.isArray(lunasData)) {
          const totalPendapatan = lunasData
            .filter((item: any) => item.status === "lunas")
            .reduce(
              (acc: number, item: any) =>
                acc + (parseFloat(item.jumlah_harga) || 0),
              0
            );

          setStats((prevStats) => ({
            ...prevStats,
            total_pendapatan: totalPendapatan,
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

    fetchPesanan(true);

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

  const allowedStatuses = ["pending", "diproses", "selesai"];
  const filteredPesanan = Array.isArray(pesanan)
    ? pesanan.filter((p) => {
        try {
          console.log("Filtering pesanan:", p);

          if (!p.created_at) {
            console.log("Pesanan tidak memiliki created_at:", p);
            return false;
          }

          const orderDate = new Date(p.created_at);

          if (isNaN(orderDate.getTime())) {
            console.log("Invalid order date:", p.created_at);
            return false;
          }

          if (dateRange.start && dateRange.end) {
            const startDate = new Date(dateRange.start + "T00:00:00");
            const endDate = new Date(dateRange.end + "T23:59:59");

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
              console.log("Invalid filter dates:", {
                start: dateRange.start,
                end: dateRange.end,
              });
              return false;
            }

            const matchesDate = orderDate >= startDate && orderDate <= endDate;
            if (!matchesDate) {
              console.log("Pesanan tidak masuk range tanggal:", {
                orderDate: orderDate.toISOString(),
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
              });
              return false;
            }
          }

          const matchesStatus = filterStatus
            ? p.status.toLowerCase() === filterStatus.toLowerCase()
            : true;

          const keyword = searchKeyword.toLowerCase();
          const matchesKeyword =
            !searchKeyword ||
            p.nama_pelanggan?.toLowerCase().includes(keyword) ||
            p.alamat?.toLowerCase().includes(keyword) ||
            p.nomor?.toLowerCase().includes(keyword) ||
            p.layanan?.toLowerCase().includes(keyword);

          const matchesAllowedStatus = allowedStatuses.includes(
            p.status.toLowerCase()
          );

          return matchesStatus && matchesKeyword && matchesAllowedStatus;
        } catch (error) {
          console.error("Error filtering pesanan:", error, p);
          return false;
        }
      })
    : [];

  // Pagination logic
  const totalItems = filteredPesanan.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPesanan = filteredPesanan.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const totalPesanan = Array.isArray(filteredPesanan)
    ? filteredPesanan.length
    : 0;

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 overflow-auto">
        <nav className="sticky top-0 z-10 w-full flex items-center justify-between bg-white px-6 py-6 shadow mb-2">
          <div className="flex items-center gap-2">
            <img
              src={logo}
              alt="Laundry Logo"
              className="w-7 h-7 object-contain"
            />
            <span className="text-lg font-bold text-gray-900">
              Laundry Owner
            </span>
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
              icon={
                <Icon
                  icon="material-symbols:warning-outline-rounded"
                  width={24}
                />
              }
              label="Tagihan pesanan"
              value={
                Array.isArray(pesanan)
                  ? pesanan
                      .filter((p) => p.status === "selesai")
                      .length.toString()
                  : "0"
              }
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
              subtitle="Kelola Tagihan pelanggan"
              bgColor="#E53935"
              to="/dashboard/owner/tagihan/belum-bayar"
            />
          </div>

          <div className="bg-white shadow-md rounded-lg p-4 border mt-6">
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
                      icon={showFilter ? "mdi:chevron-up" : "mdi:chevron-down"}
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
                          setCurrentPage(1); // Reset to first page on filter change
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
                            setCurrentPage(1); // Reset to first page on filter reset
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
                      Kuantitas
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
                      <td colSpan={8} className="text-center py-10">
                        <div className="flex flex-col items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
                          <p className="text-gray-500">Memuat pesanan...</p>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={8} className="text-center py-10">
                        <div className="flex flex-col items-center justify-center">
                          <Icon
                            icon="mdi:alert-circle-outline"
                            className="w-8 h-8 text-red-500 mb-2"
                          />
                          <p className="text-red-500">{error}</p>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedPesanan.length > 0 ? (
                    paginatedPesanan.map((item) => (
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
                          {typeof item.layanan === "string"
                            ? item.layanan
                            : (item.layanan as any)?.nama_layanan ||
                              "Layanan tidak tersedia"}
                        </td>
                        <td className="px-4 py-3">
                          {getLayananTypeAndDisplay(item).display}
                        </td>{" "}
                        <td className="px-4 py-3">
                          Rp{" "}
                          {item.jumlah_harga
                            ? Math.round(item.jumlah_harga).toLocaleString()
                            : "0"}
                        </td>
                        <td className="px-4 py-3 capitalize">{item.status}</td>
                        <td className="px-4 py-3">
                          {item.created_at
                            ? new Date(item.created_at).toLocaleDateString(
                                "id-ID",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )
                            : "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center py-10">
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

            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-600">
                  Menampilkan {startIndex + 1} -{" "}
                  {Math.min(endIndex, totalItems)} dari {totalItems} pesanan
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md text-sm ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    🢀
                  </button>
                  {Array.from({ length: totalPages }, (_, index) => index + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 2 && page <= currentPage + 2)
                    )
                    .map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-full text-sm font-medium flex items-center justify-center transition-all duration-200 ${
                          currentPage === page
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md text-sm ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    🢂
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
