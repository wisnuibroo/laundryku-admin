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
import CardManage from "../../../components/CardManage";
import OverviewSection from "../../../components/OverviewCard";
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

 

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user.id_laundry) {
          throw new Error("ID Laundry tidak ditemukan"),
          console.log('ID Tidak ditemukan')
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
              value={stats.total_pesanan.toString()}
              subtitle="Bulan ini"
              iconColor="#0065F8"
            />
            <CardStat
              icon={<Icon icon="stash:user-group-duotone" width={24} />}
              label="Karyawan Aktif"
              value={stats.total_pelanggan.toString()}
              subtitle="Sedang Bekerja"
              iconColor="#9929EA"
            />
            <CardStat
              icon={<Icon icon="material-symbols:warning-outline-rounded" width={24} />}
              label="Tagihan Pending"
              value={stats.total_pelanggan.toString()}
              subtitle="Rp."
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
            icon="mdi:credit-card"
            title="Tagihan Belum Bayar"
            subtitle="Kelola pembayaran"
            bgColor="#E53935"
          />
          <CardManage
            icon="mdi:check-circle-outline"
            title="Riwayat Pembayaran"
            subtitle="Lihat tagihan lunas"
            bgColor="#43A047"
          />
          <CardManage
            icon="mdi:chart-bar"
            title="Laporan Keuangan"
            subtitle="Analisis bisnis"
            bgColor="#2979FF"
          />
        </div>
 
        <div className="">
          <OverviewSection/>
        </div>
          

         
        </div>
      </div>
    </div>
  );
}
