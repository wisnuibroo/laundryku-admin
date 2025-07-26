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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

 

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Cek token dari localStorage
        const localToken = localStorage.getItem('ACCESS_TOKEN');
        if (!localToken && !token) {
          navigate('/login');
          return;
        }
        
        // Gunakan token dari localStorage jika token dari context tidak ada
        if (!token && localToken) {
          console.log('Using token from localStorage');
        }
        
        const data = await ownerService.getDashboardStats();
        setStats(data);
        setError("");
      } catch (error: any) {
        console.error('Error fetching dashboard stats:', error);
        setError(error.message || "Gagal mengambil data statistik");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    
    // Tambahkan interval untuk refresh data setiap 30 detik
    const intervalId = setInterval(() => {
      fetchData();
    }, 30000);
    
    // Cleanup interval saat komponen unmount
    return () => clearInterval(intervalId);
  }, [token, navigate]);

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
              value={stats.total_pesanan.toString()}
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
 
        
          

         
        </div>
      </div>
    </div>
  );
}
