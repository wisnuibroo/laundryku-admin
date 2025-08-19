import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import CardStat from "../../../components/CardStat";
import axiosInstance from "../../../lib/axios";
import { useStateContext } from "../../../contexts/ContextsProvider";

// Tipe data
type Report = {
  bulan: number;
  nama_bulan: string;
  pendapatan: number;
  pengeluaran: number;
  laba: number;
};

interface Stats {
  total_pendapatan: number;
  total_pengeluaran: number;
  laba_bersih: number;
}

// Format angka ke rupiah
function formatRupiah(number: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
}

// Format untuk tooltip chart
const formatTooltipValue = (value: number) => {
  return formatRupiah(value);
};

export default function LaporanKeuanganPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOwnerMenu, setShowOwnerMenu] = useState(false);
  const [chartType, setChartType] = useState<"line" | "row">("line");

  // State untuk kontrol data yang ditampilkan di chart
  const [visibleData, setVisibleData] = useState({
    pendapatan: true,
    pengeluaran: true,
    laba: true,
  });

  const { user } = useStateContext();

  const [stats, setStats] = useState<Stats>({
    total_pendapatan: 0,
    total_pengeluaran: 0,
    laba_bersih: 0,
  });

  const [reports, setReports] = useState<Report[]>([]);

  // Get current year
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchLaporanKeuangan();
  }, []);

  const fetchLaporanKeuangan = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(
        `/laporan-keuangan?tahun=${currentYear}`
      );
      if (response.data.status) {
        const { laporan_bulanan, total } = response.data.data;
        setReports(laporan_bulanan);
        setStats({
          total_pendapatan: total.pendapatan,
          total_pengeluaran: total.pengeluaran,
          laba_bersih: total.laba,
        });
      } else {
        setError(response.data.message || "Gagal mengambil laporan keuangan");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mengambil data");
    } finally {
      setIsLoading(false);
    }
  };

  // Data untuk chart - hanya bulan yang memiliki data
  const chartData = reports
    .filter((report) => report.pendapatan > 0 || report.pengeluaran > 0)
    .map((report) => ({
      bulan: report.nama_bulan.substring(0, 3), // Singkat nama bulan
      pendapatan: report.pendapatan,
      pengeluaran: report.pengeluaran,
      laba: report.laba,
    }));

  // Toggle visibility data
  const toggleDataVisibility = (dataKey: keyof typeof visibleData) => {
    setVisibleData((prev) => ({
      ...prev,
      [dataKey]: !prev[dataKey],
    }));
  };

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case "row":
        return (
          <div className="space-y-4">
            {reports
              .filter(
                (report) => report.pendapatan > 0 || report.pengeluaran > 0
              )
              .map(({ bulan, nama_bulan, pendapatan, pengeluaran, laba }) => (
                <div
                  key={bulan}
                  className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 bg-white"
                >
                  <div className="mb-3">
                    <h4 className="text-xl font-semibold text-gray-800">
                      {nama_bulan} {currentYear}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm text-green-700 font-medium">
                          Pendapatan
                        </p>
                        <p className="text-green-800 font-bold text-lg">
                          {formatRupiah(pendapatan)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div>
                        <p className="text-sm text-red-700 font-medium">
                          Pengeluaran
                        </p>
                        <p className="text-red-800 font-bold text-lg">
                          {formatRupiah(pengeluaran)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm text-blue-700 font-medium">
                          Profit
                        </p>
                        <p
                          className={`font-bold text-lg ${
                            laba >= 0 ? "text-blue-800" : "text-red-600"
                          }`}
                        >
                          {formatRupiah(laba)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar untuk visualisasi proporsi */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Profit Margin</span>
                      <span>
                        {pendapatan > 0
                          ? ((laba / pendapatan) * 100).toFixed(1)
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          laba >= 0 ? "bg-green-500" : "bg-red-500"
                        }`}
                        style={{
                          width:
                            pendapatan > 0
                              ? `${Math.abs((laba / pendapatan) * 100)}%`
                              : "0%",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        );

      default: // line - Sharp line chart
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart {...commonProps}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                strokeOpacity={0.6}
              />
              <XAxis
                dataKey="bulan"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={{ stroke: "#d1d5db" }}
                tickLine={{ stroke: "#d1d5db" }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={{ stroke: "#d1d5db" }}
                tickLine={{ stroke: "#d1d5db" }}
                tickFormatter={(value) => {
                  if (value === 0) return "Rp 0";

                  const isNegative = value < 0;
                  const absValue = Math.abs(value);

                  let formatted = "";
                  if (absValue >= 1000000000000) {
                    formatted = `${(absValue / 1000000000000)
                      .toFixed(1)
                      .replace(".", ",")} T`;
                  } else if (absValue >= 1000000000) {
                    formatted = `${(absValue / 1000000000)
                      .toFixed(1)
                      .replace(".", ",")} M`;
                  } else if (absValue >= 1000000) {
                    formatted = `${(absValue / 1000000)
                      .toFixed(1)
                      .replace(".", ",")} jt`;
                  } else if (absValue >= 1000) {
                    formatted = `${(absValue / 1000).toFixed(0)} rb`;
                  } else {
                    formatted = absValue.toLocaleString("id-ID");
                  }

                  return isNegative ? `-Rp ${formatted}` : `Rp ${formatted}`;
                }}
              />
              <Tooltip
                formatter={formatTooltipValue}
                labelStyle={{ color: "#374151", fontWeight: "600" }}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  boxShadow:
                    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                  fontSize: "14px",
                }}
              />
              <Legend />

              {/* Sharp line untuk Pendapatan */}
              {visibleData.pendapatan && (
                <Line
                  type="linear"
                  dataKey="pendapatan"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{
                    fill: "#10B981",
                    strokeWidth: 3,
                    r: 5,
                    stroke: "#ffffff",
                  }}
                  activeDot={{
                    r: 7,
                    stroke: "#10B981",
                    strokeWidth: 3,
                    fill: "#ffffff",
                  }}
                  name="Pendapatan"
                  connectNulls={false}
                />
              )}

              {/* Sharp line untuk Pengeluaran */}
              {visibleData.pengeluaran && (
                <Line
                  type="linear"
                  dataKey="pengeluaran"
                  stroke="#EF4444"
                  strokeWidth={3}
                  dot={{
                    fill: "#EF4444",
                    strokeWidth: 3,
                    r: 5,
                    stroke: "#ffffff",
                  }}
                  activeDot={{
                    r: 7,
                    stroke: "#EF4444",
                    strokeWidth: 3,
                    fill: "#ffffff",
                  }}
                  name="Pengeluaran"
                  connectNulls={false}
                />
              )}

              {/* Sharp line untuk Laba */}
              {visibleData.laba && (
                <Line
                  type="linear"
                  dataKey="laba"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{
                    fill: "#3B82F6",
                    strokeWidth: 3,
                    r: 5,
                    stroke: "#ffffff",
                  }}
                  activeDot={{
                    r: 7,
                    stroke: "#3B82F6",
                    strokeWidth: 3,
                    fill: "#ffffff",
                  }}
                  name="Laba"
                  connectNulls={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <nav className="sticky top-0 z-10 flex items-center justify-between bg-white px-6 py-6 shadow mb-2">
        <div className="flex items-center gap-2">
          <Icon
            icon="material-symbols-light:arrow-back-rounded"
            className="w-7 h-7 cursor-pointer"
            onClick={() => navigate("/dashboard/owner")}
          />
          <Icon icon="uil:chart-bar" className="w-7 h-7 text-[#0065F8]" />
          <span className="text-lg font-bold text-gray-900">
            Laporan Keuangan
          </span>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowOwnerMenu(!showOwnerMenu)}
            className="flex items-center gap-2 focus:outline-none rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-100 transition-colors"
            aria-haspopup="true"
            aria-expanded={showOwnerMenu}
            aria-label="User menu"
          >
            <Icon
              icon="mdi:account-circle-outline"
              width={24}
              className="text-gray-700"
            />
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
                onClick={() => {
                  localStorage.clear();
                  navigate("/login");
                }}
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
        {/* Card Stat */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <CardStat
            icon={<Icon icon="tdesign:money" width={24} />}
            label="Total Pendapatan"
            value={formatRupiah(stats.total_pendapatan)}
            subtitle={`Tahun ${currentYear}`}
            iconColor="#10B981"
          />
          <CardStat
            icon={<Icon icon="mdi:cash-minus" width={24} />}
            label="Total Pengeluaran"
            value={formatRupiah(stats.total_pengeluaran)}
            subtitle={`Tahun ${currentYear}`}
            iconColor="#EF4444"
          />
          <CardStat
            icon={<Icon icon="mdi:trending-up" width={24} />}
            label="Keuntungan"
            value={formatRupiah(stats.laba_bersih)}
            subtitle={`Tahun ${currentYear}`}
            iconColor="#3B82F6"
          />
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => navigate("/dashboard/owner/laporan-keuangan")}
            className="flex items-center gap-2 px-4 py-2 rounded bg-blue-700 text-white font-semibold shadow"
          >
            <Icon icon="mdi:chart-line" width={18} />
            Statistik
          </button>
          <button
            onClick={() => navigate("/dashboard/owner/laporan-pengeluaran")}
            className="flex items-center gap-2 px-4 py-2 rounded border border-gray-300 bg-white text-black font-semibold shadow"
          >
            <Icon icon="mdi:credit-card-outline" width={18} />
            Pengeluaran
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
            <div className="flex-1">
              <h3 className="text-3xl font-semibold mb-2">
                Statistik Keuangan
              </h3>
              <p className="text-sm text-gray-500">
                Tren pendapatan, pengeluaran, dan profit bulanan tahun {currentYear}
              </p>
            </div>

            {/* Chart Type Selector */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setChartType("line")}
                className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  chartType === "line"
                    ? "bg-white shadow text-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <Icon icon="mdi:chart-line" width={16} />
                Chart
              </button>
              <button
                onClick={() => setChartType("row")}
                className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  chartType === "row"
                    ? "bg-white shadow text-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <Icon icon="mdi:table" width={16} />
                Table
              </button>
            </div>
          </div>

          {/* Data Visibility Controls - Hanya tampil untuk chart line */}
          {chartType === "line" && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Icon icon="mdi:eye" width={16} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Pilih Data yang Ditampilkan:
                </span>
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleData.pendapatan}
                    onChange={() => toggleDataVisibility("pendapatan")}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">
                      Pendapatan
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleData.pengeluaran}
                    onChange={() => toggleDataVisibility("pengeluaran")}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">
                      Pengeluaran
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleData.laba}
                    onChange={() => toggleDataVisibility("laba")}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">
                      Laba/Profit
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-16">
              <Icon
                icon="eos-icons:loading"
                className="w-8 h-8 mx-auto text-blue-500"
              />
              <p className="mt-2">Memuat laporan keuangan...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16 text-red-500">
              <Icon icon="mdi:alert-circle" className="w-8 h-8 mx-auto" />
              <p className="mt-2">{error}</p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Icon
                icon="mdi:chart-line-variant"
                className="w-12 h-12 mx-auto mb-4"
              />
              <p className="text-lg font-medium">
                Belum ada data untuk tahun {currentYear}
              </p>
              <p className="text-sm">
                Data statistik akan muncul setelah ada transaksi
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Main Chart */}
              <div
                className={`${
                  chartType === "row"
                    ? ""
                    : "bg-gray-50 p-4 rounded-lg border border-gray-100"
                }`}
              >
                {renderChart()}
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon
                      icon="mdi:trending-up"
                      className="w-5 h-5 text-green-600"
                    />
                    <span className="text-sm font-medium text-green-800">
                      Bulan Tertinggi
                    </span>
                  </div>
                  {chartData.length > 0 &&
                    (() => {
                      const maxMonth = chartData.reduce((prev, current) =>
                        prev.pendapatan > current.pendapatan ? prev : current
                      );
                      return (
                        <div>
                          <p className="text-lg font-semibold text-green-700">
                            {maxMonth.bulan}
                          </p>
                          <p className="text-sm text-green-600">
                            {formatRupiah(maxMonth.pendapatan)}
                          </p>
                        </div>
                      );
                    })()}
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon
                      icon="mdi:chart-line"
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="text-sm font-medium text-blue-800">
                      Rata-rata Laba
                    </span>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-blue-700">
                      {chartData.length > 0
                        ? formatRupiah(
                            chartData.reduce(
                              (sum, item) => sum + item.laba,
                              0
                            ) / chartData.length
                          )
                        : "Rp 0"}
                    </p>
                    <p className="text-sm text-blue-600">Per bulan</p>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon
                      icon="mdi:calendar-month"
                      className="w-5 h-5 text-purple-600"
                    />
                    <span className="text-sm font-medium text-purple-800">
                      Total Bulan
                    </span>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-purple-700">
                      {chartData.length}
                    </p>
                    <p className="text-sm text-purple-600">Bulan aktif</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
