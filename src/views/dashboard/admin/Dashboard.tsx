import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import Sidebar from "../../../components/Sidebar";
import CardStat from "../../../components/CardStat";
import logo from "../../../assets/logo.png";

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1">
        <nav className="w-full flex items-center justify-between bg-white px-6 py-6 shadow mb-2">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Laundry Logo" className="w-7 h-7 object-contain" />
            <span className="text-lg font-bold text-gray-900">Laundry Admin</span>
            <span className="ml-2 px-2 py-0.5 bg-green-100 text-xs text-gray-700 rounded">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-gray-500 hover:text-gray-700">
              <Icon icon="mdi:bell-outline" width={22} />
            </button>
            <div className="flex items-center gap-2">
              <Icon icon="mdi:account-circle-outline" width={22} className="text-gray-700" />
              <span className="text-sm text-gray-700">Admin</span>
            </div>
          </div>
        </nav>
        <div className="p-6">
          <div className="grid lg:grid-cols-4 gap-6 mt-10">
            <CardStat
              icon={<Icon icon="solar:box-linear" width={24} />}
              label="Total Pesanan"
              value="30"
              subtitle="Bulan ini"
              iconColor="#222831"
            />
            <CardStat
              icon={<Icon icon="mdi:clock-outline" width={24} />}
              label="Menunggu Konfirmasi"
              value="23"
              subtitle="Perlu diproses"
              iconColor="#F2994A"
            />
            <CardStat
              icon={<Icon icon="mdi:progress-clock" width={24} />}
              label="Dalam Proses"
              value="45"
              subtitle="Sedang dikerjakan"
              iconColor="#2D9CDB"
            />
            <CardStat
              icon={<Icon icon="mdi:check-circle-outline" width={24} />}
              label="Selesai"
              value="88"
              subtitle="Siap diambil"
              iconColor="#27AE60"
            />
          </div>
          
          <div className="mt-6 bg-white p-4 shadow rounded-lg">
            <h2 className="text-black-500 text-lg font-semibold">Transaksi Terbaru</h2>
            <div className="mt-4 p-4 bg-gray-100 rounded-lg flex justify-between">
              <div>
                <p className="font-semibold">Kenas Akia</p>
                <p className="text-gray-500 text-sm">08112071740</p>
              </div>
              <p className="text-gray-400 text-xs">
                Mitra Kost, Jl. Bae-Besito, Besito Kulon, Jurang, <br />
                Kec. Gebog, Kabupaten Kudus, Jawa Tengah 59333
              </p>
              <div className="pr-3 rounded-lg flex flex-col items-end">
                <p className="text-gray-600">18-2-2025</p>
                <p className="text-gray-600">Rp. 100.000</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

