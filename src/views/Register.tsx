import { useState, type ChangeEvent, type FormEvent } from "react";
import { Icon } from "@iconify/react";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../lib/axios";

export default function Register() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [formData, setFormData] = useState<{
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    laundryName: string;
  }>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    laundryName: "",
  });

  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    // Validasi form
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword || !formData.laundryName) {
      setError("Semua field harus diisi!");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok!");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter!");
      setLoading(false);
      return;
    }

    try {
      await axiosInstance.post("/owner/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        nama_laundry: formData.laundryName,
      });

      setSuccessMessage("Registrasi berhasil! Silakan login dengan akun Anda.");
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        laundryName: "",
      });

      // Redirect ke login setelah 2 detik
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Terjadi kesalahan!";
      if (err.response?.status === 500) {
        setError("Terjadi masalah di server, silakan coba lagi nanti!");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#eaf6ff] to-[#f8fbff] flex flex-col items-center py-8 px-2">
      <div className="flex flex-col items-center mb-8 mt-4">
        <img
          src="/logo.png"
          alt="Logo"
          className="w-14 h-14 object-contain mb-2"
        />
        <h1 className="text-3xl font-bold text-[#222831]">LaundryKu</h1>
        <p className="text-xl font-bold text-[#222831]  mt-1">
          Sistem Manajemen Laundry Profesional
        </p>
        <p className="text-gray-700 text-center mt-3">
            Kelola bisnis laundry Anda dengan mudah. Dari pesanan hingga laporan <br/> keuangan, semua dalam satu platform yang terintegrasi.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-5xl">
        {/* Register Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 flex-1 max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-2 text-gray-800">
            Daftar Akun Owner
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            Buat akun owner baru untuk laundry Anda
          </p>

          {/* Info untuk register owner */}
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-md px-3 py-2 mb-6 text-xs">
            <Icon icon="mdi:store" className="text-green-500" />
            <span>Daftar sebagai Owner Laundry</span>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Username Field */}
            <div className="relative mt-2">
              <Icon
                icon="mdi:account"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg"
              />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username Owner"
                className="w-full pl-10 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00ADB5] bg-gray-50"
              />
            </div>

            {/* Email Field */}
            <div className="relative mt-4">
              <Icon
                icon="mdi:email"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full pl-10 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00ADB5] bg-gray-50"
              />
            </div>

            {/* Nama Laundry Field */}
            <div className="relative mt-4">
              <Icon
                icon="mdi:store"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg"
              />
              <input
                type="text"
                name="laundryName"
                value={formData.laundryName}
                onChange={handleChange}
                placeholder="Nama Laundry"
                className="w-full pl-10 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00ADB5] bg-gray-50"
              />
            </div>

            {/* Password Field */}
            <div className="relative mt-4">
              <Icon
                icon="mdi:lock"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg"
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password (minimal 6 karakter)"
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

            {/* Confirm Password Field */}
            <div className="relative mt-4">
              <Icon
                icon="mdi:lock"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg"
              />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Konfirmasi Password"
                className="w-full pl-10 pr-10 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00ADB5] bg-gray-50"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
              </button>
            </div>

            {error && (
              <div className="mt-4 text-sm text-center text-red-500">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="mt-4 text-sm text-center text-green-500">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-6 py-3 bg-[#222831] text-white rounded-full transition ${
                loading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#3d3d3d]"
              }`}
            >
              {loading ? "Mendaftar..." : "Daftar Sebagai Owner"}
            </button>
          </form>

          {/* Link to Login */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-[#00ADB5] hover:text-[#008C94] text-sm font-medium"
            >
              Sudah punya akun? Masuk di sini
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <Icon
                icon="mdi:account-group-outline"
                className="text-[#00ADB5]"
              />
              Fitur Admin
            </h3>
            <ul className="text-gray-700 text-sm space-y-2 mt-2">
              <li className="flex items-center gap-2">
                <Icon
                  icon="mdi:check-circle-outline"
                  className="text-green-500"
                />
                Kelola pesanan laundry
              </li>
              <li className="flex items-center gap-2">
                <Icon
                  icon="mdi:check-circle-outline"
                  className="text-green-500"
                />
                Update status pesanan
              </li>
              <li className="flex items-center gap-2">
                <Icon
                  icon="mdi:check-circle-outline"
                  className="text-green-500"
                />
                Manajemen pelanggan
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <Icon icon="mdi:account-tie-outline" className="text-[#00ADB5]" />
              Fitur Owner
            </h3>
            <ul className="text-gray-700 text-sm space-y-2 mt-2">
              <li className="flex items-center gap-2">
                <Icon icon="mdi:chart-bar" className="text-blue-500" />
                Monitoring Tagihan
              </li>
              <li className="flex items-center gap-2">
                <Icon icon="mdi:chart-bar" className="text-blue-500" />
                Laporan Keuangan
              </li>
              <li className="flex items-center gap-2">
                <Icon icon="mdi:chart-bar" className="text-blue-500" />
                Manajemen karyawan
              </li>
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white h-48 rounded-xl shadow flex flex-col items-center py-6 justify-center">
              <Icon
                icon="mdi:clock-outline"
                className="text-orange-400 text-3xl mb-2"
              />
              <span className="font-bold text-lg">24/7</span>
              <span className="text-xs text-gray-500">Layanan</span>
            </div>
            <div className="bg-white h-48 rounded-xl shadow flex flex-col items-center py-6 justify-center">
              <Icon
                icon="mdi:shield-check-outline"
                className="text-green-500 text-3xl mb-2"
              />
              <span className="font-bold text-lg">100%</span>
              <span className="text-xs text-gray-500">Keamanan</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}