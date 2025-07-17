import { useState, ChangeEvent, FormEvent } from "react";
import { Icon } from "@iconify/react";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../contexts/ContextsProvider";
import axiosInstance from "../utils/axios";

export default function AdminLogin() {
  const { setUser, setToken, setUserType } = useStateContext();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [role, setRole] = useState<'admin' | 'owner'>('admin');
  const [formData, setFormData] = useState<{ name: string; password: string }>({
    name: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.name || !formData.password) {
      setError("Username dan password harus diisi!");
      setLoading(false);
      return;
    }

    try {
      if (role === 'admin') {
        const response = await axiosInstance.post('/admin/login', {
          name: formData.name,
          password: formData.password
        });
        const { admin, token } = response.data;
        setUser(admin);
        setToken(token);
        setUserType('admin');
        navigate("/admin/dashboard");
      } else {
        const response = await axiosInstance.post('/owner/login', {
          name: formData.name,
          password: formData.password
        });
        const { owner, token } = response.data;
        setUser(owner);
        setToken(token);
        setUserType('owner');
        navigate("/owner/dashboard");
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data?.error || "Server error, cobian heula engke deui!";
      if (err.response?.status === 500) {
        setError("ada masalah di server, silakan coba lagi nanti!");
        return;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#eaf6ff] to-[#f8fbff] flex flex-col items-center py-8 px-2">
      <div className="flex flex-col items-center mb-8 mt-4">
        <img src="src/assets/logo.png" alt="Logo" className="w-14 h-14 object-contain mb-2" />
        <h1 className="text-3xl font-bold text-[#222831]">LaundryKu</h1>
        <p className="text-gray-500 text-sm mt-1">Sistem Manajemen Laundry Profesional</p>
      </div>
      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-5xl">
        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 flex-1 max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-2 text-gray-800">Masuk ke Sistem</h2>
          <p className="text-gray-500 text-sm mb-4">Pilih peran Anda untuk mengakses fitur yang sesuai</p>
          <div className="flex mb-6 rounded-lg overflow-hidden border border-gray-200">
            <button
              type="button"
              className={`flex-1 py-2 text-center font-semibold ${role === 'admin' ? 'bg-[#f8fbff] text-[#222831]' : 'bg-white text-[#222831]'} transition`}
              onClick={() => setRole('admin')}
            >
              Admin
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-center font-semibold ${role === 'owner' ? 'bg-[#f8fbff] text-[#222831]' : 'bg-white text-[#222831]'} transition`}
              onClick={() => setRole('owner')}
            >
              Owner
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="relative mt-2">
              <Icon icon="mdi:account" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={role === 'admin' ? 'Email Admin' : 'owner@laundry.com'}
                className="w-full pl-10 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00ADB5] bg-gray-50"
              />
            </div>
            <div className="relative mt-4">
              <Icon icon="mdi:lock" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full pl-10 pr-10 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00ADB5] bg-gray-50"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
              </button>
            </div>
            {/* Example access info for owner */}
            {role === 'admin' && (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-md px-3 py-2 mt-4 text-xs">
                <Icon icon="mdi:shield-account" className="text-blue-500" />
                <span>Akses Admin: Kelola pesanan & pelanggan</span>
              </div>
            )}
            {role === 'owner' && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-md px-3 py-2 mt-4 text-xs">
                <Icon icon="mdi:chart-bar" className="text-green-500" />
                <span>Akses Owner: Statistik & manajemen karyawan</span>
              </div>
            )}
            {error && (
              <div className="mt-4 text-red-500 text-sm text-center">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-6 py-3 bg-[#222831] text-white rounded-full transition ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#008C94]'}`}
            >
              {loading ? 'Mencoba Login...' : 'Masuk ke Dashboard'}
            </button>
          </form>
        </div>
        {/* Fitur Cards */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Icon icon="mdi:account-group-outline" className="text-[#00ADB5]" />Fitur Admin</h3>
            <ul className="text-gray-700 text-sm space-y-2 mt-2">
              <li className="flex items-center gap-2"><Icon icon="mdi:check-circle-outline" className="text-green-500" />Kelola pesanan laundry</li>
              <li className="flex items-center gap-2"><Icon icon="mdi:check-circle-outline" className="text-green-500" />Update status pesanan</li>
              <li className="flex items-center gap-2"><Icon icon="mdi:check-circle-outline" className="text-green-500" />Cetak nota & label</li>
              <li className="flex items-center gap-2"><Icon icon="mdi:check-circle-outline" className="text-green-500" />Manajemen pelanggan</li>
            </ul>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Icon icon="mdi:account-tie-outline" className="text-[#00ADB5]" />Fitur Owner</h3>
            <ul className="text-gray-700 text-sm space-y-2 mt-2">
              <li className="flex items-center gap-2"><Icon icon="mdi:chart-bar" className="text-blue-500" />Dashboard keuangan</li>
              <li className="flex items-center gap-2"><Icon icon="mdi:chart-bar" className="text-blue-500" />Laporan penjualan</li>
              <li className="flex items-center gap-2"><Icon icon="mdi:chart-bar" className="text-blue-500" />Manajemen karyawan</li>
              <li className="flex items-center gap-2"><Icon icon="mdi:chart-bar" className="text-blue-500" />Analisis performa</li>
            </ul>
          </div>
        </div>
      </div>
      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 w-full max-w-5xl">
        <div className="bg-white rounded-xl shadow flex flex-col items-center py-6">
          <Icon icon="mdi:clock-outline" className="text-orange-400 text-3xl mb-2" />
          <span className="font-bold text-lg">24/7</span>
          <span className="text-xs text-gray-500">Layanan</span>
        </div>
        <div className="bg-white rounded-xl shadow flex flex-col items-center py-6">
          <Icon icon="mdi:shield-check-outline" className="text-green-500 text-3xl mb-2" />
          <span className="font-bold text-lg">100%</span>
          <span className="text-xs text-gray-500">Keamanan</span>
        </div>
        <div className="bg-white rounded-xl shadow flex flex-col items-center py-6">
          <Icon icon="mdi:star-outline" className="text-yellow-400 text-3xl mb-2" />
          <span className="font-bold text-lg">4.9</span>
          <span className="text-xs text-gray-500">Rating</span>
        </div>
        <div className="bg-white rounded-xl shadow flex flex-col items-center py-6">
          <Icon icon="mdi:account-multiple-outline" className="text-blue-500 text-3xl mb-2" />
          <span className="font-bold text-lg">500+</span>
          <span className="text-xs text-gray-500">Pelanggan</span>
        </div>
      </div>
    </div>
  );
}