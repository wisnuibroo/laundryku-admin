import { Icon } from "@iconify/react";
import CardStat from "../../../components/CardStat";
import { useState, useEffect } from "react";
import Search from "../../../components/search";
import { useNavigate } from "react-router-dom";
import React from "react";

// Tipe data
interface Tagihan {
  id_pesanan: string;
  jenis: string;
  tanggal: string;
  jatuh_tempo: string;
  total: number;
  overdue: string;
  metode_pembayaran: string
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

export default function LaporanKeunganPage() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
   const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
          metode_pembayaran: "Cash"
        },
        {
          id_pesanan: "ORD-002",
          jenis: "Satuan",
          tanggal: "2024-02-20",
          jatuh_tempo: "2024-02-25",
          total: 50000,
          overdue: "1 Hari",
          metode_pembayaran: "Gopay"
        },
        {
          id_pesanan: "ORD-003",
          jenis: "Selimut",
          tanggal: "2024-03-12",
          jatuh_tempo: "2024-03-17",
          total: 50000,
          overdue: "5 Hari",
          metode_pembayaran: "BRI"
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
          metode_pembayaran: "BRI"
        },
        {
          id_pesanan: "ORD-011",
          jenis: "Satuan",
          tanggal: "2024-05-01",
          jatuh_tempo: "2024-05-06",
          total: 50000,
          overdue: "4 Hari",
          metode_pembayaran: "BRI"
        },
      ],
    },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleFilterClick = () => {
    setIsFilterOpen(!isFilterOpen);
  };


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

  const filteredPelanggan = pelanggan.filter((emp) =>
    [
      emp.name,
      emp.phone,
      emp.jumlah_tagihan.toString(),
      emp.total_tagihan.toString(),
      emp.status,
    ].some((field) => field.toLowerCase().includes(searchText.toLowerCase()))
  );

  type Report = {
  month: string;
  pendapatan: number;
  pengeluaran: number;
  laba: number;
};

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

function formatRupiah(number: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
}

  return (
    <div className="flex-1 overflow-auto">
      <nav className="sticky top-0 z-10 w-full flex items-center justify-between bg-white px-6 py-6 shadow mb-2">
        <div className="flex items-center gap-2">
          <Icon icon="material-symbols-light:arrow-back-rounded" className="w-7 h-7 object-contain" onClick={() => navigate("/dashboard/owner")} />
          <Icon icon="uil:chart-bar" className="w-7 h-7 text-[#0065F8]" />
          <span className="text-lg font-bold text-gray-900">Laporan Keuangan</span>
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
          <CardStat icon={<Icon icon="tdesign:money" width={24} />} label="Total Pendapatan" value={`Rp ${stats.total_pendapatan.toLocaleString("id-ID")}`} subtitle="Dari tagihan lunas" iconColor="#06923E" />
          <CardStat icon={<Icon icon="humbleicons:calendar" width={24} />} label="Total Pengeluaran" value={`Rp ${stats.total_pengeluaran.toLocaleString("id-ID")}`} subtitle="Operasional & gaji" iconColor="#ED3500" />
          <CardStat icon={<Icon icon="humbleicons:calendar" width={24} />} label="Laba Bersih" value={`Rp ${stats.laba_bersih.toLocaleString("id-ID")}`} subtitle="Margin 20%" iconColor="#0065F8" />
          <CardStat icon={<Icon icon="healthicons:money-bag-outline" width={24} />} label="Rata-rata" value={`Rp ${stats.rata_rata.toLocaleString("id-ID")}`} subtitle="Per pembayaran" iconColor="#9B35EC" />
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => navigate("/dashboard/owner/laporan-keuangan")}
            className="flex items-center gap-2 px-4 py-2 rounded border border-gray-300 bg-white text-black font-semibold shadow">
            <Icon icon="mdi:credit-card-outline" width={18} />Bulanan
          </button>
          <button
            onClick={() => navigate("/dashboard/owner/laporan-pengeluaran")}
            className="flex items-center gap-2 px-4 py-2 rounded bg-red-700 text-white font-semibold shadow">
            <Icon icon="mdi:credit-card-outline" width={18} />Pengeluaran
          </button>
        </div>
        

       <div className="bg-white p-6 rounded-lg shadow mt-5 border">
         <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-6">
         <h3 className="text-3xl font-semibold">Breakdown Pengeluaran</h3>
       
         <button
           onClick={() => setOpenDialog(true)}
           className="flex items-center gap-2 px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 transition"
         >
           <Icon icon="ic:sharp-plus" className="w-5 h-5" />
           <span className="font-semibold">Tambah Pengeluaran</span>
         </button>
       </div>


          {openDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-md">
                <h2 className="text-xl font-bold mb-4">Tambah Pengeluaran Baru</h2>
                <form>
                  <input type="text" placeholder="Kategori" className="w-full border p-2 rounded mb-3" />
                  <input type="number" placeholder="Jumlah" className="w-full border p-2 rounded mb-3" />
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setOpenDialog(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                      Batal
                    </button>
                    <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                      Tambah Pengeluaran
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

      <div className="space-y-6 mt-6">
        {reports.map(({ month, pendapatan, pengeluaran, laba }) => {
          const margin = (laba / pendapatan) * 100;
          

          return (
            <div key={month} className="border p-4 rounded-lg shadow-sm relative">
              <div className="grid grid-cols-3  mb-3 justify-center">
                
                 <div>
                    <p className="text-sm text-gray-500">Untuk</p>
                    <p className="text-xl text-black font-semibold">Gaji Karyawan</p>
                 </div>
                 <div>
                    <p className="text-sm text-gray-500">Pengeluaran</p>
                    <p className="text-red-600 font-semibold">{formatRupiah(pengeluaran)}</p>
                 </div>
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
