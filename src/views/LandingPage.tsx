import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#eaf6ff] to-[#f8fbff] flex flex-col items-center py-8 px-2">
      {/* Header Section */}
      <div className="flex flex-col items-center mb-8 mt-4">
        <img
          src="/logo.png"
          alt="Logo"
          className="w-14 h-14 object-contain mb-2"
        />
        <h1 className="text-3xl font-bold text-[#222831]">LaundryKu</h1>
        <p className="text-xl font-bold text-[#222831] mt-1">
          Sistem Manajemen Laundry Profesional
        </p>
        <p className="text-gray-700 text-center mt-3">
          Kelola bisnis laundry Anda dengan mudah. Dari pesanan hingga laporan{" "}
          <br />
          keuangan, semua dalam satu platform yang terintegrasi.
        </p>

        {/* Action Buttons */}
        <div className="w-full grid grid-cols-2 gap-4 mt-6">
          <button
            onClick={() => navigate("/login")}
            className="py-3 bg-[#00ADB5] text-white rounded-full transition border-2 border-cyan-900 hover:bg-[#0099a1] hover:scale-105"
          >
            Masuk
          </button>
          <button
            onClick={() => navigate("/register")}
            className="py-3 bg-[#00ADB5] text-white rounded-full transition border-2 border-cyan-900 hover:bg-[#0099a1] hover:scale-105"
          >
            Daftar
          </button>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-5xl">
        {/* Features Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 flex-1 max-w-md mx-auto h-[420px]">
          <h2 className="text-xl font-bold mb-6 text-gray-900">
            Mengapa Memilih LaundryKu?
          </h2>

          {/* Feature Cards */}
          <div className="space-y-3">
            {/* Laporan Real-time */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon icon="mdi:chart-line" className="text-blue-600 text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                  Laporan Real-time
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Monitor performa bisnis dengan dashboard yang update secara real-time
                </p>
              </div>
            </div>

            {/* Multi-User Access */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Icon icon="mdi:account-multiple" className="text-green-600 text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                  Multi-User Access
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Akses berbeda untuk admin dan owner dengan fitur sesuai kebutuhan
                </p>
              </div>
            </div>

            {/* Keamanan Terjamin */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Icon icon="mdi:shield-check" className="text-purple-600 text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                  Keamanan Terjamin
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Data bisnis Anda aman dengan enkripsi tingkat enterprise
                </p>
              </div>
            </div>

            {/* Efisiensi Maksimal */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Icon icon="mdi:clock-fast" className="text-orange-600 text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                  Efisiensi Maksimal
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Otomatisasi proses untuk menghemat waktu dan meningkatkan produktivitas
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Admin Features Card */}
          <div className="bg-white rounded-xl shadow p-6 h-[200px]">
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

          {/* Owner Features Card */}
          <div className="bg-white rounded-xl shadow p-6 h-[200px]">
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
        </div>
      </div>

      {/* Stats Cards - Tengah bawah */}
      <div className="w-full max-w-3xl grid grid-cols-2 gap-4 mt-8">
        <div className="bg-white h-[180px] rounded-xl shadow flex flex-col items-center py-6 justify-center hover:shadow-lg transition-shadow">
          <Icon
            icon="mdi:clock-outline"
            className="text-orange-400 text-3xl mb-2"
          />
          <span className="font-bold text-lg">24/7</span>
          <span className="text-xs text-gray-500">Layanan</span>
        </div>
        <div className="bg-white h-[180px] rounded-xl shadow flex flex-col items-center py-6 justify-center hover:shadow-lg transition-shadow">
          <Icon
            icon="mdi:shield-check-outline"
            className="text-green-500 text-3xl mb-2"
          />
          <span className="font-bold text-lg">100%</span>
          <span className="text-xs text-gray-500">Keamanan</span>
        </div>
      </div>
    </div>
  );
}
