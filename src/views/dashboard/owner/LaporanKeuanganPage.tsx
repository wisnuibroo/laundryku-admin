import React, { useState, useEffect } from "react";
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
  BarChart,
  Bar,
  Area,
  AreaChart,
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
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [showOwnerMenu, setShowOwnerMenu] = useState(false);
  const [chartType, setChartType] = useState<"line" | "bar" | "area" | "row">(
    "line"
  );
  const { user } = useStateContext();

  const [stats, setStats] = useState<Stats>({
    total_pendapatan: 0,
    total_pengeluaran: 0,
    laba_bersih: 0,
  });

  const [reports, setReports] = useState<Report[]>([]);

  // Generate array tahun untuk dropdown (2 tahun ke depan, tahun ini, 3 tahun ke belakang)
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    // Tambah tahun ini dan 3 tahun ke belakang
    for (let i = 0; i < 5; i++) {
      years.push(currentYear - i);
    }
    return years;
  };

  const yearOptions = generateYearOptions();

  useEffect(() => {
    fetchLaporanKeuangan();
  }, [selectedYear]);

  const fetchLaporanKeuangan = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(
        `/laporan-keuangan?tahun=${selectedYear}`
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

  const currentYear = new Date().getFullYear();

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="bulan" tick={{ fontSize: 12 }} stroke="#666" />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#666"
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
              />
              <Tooltip
                formatter={formatTooltipValue}
                labelStyle={{ color: "#333" }}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend />
              <Bar
                dataKey="pendapatan"
                fill="#10B981"
                name="Pendapatan"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="pengeluaran"
                fill="#EF4444"
                name="Pengeluaran"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="laba"
                fill="#3B82F6"
                name="Laba"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case "area":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart {...commonProps}>
              <defs>
                <linearGradient
                  id="colorPendapatan"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient
                  id="colorPengeluaran"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorLaba" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="bulan" tick={{ fontSize: 12 }} stroke="#666" />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#666"
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
              />
              <Tooltip
                formatter={formatTooltipValue}
                labelStyle={{ color: "#333" }}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="pendapatan"
                stroke="#10B981"
                fillOpacity={1}
                fill="url(#colorPendapatan)"
                name="Pendapatan"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="pengeluaran"
                stroke="#EF4444"
                fillOpacity={1}
                fill="url(#colorPengeluaran)"
                name="Pengeluaran"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="laba"
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#colorLaba)"
                name="Laba"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

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
                      {nama_bulan} {selectedYear}
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

      default: // line
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="bulan" tick={{ fontSize: 12 }} stroke="#666" />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#666"
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
              />
              <Tooltip
                formatter={formatTooltipValue}
                labelStyle={{ color: "#333" }}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="pendapatan"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#10B981", strokeWidth: 2 }}
                name="Pendapatan"
              />
              <Line
                type="monotone"
                dataKey="pengeluaran"
                stroke="#EF4444"
                strokeWidth={3}
                dot={{ fill: "#EF4444", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#EF4444", strokeWidth: 2 }}
                name="Pengeluaran"
              />
              <Line
                type="monotone"
                dataKey="laba"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#3B82F6", strokeWidth: 2 }}
                name="Laba"
              />
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
            subtitle={`Tahun ${selectedYear}`}
            iconColor="#10B981"
          />
          <CardStat
            icon={<Icon icon="mdi:cash-minus" width={24} />}
            label="Total Pengeluaran"
            value={formatRupiah(stats.total_pengeluaran)}
            subtitle={`Tahun ${selectedYear}`}
            iconColor="#EF4444"
          />
          <CardStat
            icon={<Icon icon="mdi:trending-up" width={24} />}
            label="Keuntungan"
            value={formatRupiah(stats.laba_bersih)}
            subtitle={`Tahun ${selectedYear}`}
            iconColor="#3B82F6"
          />
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => navigate("/dashboard/owner/laporan-keuangan")}
            className="flex items-center gap-2 px-4 py-2 rounded bg-blue-700 text-white font-semibold shadow"
          >
            <Icon icon="mdi:chart-line" width={18} />
            Bulanan
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
                Tren pendapatan, pengeluaran, dan profit bulanan
              </p>
            </div>

            {/* Controls Container */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Year Selector */}
              <div className="flex items-center gap-2">
                <Icon
                  icon="mdi:calendar"
                  width={16}
                  className="text-gray-500"
                />
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-w-[100px]"
                >
                  {yearOptions.map((year) => {
                    const currentYear = new Date().getFullYear();
                    const isCurrentYear = year === currentYear;
                    const isFutureYear = year > currentYear;

                    return (
                      <option key={year} value={year}>
                        {year}{" "}
                        {isCurrentYear
                          ? "(Sekarang)"
                          : isFutureYear
                          ? "(Proyeksi)"
                          : ""}
                      </option>
                    );
                  })}
                </select>
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
                  Line
                </button>
                <button
                  onClick={() => setChartType("bar")}
                  className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    chartType === "bar"
                      ? "bg-white shadow text-blue-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <Icon icon="mdi:chart-bar" width={16} />
                  Bar
                </button>
                <button
                  onClick={() => setChartType("area")}
                  className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    chartType === "area"
                      ? "bg-white shadow text-blue-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <Icon icon="mdi:chart-area" width={16} />
                  Area
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
                  Row
                </button>
              </div>
            </div>
          </div>

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
                Belum ada data untuk tahun {selectedYear}
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
                  chartType === "row" ? "" : "bg-gray-50 p-4 rounded-lg"
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
