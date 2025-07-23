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
import logo from "../../../assets/logo.png";
import { getUrl, updateStatusPesanan } from "../../../data/service/ApiService";
import { useStateContext } from "../../../contexts/ContextsProvider";
import { Pesanan } from "../../../data/model/Pesanan";
import TambahPesananPage from "../../pesanan/TambahPesananPage";
import { getPesanan } from "../../../data/service/pesananService";

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
    newStatus: "pending" | "diproses" | "selesai" | "dikembalikan"
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
            <div className="flex items-center gap-4">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, start: e.target.value }))
                }
                className="px-2 py-1 border rounded text-sm"
              />
              <span className="text-gray-500">-</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, end: e.target.value }))
                }
                className="px-2 py-1 border rounded text-sm"
              />
            </div>
            <button className="text-gray-500 hover:text-gray-700">
              <Icon icon="mdi:bell-outline" width={22} />
            </button>
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
                subtitle="Bulan ini"
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

            <div className="bg-white shadow-md rounded-lg p-4">
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
                      className="flex items-center gap-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 text-sm"
                    >
                      Filter
                    </button>
                    {showFilter && (
                      <div className="absolute mt-2 bg-white border rounded shadow-lg z-10 p-3 w-48">
                        <div className="mb-2 font-semibold text-sm">
                          Filter Status
                        </div>
                        <select
                          className="border rounded px-2 py-1 w-full text-sm"
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
                          <option value="dikembalikan">Dikembalikan</option>
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
                      <TambahPesananPage
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

              <table className="min-w-full table-auto mt-6">
                <thead className="bg-gray-100 text-gray-700 text-sm">
                  <tr>
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Pelanggan</th>
                    <th className="px-4 py-2 text-left">Alamat</th>
                    <th className="px-4 py-2 text-left">Layanan</th>
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
                        <p>Memuat pesanan...</p>
                      </td>
                    </tr>
                  ) : filteredPesanan.length > 0 ? (
                    filteredPesanan.map((item) => (
                      <tr key={item.id} className="border-t text-sm">
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
                        <td className="px-4 py-3">{item.status}</td>
                        <td className="px-4 py-3">
                          {new Date(item.created_at).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={item.status}
                            disabled={false}
                            onChange={(e) => {}}
                            className="border px-2 py-1 rounded text-sm"
                          >
                            <option value="pending">Menunggu</option>
                            <option value="diproses">Proses</option>
                            <option value="selesai">Selesai</option>
                            <option value="dikembalikan">Dikembalikan</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={9}
                        className="text-center py-6 text-gray-500"
                      >
                        Tidak ada pesanan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
