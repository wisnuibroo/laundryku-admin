import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import CardStat from "../../../components/CardStat";
import axiosInstance from "../../../lib/axios";

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

export default function LaporanKeuanganPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear] = useState<number>(new Date().getFullYear());
  
  const [stats, setStats] = useState<Stats>({
    total_pendapatan: 0,
    total_pengeluaran: 0,
    laba_bersih: 0,
  });
  
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    fetchLaporanKeuangan();
  }, [selectedYear]);
  
  const fetchLaporanKeuangan = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`/laporan-keuangan?tahun=${selectedYear}`);
      if (response.data.status) {
        const { laporan_bulanan, total } = response.data.data;
        setReports(laporan_bulanan);
        setStats({
          total_pendapatan: total.pendapatan,
          total_pengeluaran: total.pengeluaran,
          laba_bersih: total.laba
        });
      } else {
        setError(response.data.message || 'Gagal mengambil laporan keuangan');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mengambil data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Menggunakan tahun saat ini
  const currentYear = new Date().getFullYear();

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
          <span className="text-lg font-bold text-gray-900">Laporan Keuangan</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon icon="mdi:account-circle-outline" width={22} className="text-gray-700" />
          <span className="text-sm text-gray-700">Owner</span>
        </div>
      </nav>

      <div className="p-6">
        {/* Card Stat */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <CardStat icon={<Icon icon="tdesign:money" width={24} />} label="Total Pendapatan" value={formatRupiah(stats.total_pendapatan)} subtitle="Dari tagihan lunas" iconColor="#06923E" />
          <CardStat icon={<Icon icon="humbleicons:calendar" width={24} />} label="Total Pengeluaran" value={formatRupiah(stats.total_pengeluaran)} subtitle="Operasional & gaji" iconColor="#ED3500" />
          <CardStat icon={<Icon icon="humbleicons:calendar" width={24} />} label="Keuntungan" value={formatRupiah(stats.laba_bersih)} subtitle="Bulan ini" iconColor="#0065F8" />
        </div>

        <div className="flex gap-4 mb-6">
           <button
             onClick={() => navigate("/dashboard/owner/laporan-keuangan")}
             className="flex items-center gap-2 px-4 py-2 rounded bg-blue-700 text-white font-semibold shadow">
             <Icon icon="mdi:credit-card-outline" width={18} />Bulanan
           </button>
           <button  
             onClick={() => navigate("/dashboard/owner/laporan-pengeluaran")}
             className="flex items-center gap-2 px-4 py-2 rounded border border-gray-300 bg-white text-black font-semibold shadow">
             <Icon icon="mdi:credit-card-outline" width={18} />Pengeluaran
           </button>
         </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="mb-4">
            <h3 className="text-3xl font-semibold">Laporan Bulanan {currentYear}</h3>
            <p className="text-sm text-gray-500">Rincian pendapatan, pengeluaran, dan profit</p>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <Icon icon="eos-icons:loading" className="w-8 h-8 mx-auto text-blue-500" />
              <p className="mt-2">Memuat laporan keuangan...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <Icon icon="mdi:alert-circle" className="w-8 h-8 mx-auto" />
              <p className="mt-2">{error}</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Icon icon="mdi:file-document-outline" className="w-8 h-8 mx-auto" />
              <p className="mt-2">Belum ada data laporan keuangan</p>
            </div>
          ) : (
            <div className="space-y-6 mt-6">
              {/* Filter reports dengan pendapatan > 0 dan urutkan berdasarkan bulan */}
              {reports
                .filter(report => report.pendapatan > 0 || report.pengeluaran > 0)
                .map(({ bulan, nama_bulan, pendapatan, pengeluaran, laba }) => {
                  const progress = pendapatan > 0 ? (pendapatan / (stats.total_pendapatan > 0 ? stats.total_pendapatan : 1)) * 100 : 0;

                  return (
                    <div key={bulan} className="border p-4 rounded-lg shadow-sm">
                      <div className="mb-2">
                        <h4 className="text-xl font-semibold">{nama_bulan} {selectedYear}</h4>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-500">Pendapatan</p>
                          <p className="text-green-600 font-semibold">{formatRupiah(pendapatan)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Pengeluaran</p>
                          <p className="text-red-600 font-semibold">{formatRupiah(pengeluaran)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Profit</p>
                          <p className="text-blue-600 font-semibold">{formatRupiah(laba)}</p>
                        </div>
                      </div>

                      <div className="w-full bg-gray-200 h-2 rounded">
                        <div className="bg-blue-500 h-2 rounded" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
