"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { Line } from "react-chartjs-2";
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
import DeleteModal from "../../../components/DeleteModal";
import Notification from "../../../components/Notification";
import logo from "../../../assets/logo.png";
import { getUrl, updateStatusPesanan } from "../../../data/service/ApiService";
import { useStateContext } from "../../../contexts/ContextsProvider";
import { Pesanan } from "../../../data/model/Pesanan";
import {
  getPesanan,
  deletePesanan,
} from "../../../data/service/pesananService";
import TambahPesananPopup from "../../../components/TambahPesananPopup";
import EditPesananPopup from "../../../components/EditPesananPopup";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [pesanan, setPesanan] = useState<Pesanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [dateRange, setDateRange] = useState(() => {
    // Default tanpa filter tanggal
    return {
      start: "",  // Kosongkan untuk tidak memfilter tanggal
      end: "",    // Kosongkan untuk tidak memfilter tanggal
    };
  });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    id: 0,
    namaPelanggan: "",
  });
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
  });
  const [showOwnerMenu, setShowOwnerMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPesananId, setEditPesananId] = useState<number | null>(null);
  const navigate = useNavigate();
  const { user, token } = useStateContext();

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
          setError("ID Admin tidak ditemukan");
          if (showLoader) setLoading(false);
          navigate("/login");
          return;
        }

        // Pastikan admin memiliki id_owner
        if (!user.id_owner) {
          setError("ID Owner tidak ditemukan untuk admin ini");
          if (showLoader) setLoading(false);
          return;
        }

        // Gunakan id_owner untuk fetch pesanan
        console.log("Fetching pesanan for admin with owner ID:", user.id_owner);
        const data = await getPesanan(Number(user.id_owner));
        console.log("Fetched pesanan:", data);
        setPesanan(data);
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
  }, [token, navigate, user?.id, user?.id_owner]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newDate = new Date(value);
    const today = new Date();

    if (name === "start" && new Date(value) > new Date(dateRange.end)) {
      alert("Tanggal awal teu tiasa langkung ti tanggal ahir");
      return;
    }
    if (name === "end" && new Date(value) < new Date(dateRange.start)) {
      alert("Tanggal ahir teu tiasa kirang ti tanggal awal");
      return;
    }
    if (newDate > today) {
      alert("Tanggal teu tiasa langkung ti dinten ieu");
      return;
    }

    setDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Pastikan pesanan adalah array sebelum menggunakan filter
  const allowedStatuses = ['pending', 'diproses', 'selesai']; // Hapus status lunas
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

          // Hanya tampilkan pesanan dengan status yang diizinkan
          const matchesAllowedStatus = allowedStatuses.includes(p.status.toLowerCase());

          return matchesStatus && matchesKeyword && matchesAllowedStatus;
        } catch (error) {
          console.error("Error filtering pesanan:", error, p);
          return false;
        }
      })
    : [];

  const handleStatusChange = async (
    id: number,
    newStatus: "pending" | "diproses" | "selesai"
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

  const handleDeletePesanan = (id: number, namaPelanggan: string) => {
    setDeleteModal({
      show: true,
      id,
      namaPelanggan,
    });
  };

  const confirmDeletePesanan = async () => {
    const { id, namaPelanggan } = deleteModal;
    setDeleteModal((prev) => ({ ...prev, show: false }));
    setLoading(true);

    try {
      const success = await deletePesanan(id);
      if (success) {
        setPesanan((prev) => {
          if (Array.isArray(prev)) {
            return prev.filter((item) => item.id !== id);
          }
          return [];
        });
        setNotification({
          show: true,
          message: `Pesanan ${namaPelanggan} berhasil dihapus`,
          type: "success",
        });

        // Auto hide notification after 3 seconds
        setTimeout(() => {
          setNotification((prev) => ({ ...prev, show: false }));
        }, 3000);
      } else {
        throw new Error("Gagal menghapus pesanan");
      }
    } catch (error: any) {
      setNotification({
        show: true,
        message: error.message || "Gagal menghapus pesanan",
        type: "error",
      });

      // Auto hide notification after 3 seconds
      setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const cancelDeletePesanan = () => {
    setDeleteModal({
      show: false,
      id: 0,
      namaPelanggan: "",
    });
  };

  const handleLogout = () => {
    localStorage.clear();
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

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

  const getMonthlyData = () => {
    const months = [];
    const counts = [];
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const month = currentDate.toLocaleString("id-ID", {
        month: "short",
        year: "numeric",
      });
      const count = Array.isArray(filteredPesanan)
        ? filteredPesanan.filter((p) => {
            const orderDate = new Date(p.created_at);
            return (
              orderDate.getMonth() === currentDate.getMonth() &&
              orderDate.getFullYear() === currentDate.getFullYear()
            );
          }).length
        : 0;
      months.push(month);
      counts.push(count);
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return { months, counts };
  };

  const { months, counts } = getMonthlyData();

  const chartData = {
    labels: months,
    datasets: [
      {
        label: "Jumlah Pesanan",
        data: counts,
        fill: false,
        borderColor: "#222831",
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const refreshPesanan = async () => {
    if (user?.id) {
      try {
        const data = await getPesanan(Number(user.id));
        setPesanan(data);
      } catch (error: any) {
        console.error("Error refreshing pesanan:", error);
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      /> */}
      <div className="flex-1 overflow-auto">
        <nav className="sticky top-0 z-10 w-full flex items-center justify-between bg-white px-6 py-6 shadow mb-2">
          <div className="flex items-center gap-2">
            <img
              src={logo}
              alt="Laundry Logo"
              className="w-7 h-7 object-contain"
            />
            <span className="text-lg font-bold text-gray-900">
              Laundry Admin
            </span>
            <span className="ml-2 px-2 py-0.5 bg-green-100 text-xs text-gray-700 rounded">
              Admin Dashboard
            </span>
          </div>
          <div className="flex items-center gap-6">
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
                    {user?.name || "Admin"}
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
          </div>
        </nav>

        {loading ? (
          <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <CardStat
                icon={<Icon icon="solar:box-linear" width={24} />}
                label="Total Pesanan"
                value={totalPesanan.toString()}
                subtitle="Pesanan yang masuk"
                iconColor="#222831"
              />
              <CardStat
                icon={<Icon icon="mdi:clock-outline" width={24} />}
                label="Menunggu Diproses"
                value={menungguKonfirmasi.toString()}
                subtitle="Perlu dikerjakan"
                iconColor="#F2994A"
              />
              <CardStat
                icon={<Icon icon="mdi:progress-clock" width={24} />}
                label="Dalam Proses"
                value={dalamProses.toString()}
                subtitle="Sedang dikerjakan"
                iconColor="#2D9CDB"
              />
              <CardStat
                icon={<Icon icon="mdi:check-circle-outline" width={24} />}
                label="Selesai"
                value={selesai.toString()}
                subtitle="Siap diambil"
                iconColor="#27AE60"
              />
            </div>
            <div className="bg-white shadow-md rounded-lg p-4  border">
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

                <button
                  onClick={() => setShowModal(true)}
                  className="bg-[#1f1f1f] hover:bg-[#3d3d3d] text-white px-4 py-2 rounded shadow text-sm font-semibold"
                >
                  + Pesanan Baru
                </button>

                {/* Modal Tambah Pesanan */}
                {showModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-xl">
                      <TambahPesananPopup
                        isModal={true}
                        onClose={() => setShowModal(false)}
                        onAdded={() => {
                          setShowModal(false);
                          refreshPesanan(); // Gunakan function refresh yang baru
                        }}
                      />
                    </div>
                  </div>
                )}
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
                      <th className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
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
                          <td className="px-4 py-3">{item.layanan}</td>
                          <td className="px-4 py-3">{item.berat || 0} kg</td>
                          <td className="px-4 py-3">
                            Rp {item.jumlah_harga ? Math.round(item.jumlah_harga).toLocaleString() : '0'}
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
                              <option value="pending">Pending</option>
                              <option value="diproses">Proses</option>
                              <option value="selesai">Selesai</option>
                            </select>
                          </td>
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
                          <td className="px-4 py-3">
                            <div className="flex space-x-2">
                              <button
                                className="p-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200"
                                title="Edit Pesanan"
                                onClick={() => {
                                  setEditPesananId(item.id);
                                  setShowEditModal(true);
                                }}
                              >
                                <Icon icon="mdi:pencil" width="18" />
                              </button>
                              <button
                                className="p-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors duration-200"
                                title="Hapus Pesanan"
                                onClick={() =>
                                  handleDeletePesanan(
                                    item.id,
                                    item.nama_pelanggan
                                  )
                                }
                              >
                                <Icon icon="mdi:trash" width="18" />
                              </button>
                            </div>
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
        )}
      </div>

      {/* Modal Konfirmasi Hapus */}
      <DeleteModal
        show={deleteModal.show}
        title="Konfirmasi Hapus Pesanan"
        message={
          <>
            Apakah Anda yakin ingin menghapus pesanan{" "}
            <span className="font-semibold">{deleteModal.namaPelanggan}</span>?
            Tindakan ini tidak dapat dibatalkan.
          </>
        }
        onCancel={cancelDeletePesanan}
        onConfirm={confirmDeletePesanan}
      />

      {/* Modal Edit Pesanan */}
      {showEditModal && editPesananId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xl">
            <EditPesananPopup
              pesananId={editPesananId}
              isModal={true}
              onClose={() => {
                setShowEditModal(false);
                setEditPesananId(null);
              }}
              onUpdated={() => {
                setShowEditModal(false);
                setEditPesananId(null);
                refreshPesanan();
              }}
            />
          </div>
        </div>
      )}

      {/* Notifikasi */}
      <Notification
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={closeNotification}
      />
    </div>
  );
}
