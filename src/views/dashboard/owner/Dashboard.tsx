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
  const [isRefreshing, setIsRefreshing] = useState(false);
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
  // Grouping states
  const [openCustomerId, setOpenCustomerId] = useState<string | null>(null);
  // Photo modal states
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
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

  // Group orders by customer name
  const groupOrdersByCustomer = (orders: Pesanan[]) => {
    const grouped = orders.reduce((acc: any, order) => {
      const customerKey = `${order.nama_pelanggan}_${order.nomor}`;
      if (!acc[customerKey]) {
        acc[customerKey] = {
          customerName: order.nama_pelanggan,
          customerPhone: order.nomor,
          orders: [],
          totalOrders: 0,
          totalAmount: 0,
        };
      }
      acc[customerKey].orders.push(order);
      acc[customerKey].totalOrders += 1;
      acc[customerKey].totalAmount += order.jumlah_harga || 0;
      return acc;
    }, {});

    return Object.values(grouped);
  };

  const toggleCustomerRow = (customerKey: string) => {
    setOpenCustomerId(openCustomerId === customerKey ? null : customerKey);
  };

  // Photo modal functions
  const openPhotoModal = (photoUrl: string) => {
    setSelectedPhoto(photoUrl);
    setShowPhotoModal(true);
  };

  const closePhotoModal = () => {
    setShowPhotoModal(false);
    setSelectedPhoto(null);
  };

  // Helper function to get full photo URL
  const getPhotoUrl = (lampiran: string | undefined) => {
    if (!lampiran) return null;
    // If it's already a full URL, return as is
    if (lampiran.startsWith('http')) return lampiran;
    // Otherwise, construct the full URL
    return `https://laundryku.rplrus.com/storage/${lampiran}`;
  };

  useEffect(() => {
    const fetchPesanan = async (showLoader = true) => {
      if (showLoader) setLoading(true);
      if (!showLoader) setIsRefreshing(true);
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
          // Get current month and year
          const currentDate = new Date();
          const currentMonth = currentDate.getMonth();
          const currentYear = currentDate.getFullYear();

          const totalPendapatan = lunasData
            .filter((item: any) => {
              if (item.status !== "lunas") return false;
              
              // Filter by current month and year
              const itemDate = new Date(item.updated_at || item.created_at);
              return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
            })
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
        if (!showLoader) setIsRefreshing(false);
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

  // Group orders by customer
  const groupedOrders = groupOrdersByCustomer(filteredPesanan);
  
  // Pagination logic for grouped data
  const totalItems = groupedOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedGroupedOrders = groupedOrders.slice(startIndex, endIndex);

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
          {/* Auto-refresh indicator */}
          {isRefreshing && (
            <div className="flex items-center justify-center mb-4 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <Icon icon="eos-icons:loading" className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm text-blue-600">Memperbarui data...</span>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <CardStat
              icon={<Icon icon="streamline-cyber:money-bag-1" width={24} />}
              label="Total Pendapatan"
              value={formatCurrency(stats.total_pendapatan)}
              subtitle={`Bulan ${new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" })}`}
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
              icon="material-symbols:local-laundry-service"
              title="Daftar Layanan"
              subtitle="Kelola layanan"
              bgColor="#0432b3"
              to="/dashboard/owner/layanan"
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
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    <p className="text-gray-600">Memuat pesanan...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex justify-center items-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <Icon
                      icon="mdi:alert-circle-outline"
                      className="w-12 h-12 text-red-500"
                    />
                    <p className="text-red-500">{error}</p>
                  </div>
                </div>
              ) : paginatedGroupedOrders.length > 0 ? (
                <div className="space-y-3 p-4">
                  {paginatedGroupedOrders.map((customerGroup: any) => {
                    const customerKey = `${customerGroup.customerName}_${customerGroup.customerPhone}`;
                    const isExpanded = openCustomerId === customerKey;
                    
                    return (
                      <div
                        key={customerKey}
                        className="bg-white rounded-lg border hover:shadow-sm transition-shadow"
                      >
                        {/* Customer Header */}
                        <div
                          className="bg-blue-50 border-l-4 border-blue-400 p-4 cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => toggleCustomerRow(customerKey)}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                              <div className="bg-blue-100 p-2 rounded-full">
                                <Icon
                                  icon="mdi:account-circle"
                                  className="w-6 h-6 text-blue-500"
                                />
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-800">
                                  {customerGroup.customerName}
                                </h3>
                                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                  <div className="flex items-center gap-1">
                                    <Icon icon="mdi:phone" className="w-3 h-3" />
                                    <span>{customerGroup.customerPhone}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Icon
                                      icon="mdi:package-variant"
                                      className="w-3 h-3"
                                    />
                                    <span>{customerGroup.totalOrders} pesanan</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <div className="text-right">
                                <div className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
                                  Rp {customerGroup.totalAmount.toLocaleString("id-ID")}
                                </div>
                              </div>

                              <button className="text-gray-400 hover:text-gray-600 p-1 transition-colors">
                                <Icon
                                  icon={
                                    isExpanded
                                      ? "mdi:chevron-up"
                                      : "mdi:chevron-down"
                                  }
                                  className="w-4 h-4"
                                />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="border-t bg-gray-50">
                            <div className="p-4">
                              <h4 className="text-gray-700 mb-3 flex items-center gap-2">
                                <Icon
                                  icon="mdi:format-list-bulleted"
                                  className="w-4 h-4"
                                />
                                Detail Pesanan ({customerGroup.orders.length})
                              </h4>
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ID
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Alamat
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Layanan
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Bukti
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Kuantitas
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Harga
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tanggal
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {customerGroup.orders.map((item: Pesanan) => (
                                      <tr
                                        key={item.id}
                                        className="hover:bg-gray-50 transition-colors duration-150 ease-in-out"
                                      >
                                        <td className="px-3 py-2">
                                          ORD-{String(item.id).padStart(3, "0")}
                                        </td>
                                        <td className="px-3 py-2">{item.alamat}</td>
                                        <td className="px-3 py-2">
                                          {typeof item.layanan === "string"
                                            ? item.layanan
                                            : (item.layanan as any)?.nama_layanan ||
                                              "Layanan tidak tersedia"}
                                        </td>
                                        <td className="px-3 py-2">
                                          {(item as any).lampiran ? (
                                            <button
                                              onClick={() => openPhotoModal(getPhotoUrl((item as any).lampiran)!)}
                                              className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200 text-xs"
                                              title="Lihat Bukti"
                                            >
                                              <Icon icon="mdi:image" width="14" />
                                              Lihat
                                            </button>
                                          ) : (
                                            <span className="text-gray-400 text-xs">Tidak ada</span>
                                          )}
                                        </td>
                                        <td className="px-3 py-2">
                                          {getLayananTypeAndDisplay(item).display}
                                        </td>
                                        <td className="px-3 py-2">
                                          Rp{" "}
                                          {item.jumlah_harga
                                            ? Math.round(item.jumlah_harga).toLocaleString()
                                            : "0"}
                                        </td>
                                        <td className="px-3 py-2 capitalize">{item.status}</td>
                                        <td className="px-3 py-2">
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
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              {/* Summary Section */}
                              <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <Icon
                                      icon="mdi:calculator"
                                      className="w-4 h-4 text-blue-500"
                                    />
                                    <span className="text-blue-700">
                                      Total Pesanan
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xl text-blue-600">
                                      Rp{" "}
                                      {customerGroup.totalAmount.toLocaleString("id-ID")}
                                    </p>
                                    <p className="text-sm text-blue-500">
                                      {customerGroup.totalOrders} pesanan
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex justify-center items-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <Icon
                      icon="mdi:package-variant-remove"
                      width="40"
                      className="text-gray-400"
                    />
                    <p className="text-gray-500 font-medium">
                      Tidak ada pesanan ditemukan
                    </p>
                    <p className="text-gray-400 text-sm">
                      Coba ubah filter atau tambahkan pesanan baru
                    </p>
                  </div>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-600">
                  Menampilkan {startIndex + 1} -{" "}
                  {Math.min(endIndex, totalItems)} dari {totalItems} pelanggan
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

      {/* Photo Modal */}
      {showPhotoModal && selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Bukti Pesanan</h3>
              <button
                onClick={closePhotoModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Icon icon="mdi:close" width="24" />
              </button>
            </div>
            <div className="p-4">
              <div className="flex justify-center">
                {selectedPhoto.toLowerCase().includes('.pdf') ? (
                  <div className="text-center">
                    <Icon icon="mdi:file-pdf-box" width="64" className="text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">File PDF - Klik untuk membuka</p>
                    <a
                      href={selectedPhoto}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                      <Icon icon="mdi:open-in-new" width="16" />
                      Buka PDF
                    </a>
                  </div>
                ) : (
                  <img
                    src={selectedPhoto}
                    alt="Bukti Pesanan"
                    className="max-w-full max-h-[70vh] object-contain rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="text-center p-8">
                            <div class="text-gray-400 mb-4">
                              <svg class="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path>
                              </svg>
                            </div>
                            <p class="text-gray-500">Gagal memuat gambar</p>
                            <a href="${selectedPhoto}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
                              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path>
                                <path d="M5 5a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2v-2a1 1 0 10-2 0v2H5V7h2a1 1 0 000-2H5z"></path>
                              </svg>
                              Buka di tab baru
                            </a>
                          </div>
                        `;
                      }
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
