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
import { getPesanan, deletePesanan } from "../../../data/service/pesananService";
import TambahPesananPopup from "../../../components/TambahPesananPopup";
 

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
  const [dateRange, setDateRange] = useState(() => ({
    start: new Date(new Date().setMonth(new Date().getMonth() - 6))
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  }));
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    id: 0,
    namaPelanggan: ""
  });
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error"
  });
  const navigate = useNavigate();
  const { user } = useStateContext();

  useEffect(() => {
    const fetchPesanan = async () => {
      if (!user?.id) {
        setError("ID Owner tidak ditemukan");
        setLoading(false);
        return;
      }
      try {
        const data = await getPesanan(Number(user.id));
        setPesanan(data);
        setError("");
      } catch (error: any) {
        setError(error.message || "Gagal mengambil data pesanan");
        setPesanan([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPesanan();
  }, [user?.id]);

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
      if (newStatus === "selesai") navigate("/tagihan");
    } catch (error: any) {
      alert(error.message || "Gagal mengubah status");
    }
  };

  const handleDeletePesanan = (id: number, namaPelanggan: string) => {
    setDeleteModal({
      show: true,
      id,
      namaPelanggan
    });
  };

  const confirmDeletePesanan = async () => {
    const { id, namaPelanggan } = deleteModal;
    setDeleteModal(prev => ({ ...prev, show: false }));
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
          type: "success"
        });
        
        // Auto hide notification after 3 seconds
        setTimeout(() => {
          setNotification(prev => ({ ...prev, show: false }));
        }, 3000);
      } else {
        throw new Error("Gagal menghapus pesanan");
      }
    } catch (error: any) {
      setNotification({
        show: true,
        message: error.message || "Gagal menghapus pesanan",
        type: "error"
      });
      
      // Auto hide notification after 3 seconds
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 3000);
    } finally {
      setLoading(false);
    }
  };
  
  const cancelDeletePesanan = () => {
    setDeleteModal({
      show: false,
      id: 0,
      namaPelanggan: ""
    });
  };
  
  const closeNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
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
      <div className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-88px)]">
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
            <div className="flex items-center gap-2">
              <Icon
                icon="mdi:account-circle-outline"
                width={22}
                className="text-gray-700"
              />
              <span className="text-sm text-gray-700">
                {user?.name || "Admin"}
              </span>
            </div>
          </div>
        </nav>

        {loading ? (
          <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <>
            <div className="grid lg:grid-cols-4 gap-6 mt-10">
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

            <div className="bg-white shadow-md rounded-lg p-4 mt-8">
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
                      <Icon icon={showFilter ? "mdi:chevron-up" : "mdi:chevron-down"} className="w-4 h-4 ml-1" />
                    </button>
                    {showFilter && (
                      <div className="absolute mt-2 bg-white border rounded-md shadow-lg z-10 p-4 w-56 transition-all duration-200 ease-in-out transform origin-top-right">
                        <div className="mb-3 font-semibold text-sm text-gray-700 flex items-center">
                          <Icon icon="mdi:filter-variant" className="w-4 h-4 mr-2 text-blue-500" />
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
                    <th className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pelanggan</th>
                    <th className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alamat</th>
                    <th className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Layanan</th>
                    <th className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Berat</th>
                    <th className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                    <th className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
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
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out">
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
                            onChange={(e) => handleStatusChange(item.id, e.target.value as "pending" | "diproses" | "selesai" )}
                            className="border px-2 py-1 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            style={{
                              backgroundColor: 
                                item.status === "pending" ? "#FEF3C7" : 
                                item.status === "diproses" ? "#DBEAFE" : 
                                item.status === "selesai" ? "#D1FAE5" : "",
                              borderColor: 
                                item.status === "pending" ? "#F59E0B" : 
                                item.status === "diproses" ? "#3B82F6" : 
                                item.status === "selesai" ? "#10B981" : "",
                              color: 
                                item.status === "pending" ? "#92400E" : 
                                item.status === "diproses" ? "#1E40AF" : 
                                item.status === "selesai" ? "#065F46" : ""
                            }}
                          >
                            <option value="pending">Menunggu</option>
                            <option value="diproses">Proses</option>
                            <option value="selesai">Selesai</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          {new Date(item.created_at).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <button 
                              className="p-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200"
                              title="Lihat Detail"
                              onClick={() => navigate(`/pesanan/${item.id}`)}
                            >
                              <Icon icon="mdi:eye" width="18" />
                            </button>
                            <button 
                              className="p-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors duration-200"
                              title="Hapus Pesanan"
                              onClick={() => handleDeletePesanan(item.id, item.nama_pelanggan)}
                            >
                              <Icon icon="mdi:trash" width="18" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={9}
                        className="text-center py-10"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <Icon icon="mdi:package-variant-remove" width="40" className="text-gray-400 mb-2" />
                          <p className="text-gray-500 font-medium">Tidak ada pesanan ditemukan</p>
                          <p className="text-gray-400 text-sm mt-1">Coba ubah filter atau tambahkan pesanan baru</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          </>
        )}
      </div>

      {/* Modal Konfirmasi Hapus */}
      <DeleteModal 
        show={deleteModal.show}
        title="Konfirmasi Hapus Pesanan"
        message={
          <>
            Apakah Anda yakin ingin menghapus pesanan <span className="font-semibold">{deleteModal.namaPelanggan}</span>? 
            Tindakan ini tidak dapat dibatalkan.
          </>
        }
        onCancel={cancelDeletePesanan}
        onConfirm={confirmDeletePesanan}
      />

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
