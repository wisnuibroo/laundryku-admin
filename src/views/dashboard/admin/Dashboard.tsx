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
import Sidebar from "../../../components/Sidebar";
import CardStat from "../../../components/CardStat";
import logo from "../../../assets/logo.png";
import { getUrl, updateStatusPesanan } from "../../../data/service/ApiService";
import { useStateContext } from "../../../contexts/ContextsProvider";
import { Pesanan } from "../../../data/model/Pesanan";

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
      if (!user?.id_laundry) {
        setError("ID Laundry teu kapanggih");
        setLoading(false);
        return;
      }
      try {
        await getUrl(setPesanan, Number(user.id_laundry));
        setError("");
      } catch (error: any) {
        setError(error.message || "Gagal nyandak data pesanan");
        setPesanan([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPesanan();
  }, [user?.id_laundry]);

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

  const filteredPesanan = pesanan.filter((p) => {
    const orderDate = new Date(p.tanggal_pesanan);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    const matchesDate = orderDate >= startDate && orderDate <= endDate;
    const matchesStatus = filterStatus ? p.status.toLowerCase() === filterStatus.toLowerCase() : true;
    const keyword = searchKeyword.toLowerCase();
    const matchesKeyword =
      p.user?.name.toLowerCase().includes(keyword) ||
      p.alamat.toLowerCase().includes(keyword) ||
      p.catatan.toLowerCase().includes(keyword);
    return matchesDate && matchesStatus && (searchKeyword ? matchesKeyword : true);
  });

const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await updateStatusPesanan(id, newStatus);
      setPesanan((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      if (newStatus === "Selesai") navigate("/tagihan");
    } catch (error: any) {
      alert(error.message || "Gagal mengubah status");
    }
  };

  const totalPesanan = filteredPesanan.length;
  const menungguKonfirmasi = filteredPesanan.filter(
    (p) => p.status === "Menunggu Konfirmasi"
  ).length;
  const dalamProses = filteredPesanan.filter(
    (p) => p.status === "Diproses"
  ).length;
  const selesai = filteredPesanan.filter((p) => p.status === "Selesai").length;

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
      const count = filteredPesanan.filter((p) => {
        const orderDate = new Date(p.tanggal_pesanan);
        return (
          orderDate.getMonth() === currentDate.getMonth() &&
          orderDate.getFullYear() === currentDate.getFullYear()
        );
      }).length;
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
      <h1 className="text-3xl font-bold text-black">Manajemen Pesanan</h1>
      <p className="text-gray-500">Kelola semua pesanan laundry pelanggan</p>
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
      className="bg-[#1f1f1f] hover:bg-[#3d3d3d] text-white px-4 py-2 rounded shadow text-sm font-semibold"
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
            <p>Memuat pesanan...</p>
          </td>
        </tr>
      ) : filteredPesanan.length > 0 ? (
        filteredPesanan.map((item) => (
          <tr key={item.id} className="border-t text-sm">
            <td className="px-4 py-3">ORD-{String(item.id).padStart(3, "0")}</td>
            <td className="px-4 py-3">
              <div className="font-medium">{item.user?.name || "Unknown"}</div>
              <div className="text-gray-500">{item.user?.phone || "-"}</div>
            </td>
            <td className="px-4 py-3">{item.alamat}</td>
            <td className="px-4 py-3">{item.catatan}</td>
            <td className="px-4 py-3">-</td>
            <td className="px-4 py-3">Rp {item.total_harga?.toLocaleString()}</td>
            <td className="px-4 py-3">
              <select
                value={item.status}
                disabled={false}
                onChange={(e) => {}}
                className="border px-2 py-1 rounded text-sm"
              >
                <option value="Menunggu Konfirmasi">Menunggu</option>
                <option value="Diproses">Proses</option>
                <option value="Selesai">Selesai</option>
                <option value="Dikembalikan">Dikembalikan</option>
              </select>
            </td>
            <td className="px-4 py-3">{item.tanggal_pesanan}</td>
            <td className="px-4 py-3">
              <button className="text-gray-500 hover:text-black">...</button>
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
</div>
          </> 
        )}
      </div>
    </div>
  );
}
