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
import { getUrl } from "../../../data/service/ApiService";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pesanan, setPesanan] = useState<Pesanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [dateRange, setDateRange] = useState(() => ({
    start: new Date(new Date().setMonth(new Date().getMonth() - 6))
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  }));
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
    return orderDate >= startDate && orderDate <= endDate;
  });

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
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div className="flex-1">
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
        <div className="p-6 overflow-y-auto max-h-[calc(100vh-88px)]">
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
                  subtitle="Periode ini"
                  iconColor="#222831"
                />
                <CardStat
                  icon={<Icon icon="mdi:clock-outline" width={24} />}
                  label="Menunggu Konfirmasi"
                  value={menungguKonfirmasi.toString()}
                  subtitle="Perlu diproses"
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

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 shadow rounded-lg">
                  <h2 className="text-black-500 text-lg font-semibold mb-4">
                    Trend Pesanan
                  </h2>
                  <Line data={chartData} options={chartOptions} />
                </div>

                <div className="bg-white p-6 shadow rounded-lg">
                  <h2 className="text-black-500 text-lg font-semibold mb-4">
                    Transaksi Terbaru
                  </h2>
                  {filteredPesanan.length > 0 ? (
                    filteredPesanan.slice(0, 5).map((item, index) => (
                      <div
                        key={index}
                        className="mt-4 p-4 bg-gray-50 rounded-lg flex justify-between hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <div>
                          <p className="font-semibold">
                            {item.user?.name || "Unknown"}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {item.user?.phone || "-"}
                          </p>
                        </div>
                        <p className="text-gray-500 text-sm max-w-[200px] truncate">
                          {item.alamat}
                        </p>
                        <div className="pr-3 rounded-lg flex flex-col items-end">
                          <p className="text-gray-600">
                            {new Date(item.tanggal_pesanan).toLocaleDateString(
                              "id-ID"
                            )}
                          </p>
                          <p className="text-gray-600">
                            Rp. {item.total_harga?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <Icon
                        icon="mdi:inbox-outline"
                        className="mx-auto mb-2"
                        width={48}
                      />
                      <p>Belum ada transaksi untuk periode ini</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
