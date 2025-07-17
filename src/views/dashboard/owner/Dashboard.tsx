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
import { getStatistik, StatistikData } from "../../../data/service/ApiService";
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

export default function OwnerDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [stats, setStats] = useState<StatistikData>({
    total_pendapatan: 0,
    total_pesanan: 0,
    total_pelanggan: 0,
    pesanan_per_bulan: [],
    pendapatan_per_bulan: []
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState<Array<{
    id: number;
    name: string;
    email: string;
    phone: string;
    position: string;
    salary: number;
    joinDate: string;
    status: string;
    avatar: string;
  }>>([
    {
      id: 5,
      name: "Rina Wati",
      email: "rina@laundry.com",
      phone: "081234567894",
      position: "Operator Setrika",
      salary: 3200000,
      joinDate: "2023-08-15",
      status: "inactive",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 6,
      name: "Dedi Kurniawan",
      email: "dedi@laundry.com",
      phone: "081234567895",
      position: "Operator Mesin",
      salary: 3500000,
      joinDate: "2023-09-01",
      status: "active",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 7,
      name: "Lina Marlina",
      email: "lina@laundry.com",
      phone: "081234567896",
      position: "Quality Control",
      salary: 3800000,
      joinDate: "2023-10-10",
      status: "active",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 8,
      name: "Rudi Hartono",
      email: "rudi@laundry.com",
      phone: "081234567897",
      position: "Maintenance",
      salary: 4000000,
      joinDate: "2023-11-01",
      status: "active",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]);

  const filteredEmployees = employees.filter((emp) =>
    [emp.name, emp.position, emp.email].some((field) =>
      field.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user.id_laundry) {
          throw new Error("ID Laundry tidak ditemukan");
        }
        const data = await getStatistik(user.id_laundry);
        setStats(data);
        setError("");
      } catch (error: any) {
        setError(error.message || "Gagal mengambil data statistik");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const pesananChartData = {
    labels: stats.pesanan_per_bulan.map((d) => d.bulan),
    datasets: [
      {
        label: "Jumlah Pesanan",
        data: stats.pesanan_per_bulan.map((d) => d.jumlah),
        borderColor: "#222831",
        backgroundColor: "rgba(34, 40, 49, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const pendapatanChartData = {
    labels: stats.pendapatan_per_bulan.map((d) => d.bulan),
    datasets: [
      {
        label: "Pendapatan (Rp)",
        data: stats.pendapatan_per_bulan.map((d) => d.jumlah),
        borderColor: "#00ADB5",
        backgroundColor: "rgba(0, 173, 181, 0.1)",
        tension: 0.4,
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
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#222831]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <Icon icon="material-symbols:error" className="text-4xl mb-2" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 overflow-auto">
        <nav className="sticky top-0 z-10 w-full flex items-center justify-between bg-white px-6 py-6 shadow mb-2">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Laundry Logo" className="w-7 h-7 object-contain" />
            <span className="text-lg font-bold text-gray-900">Laundry Owner</span>
            <span className="ml-2 px-2 py-0.5 bg-green-100 text-xs text-gray-700 rounded">
              Dashboard
            </span>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-gray-500 hover:text-gray-700">
              <Icon icon="mdi:bell-outline" width={22} />
            </button>
            <div className="flex items-center gap-2">
              <Icon icon="mdi:account-circle-outline" width={22} className="text-gray-700" />
              <span className="text-sm text-gray-700">Owner</span>
            </div>
          </div>
        </nav>

        <div className="p-6">
          {/* Statistik */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <CardStat
              icon={<Icon icon="streamline-cyber:money-bag-1" width={24} />}
              label="Total Pendapatan"
              value={formatCurrency(stats.total_pendapatan)}
              subtitle="Bulan ini"
              iconColor="#222831"
            />
            <CardStat
              icon={<Icon icon="solar:box-linear" width={24} />}
              label="Total Pesanan"
              value={stats.total_pesanan.toString()}
              subtitle="Bulan ini"
              iconColor="#222831"
            />
            <CardStat
              icon={<Icon icon="stash:user-group-duotone" width={24} />}
              label="Total Pelanggan"
              value={stats.total_pelanggan.toString()}
              subtitle="Pelanggan Aktif"
              iconColor="#222831"
            />
          </div>

          {/* Grafik */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Tren Pesanan</h3>
              <Line data={pesananChartData} options={chartOptions} />
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Tren Pendapatan</h3>
              <Line data={pendapatanChartData} options={chartOptions} />
            </div>
          </div>

          {/* Manajemen Karyawan */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Manajemen Karyawan</h3>
            <input
              type="text"
              placeholder="Cari nama, posisi, atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full mb-4 px-4 py-2 border rounded"
            />

            <ul className="space-y-2">
              {filteredEmployees.map((emp) => (
                <li
                  key={emp.id}
                  className="flex justify-between items-center p-4 border rounded hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-semibold">{emp.name}</p>
                      <p className="text-sm text-gray-500">{emp.position}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-gray-700">{emp.email}</p>
                    <p className={`font-medium ${emp.status === "active" ? "text-green-600" : "text-red-500"}`}>
                      {emp.status}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
