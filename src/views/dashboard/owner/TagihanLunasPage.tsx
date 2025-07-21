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

export default function TagihanLunasPage() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Pelanggan | null>(null);
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
    total_tagihan: 0,
    total_pendapatan: 0,
    pembayaran_hari_ini: 0,
    rata_rata: 0,
  });

  useEffect(() => {
    // Simulasi fetch data
    setStats({
      total_tagihan: 29,
      total_pendapatan: 30000,
      pembayaran_hari_ini: 4,
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

  return (
    <div className="flex-1 overflow-auto">
      <nav className="sticky top-0 z-10 w-full flex items-center justify-between bg-white px-6 py-6 shadow mb-2">
        <div className="flex items-center gap-2">
          <Icon icon="material-symbols-light:arrow-back-rounded" className="w-7 h-7 object-contain" onClick={() => navigate("/dashboard/owner")} />
          <Icon icon="mdi:tick-circle-outline" className="w-7 h-7 text-[#06923E]" />
          <span className="text-lg font-bold text-gray-900">Tagihan Lunas</span>
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
          <CardStat icon={<Icon icon="hugeicons:task-01" width={24} />} label="Total Tagihan" value={stats.total_tagihan.toString()} subtitle="Sudah lunas" iconColor="#06923E" />
          <CardStat icon={<Icon icon="tdesign:money" width={24} />} label="Total Pendapatan" value={`Rp ${stats.total_pendapatan.toLocaleString("id-ID")}`} subtitle="Dari tagihan lunas" iconColor="#06923E" />
          <CardStat icon={<Icon icon="humbleicons:calendar" width={24} />} label="Pembayaran Hari Ini" value={stats.pembayaran_hari_ini.toString()} subtitle="Transaksi hari ini" iconColor="#0065F8" />
          <CardStat icon={<Icon icon="healthicons:money-bag-outline" width={24} />} label="Rata-rata" value={`Rp ${stats.rata_rata.toLocaleString("id-ID")}`} subtitle="Per pembayaran" iconColor="#9B35EC" />
        </div>

        <div className="flex gap-4 mb-6">
          <button onClick={() => navigate("/dashboard/owner/tagihan/belum-bayar")} className="flex items-center gap-2 px-4 py-2 rounded border border-gray-300 bg-white text-black font-semibold shadow">
            <Icon icon="mdi:credit-card-outline" width={18} />Belum Bayar
          </button>
          <button onClick={() => navigate("/dashboard/owner/tagihan/lunas")} className="flex items-center gap-2 px-4 py-2 rounded bg-green-700 text-white font-semibold shadow">
            <Icon icon="mdi:credit-card-outline" width={18} />Sudah Lunas
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mt-5">
          <h3 className="text-3xl font-semibold">Riwayat Tagihan Lunas</h3>
          <h2>Daftar semua pembayaran yang sudah diterima</h2>

          <div className="mt-3 flex flex-col md:flex-row items-center gap-3">
            <div className="w-full md:w-1/2">
              <Search value={searchText} onChange={handleSearchChange} />
            </div>
            <div className="w-full md:w-auto">
              <select value={selectedDate} onChange={handleDateChange} className="w-full md:w-auto border rounded px-4 py-2 text-sm text-gray-700">
                <option value="">Semua Tanggal</option>
                <option value="hari-ini">Hari Ini</option>
                <option value="minggu-ini">Minggu Ini</option>
                <option value="bulan-ini">Bulan Ini</option>
              </select>
            </div>
            <div className="w-full md:w-auto">
              <button onClick={handleFilterClick} className="flex items-center gap-1 border rounded px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <Icon icon="mdi:filter-outline" width={18} /> Filter
              </button>
            </div>
          </div>

          <div className="overflow-x-auto mt-6">
            <table className="min-w-full border text-sm rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-gray-600 text-sm">
                <tr>
                  <th className="px-4 py-3 text-left">ID Pesanan</th>
                  <th className="px-4 py-3 text-left">Pelanggan</th>
                  <th className="px-4 py-3 text-left">Jumlah Tagihan</th>
                  <th className="px-4 py-3 text-left">Total Tagihan</th>
                  <th className="px-4 py-3 text-left">Status Terburuk</th>
                  <th className="px-4 py-3 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {filteredPelanggan.map((cust) => (
                  <React.Fragment key={cust.id}>
                    <tr className="border-b bg-green-50">
                      <td className="px-4 py-3">{cust.id_pesanan}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold">{cust.name}</p>
                        <p className="text-xs text-gray-500">{cust.phone}</p>
                      </td>
                      <td className="px-4 py-3">{cust.jumlah_tagihan} tagihan</td>
                      <td className="px-4 py-3 font-medium">Rp {cust.total_tagihan.toLocaleString("id-ID")}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 bg-red-500 text-white rounded-full">
                          Status {cust.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium">
                          Lunas Semua
                        </button>
                        <button className="text-gray-700 hover:text-black" onClick={() => setSelectedCustomer(cust)}>
                          <Icon icon="proicons:eye" width={18} />
                        </button>
                      </td>
                    </tr>  
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

       {/* Modal Detail di luar tabel */}
      {selectedCustomer && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white w-[90%] max-w-2xl rounded-lg p-6 shadow-lg relative">
      <button
        className="absolute top-2 right-3 text-xl text-gray-600 hover:text-black"
        onClick={() => setSelectedCustomer(null)}
      >
        &times;
      </button>

      <h2 className="text-xl font-bold mb-4">Detail Pembayaran</h2>

      {/* Info Ringkas */}
      <div className="bg-green-50 rounded-md p-4 grid grid-cols-2 gap-4 text-sm mb-4">
        <div>
          <p className="text-gray-500">ID Pesanan</p>
          <p className="font-bold">{selectedCustomer.tagihan[0].id_pesanan}</p>
        </div>
        <div>
          <p className="text-gray-500">Jumlah Bayar</p>
          <p className="text-green-600 font-bold text-lg">
            Rp {selectedCustomer.tagihan[0].total.toLocaleString("id-ID")}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Tanggal Pesanan</p>
          <p>{selectedCustomer.tagihan[0].tanggal}</p>
        </div>
        <div>
          <p className="text-gray-500">Tanggal Bayar</p>
          <p>{selectedCustomer.tagihan[0].jatuh_tempo}</p>
        </div>
      </div>

      {/* Info Pelanggan */}
      <div className="bg-gray-50 p-4 rounded-md mb-4 text-sm">
        <h3 className="font-semibold mb-3">Informasi Pelanggan</h3>
        <div className="space-y-2">
          <div className="flex gap-2">
            <span>👤</span>
            <p>
              <span className="font-medium text-gray-700">Nama:</span>{" "}
              {selectedCustomer.name}
            </p>
          </div>
          <div className="flex gap-2">
            <span>📞</span>
            <p>
              <span className="font-medium text-gray-700">Telepon:</span>{" "}
              {selectedCustomer.phone}
            </p>
          </div>
          <div className="flex gap-2">
            <span>📋</span>
            <p>
              <span className="font-medium text-gray-700">Layanan:</span>{" "}
              {selectedCustomer.tagihan[0].jenis}
            </p>
          </div>
          <div className="flex gap-2">
            <span>💳</span>
            <p>
              <span className="font-medium text-gray-700">Metode Bayar:</span>{" "}
              {selectedCustomer.tagihan[0].metode_pembayaran}
            </p>
          </div>
        </div>
      </div>

      {/* Status Pembayaran */}
      <div className="flex items-center justify-center bg-green-100 text-green-700 p-3 rounded mb-4 font-medium gap-2">
        ✅ Pembayaran Berhasil
      </div>

       
    </div>
  </div>
)}

    </div>
  );
}
