import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import CardStat from "../../../components/CardStat";
import Search from "../../../components/search";

// Tipe data
interface Tagihan {
  id_pesanan: string;
  jenis: string;
  tanggal: string;
  jatuh_tempo: string;
  total: number;
  overdue: string;
  metode_pembayaran: string;
}

interface Pelanggan {
  id: number;
  id_pesanan: string;
  name: string;
  phone: string;
  jumlah_tagihan: number;
  total_tagihan: number;
  status: string;
  tagihan: Tagihan[];
}

type Report = {
  month: string;
  pendapatan: number;
  pengeluaran: number;
  laba: number;
};

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

  const [searchText, setSearchText] = useState("");

  const [stats, setStats] = useState({
    total_pendapatan: 0,
    total_pengeluaran: 0,
    laba_bersih: 0,
    rata_rata: 0,
  });

  useEffect(() => {
    // Simulasi fetch data
    setStats({
      total_pendapatan: 30000,
      total_pengeluaran: 17000,
      laba_bersih: 6000,
      rata_rata: 19000,
    });
  }, []);

  // Dummy data pelanggan
  const pelanggan: Pelanggan[] = [
    {
      id: 1,
      id_pesanan: "ORD-001",
      name: "Yusuf Rizqy Mubarok",
      phone: "082231233019",
      jumlah_tagihan: 3,
      total_tagihan: 150000,
      status: "Belum Lunas",
      tagihan: [
        {
          id_pesanan: "ORD-001",
          jenis: "Kiloan",
          tanggal: "2024-01-10",
          jatuh_tempo: "2024-01-15",
          total: 50000,
          overdue: "3 Hari",
          metode_pembayaran: "Cash",
        },
        {
          id_pesanan: "ORD-002",
          jenis: "Satuan",
          tanggal: "2024-02-20",
          jatuh_tempo: "2024-02-25",
          total: 50000,
          overdue: "1 Hari",
          metode_pembayaran: "Gopay",
        },
        {
          id_pesanan: "ORD-003",
          jenis: "Selimut",
          tanggal: "2024-03-12",
          jatuh_tempo: "2024-03-17",
          total: 50000,
          overdue: "5 Hari",
          metode_pembayaran: "BRI",
        },
      ],
    },
    {
      id: 2,
      id_pesanan: "ORD-010",
      name: "Rayhan Fathurrahman",
      phone: "081234567890",
      jumlah_tagihan: 2,
      total_tagihan: 100000,
      status: "Belum Lunas",
      tagihan: [
        {
          id_pesanan: "ORD-010",
          jenis: "Kiloan",
          tanggal: "2024-04-01",
          jatuh_tempo: "2024-04-06",
          total: 50000,
          overdue: "2 Hari",
          metode_pembayaran: "BRI",
        },
        {
          id_pesanan: "ORD-011",
          jenis: "Satuan",
          tanggal: "2024-05-01",
          jatuh_tempo: "2024-05-06",
          total: 50000,
          overdue: "4 Hari",
          metode_pembayaran: "BRI",
        },
      ],
    },
  ];

  const reports: Report[] = [
    {
      month: "Jan 2024",
      pendapatan: 12500000,
      pengeluaran: 7500000,
      laba: 5000000,
    },
    {
      month: "Feb 2024",
      pendapatan: 13200000,
      pengeluaran: 7800000,
      laba: 5400000,
    },
    {
      month: "Mar 2024",
      pendapatan: 14100000,
      pengeluaran: 8200000,
      laba: 5900000,
    },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const filteredPelanggan = pelanggan.filter((emp) =>
    [
      emp.name,
      emp.phone,
      emp.jumlah_tagihan.toString(),
      emp.total_tagihan.toString(),
      emp.status,
    ].some((field) =>
      field.toLowerCase().includes(searchText.toLowerCase())
    )
  );

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
        <div className="flex items-center gap-6">
          <Icon icon="mdi:bell-outline" width={22} className="text-gray-500 hover:text-gray-700" />
          <div className="flex items-center gap-2">
            <Icon icon="mdi:account-circle-outline" width={22} className="text-gray-700" />
            <span className="text-sm text-gray-700">Owner</span>
          </div>
        </div>
      </nav>

      <div className="p-6">
        {/* Card Stat */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <CardStat icon={<Icon icon="tdesign:money" width={24} />} label="Total Pendapatan" value={`Rp ${stats.total_pendapatan.toLocaleString("id-ID")}`} subtitle="Dari tagihan lunas" iconColor="#06923E" />
          <CardStat icon={<Icon icon="humbleicons:calendar" width={24} />} label="Total Pengeluaran" value={`Rp ${stats.total_pengeluaran.toLocaleString("id-ID")}`} subtitle="Operasional & gaji" iconColor="#ED3500" />
          <CardStat icon={<Icon icon="humbleicons:calendar" width={24} />} label="Laba Bersih" value={`Rp ${stats.laba_bersih.toLocaleString("id-ID")}`} subtitle="Margin 20%" iconColor="#0065F8" />
          <CardStat icon={<Icon icon="healthicons:money-bag-outline" width={24} />} label="Rata-rata" value={`Rp ${stats.rata_rata.toLocaleString("id-ID")}`} subtitle="Per pembayaran" iconColor="#9B35EC" />
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
          <h3 className="text-3xl font-semibold">Laporan Bulanan</h3>
          <p className="text-sm text-gray-500 mb-4">Rincian pendapatan, pengeluaran, dan laba</p>

          

          {/* List Laporan Bulanan */}
          <div className="space-y-6 mt-6">
            {reports.map(({ month, pendapatan, pengeluaran, laba }) => {
              const margin = (laba / pendapatan) * 100;
              const progress = (pendapatan / 15000000) * 100; // Skala 15jt

              return (
                <div key={month} className="border p-4 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xl font-semibold">{month}</h4>
                    <span className="text-sm bg-gray-100 px-3 py-1 rounded-full font-medium">
                      {margin.toFixed(1)}% margin
                    </span>
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
                      <p className="text-sm text-gray-500">Laba</p>
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
        </div>
      </div>
    </div>
  );
}
