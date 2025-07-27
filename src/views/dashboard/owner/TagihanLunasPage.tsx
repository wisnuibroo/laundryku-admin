import { Icon } from "@iconify/react";
import CardStat from "../../../components/CardStat";
import { useState, useEffect } from "react";
import Search from "../../../components/search";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../lib/axios";
import React from "react";

// Tipe data
interface Tagihan {
  id_pesanan: string;
  jenis: string;
  tanggal: string;
  jatuh_tempo: string;
  total: number;
  overdue: string;
  metode_pembayaran?: string;
  berat?: number;
}

interface Pelanggan {
  id: number;
  name: string;
  phone: string;
  jumlah_tagihan: number;
  total_tagihan: number;
  status: string;
  tagihan: Tagihan[];
  total_berat?: number;
}

export default function TagihanLunasPage() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Pelanggan | null>(
    null
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pelanggan, setPelanggan] = useState<Pelanggan[]>([]);

  const fetchTagihanLunas = async () => {
    try {
      setIsLoading(true);
      const userString = localStorage.getItem("user");
      if (!userString) {
        setIsLoading(false);
        return;
      }

      const idOwner = JSON.parse(userString)?.id;
      if (!idOwner) {
        setIsLoading(false);
        return;
      }

      const response = await axiosInstance.get("/tagihan/siap-ditagih", {
        params: { id_owner: idOwner },
      });

      const data = response.data.data;
      console.log('Data dari API (Lunas):', data);
      if(!Array.isArray(data)){
        console.log('Data bukan array', data);
        return;
      }
      
      // Filter data untuk pesanan dengan status "lunas"
      const lunasData = data.filter((item: any) => item.status === "lunas");
      
      // Kelompokkan berdasarkan nomor telepon
      const groupedByPhone = lunasData.reduce((acc: any, item: any) => {
        const phone = item.nomor || "-";
        if (!acc[phone]) {
          acc[phone] = {
            name: item.nama_pelanggan,
            phone: phone,
            tagihan: [],
            total_tagihan: 0,
            total_berat: 0
          };
        }
        
        // Tambahkan tagihan ke grup
        acc[phone].tagihan.push({
          id_pesanan: item.id.toString(),
          jenis: item.layanan || "-",
          tanggal: item.created_at,
          jatuh_tempo: item.updated_at,
          total: parseFloat(item.jumlah_harga) || 0,
          overdue: "-",
          metode_pembayaran: item.jenis_pembayaran || "Cash",
          berat: item.berat || 0,
        });
        
        // Update total
        acc[phone].total_tagihan += parseFloat(item.jumlah_harga) || 0;
        acc[phone].total_berat += parseFloat(item.berat) || 0;
        
        return acc;
      }, {});
      
      // Transformasi ke format yang dibutuhkan
      const transformedData = Object.values(groupedByPhone).map((group: any, index: number) => ({
        id: index + 1,
        name: group.name,
        phone: group.phone,
        jumlah_tagihan: group.tagihan.length,
        total_tagihan: group.total_tagihan,
        status: "Lunas",
        tagihan: group.tagihan,
        total_berat: group.total_berat
      })) as Pelanggan[];

      console.log('Data yang ditransformasi (Lunas):', transformedData);
      setPelanggan(transformedData);
    } catch (error) {
      console.error("Gagal ambil data tagihan lunas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTagihanLunas();
  }, []);

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
    const today = new Date().toISOString().split('T')[0];
    const pembayaranHariIni = pelanggan.filter(p => 
      p.tagihan.some(t => t.tanggal.startsWith(today))
    ).length;
    
    setStats({
      total_tagihan: pelanggan.reduce((acc, p) => acc + p.jumlah_tagihan, 0),
      total_pendapatan: pelanggan.reduce((acc, p) => acc + p.total_tagihan, 0),
      pembayaran_hari_ini: pembayaranHariIni,
      rata_rata: pelanggan.length > 0 ? Math.round(pelanggan.reduce((acc, p) => acc + p.total_tagihan, 0) / pelanggan.length) : 0,
    });
  }, [pelanggan]);

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
          <Icon
            icon="material-symbols-light:arrow-back-rounded"
            className="w-7 h-7 object-contain"
            onClick={() => navigate("/dashboard/owner")}
          />
          <Icon
            icon="mdi:tick-circle-outline"
            className="w-7 h-7 text-[#06923E]"
          />
          <span className="text-lg font-bold text-gray-900">Tagihan Lunas</span>
        </div>
        <div className="flex items-center gap-6">
          <button className="text-gray-500 hover:text-gray-700">
            <Icon icon="mdi:bell-outline" width={22} />
          </button>
          <div className="flex items-center gap-2">
            <Icon
              icon="mdi:account-circle-outline"
              width={22}
              className="text-gray-700"
            />
            <span className="text-sm text-gray-700">Owner</span>
          </div>
        </div>
      </nav>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <CardStat
            icon={<Icon icon="hugeicons:task-01" width={24} />}
            label="Total Tagihan"
            value={stats.total_tagihan.toString()}
            subtitle="Sudah lunas"
            iconColor="#06923E"
          />
          <CardStat
            icon={<Icon icon="tdesign:money" width={24} />}
            label="Total Pendapatan"
            value={`Rp ${stats.total_pendapatan.toLocaleString("id-ID")}`}
            subtitle="Dari tagihan lunas"
            iconColor="#06923E"
          />
          <CardStat
            icon={<Icon icon="humbleicons:calendar" width={24} />}
            label="Pembayaran Hari Ini"
            value={stats.pembayaran_hari_ini.toString()}
            subtitle="Transaksi hari ini"
            iconColor="#0065F8"
          />
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => navigate("/dashboard/owner/tagihan/belum-bayar")}
            className="flex items-center gap-2 px-4 py-2 rounded border border-gray-300 bg-white text-black font-semibold shadow"
          >
            <Icon icon="mdi:credit-card-outline" width={18} />
            Belum Bayar
          </button>
          <button
            onClick={() => navigate("/dashboard/owner/tagihan/lunas")}
            className="flex items-center gap-2 px-4 py-2 rounded bg-green-700 text-white font-semibold shadow"
          >
            <Icon icon="mdi:credit-card-outline" width={18} />
            Sudah Lunas
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mt-5 border">
          <h3 className="text-3xl font-semibold">Riwayat Tagihan Lunas</h3>
          <h2>Daftar semua pembayaran yang sudah diterima</h2>

          <div className="mt-3 flex flex-col md:flex-row items-center gap-3">
            <div className="w-full md:w-1/2">
              <Search value={searchText} onChange={handleSearchChange} />
            </div>
            {/* <div className="w-full md:w-auto">
              <select
                value={selectedDate}
                onChange={handleDateChange}
                className="w-full md:w-auto border rounded px-4 py-2 text-sm text-gray-700"
              >
                <option value="">Semua Tanggal</option>
                <option value="hari-ini">Hari Ini</option>
                <option value="minggu-ini">Minggu Ini</option>
                <option value="bulan-ini">Bulan Ini</option>
              </select>
            </div> */}
            {/* <div className="w-full md:w-auto">
              <button
                onClick={handleFilterClick}
                className="flex items-center gap-1 border rounded px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Icon icon="mdi:filter-outline" width={18} /> Filter
              </button>
            </div> */}
          </div>

          <div className="overflow-x-auto mt-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                  <p className="text-gray-600">Memuat data tagihan lunas...</p>
                </div>
              </div>
            ) : (
              <table className="min-w-full border text-sm rounded-lg overflow-hidden">
                <thead className="bg-gray-100 text-gray-600 text-sm">
                  <tr>
                    <th className="px-4 py-3 text-left">Pelanggan</th>
                    <th className="px-4 py-3 text-left">Jumlah Tagihan</th>
                    <th className="px-4 py-3 text-left">Total Tagihan</th>
                    <th className="px-4 py-3 text-left">Berat</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {filteredPelanggan.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        Tidak ada data tagihan lunas yang ditemukan
                      </td>
                    </tr>
                  ) : (
                    filteredPelanggan.map((cust) => (
                      <React.Fragment key={cust.id}>
                        <tr className="border-b bg-green-50 hover:bg-green-100">
                          <td className="px-4 py-3">
                            <p className="font-semibold">{cust.name}</p>
                            <p className="text-xs text-gray-500">{cust.phone}</p>
                          </td>
                          <td className="px-4 py-3">
                            {cust.jumlah_tagihan} tagihan
                          </td>
                          <td className="px-4 py-3 font-medium">
                            Rp {cust.total_tagihan.toLocaleString("id-ID")}
                          </td>
                          <td className="px-4 py-3 font-medium">
                            {cust.total_berat ? `${cust.total_berat} kg` : 'Berat tidak tersedia'}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs px-2 py-1 bg-green-500 text-white rounded-full">
                              ✓ {cust.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 flex gap-2">
                            <button
                              className="text-gray-700 hover:text-black"
                              onClick={() => setSelectedCustomer(cust)}
                            >
                              <Icon icon="proicons:eye" width={18} />
                            </button>
                          </td>
                        </tr>
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            )}
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
                  <span>📊</span>
                  <p>
                    <span className="font-medium text-gray-700">Total Tagihan:</span>{" "}
                    {selectedCustomer.jumlah_tagihan} pesanan
                  </p>
                </div>
                <div className="flex gap-2">
                  <span>💰</span>
                  <p>
                    <span className="font-medium text-gray-700">Total Pendapatan:</span>{" "}
                    Rp {selectedCustomer.total_tagihan.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span>⚖️</span>
                  <p>
                    <span className="font-medium text-gray-700">Total Berat:</span>{" "}
                    {selectedCustomer.total_berat ? `${selectedCustomer.total_berat} kg` : 'Tidak tersedia'}
                  </p>
                </div>
              </div>
            </div>

            {/* Detail Tagihan */}
            <div className="mb-4">
              <h3 className="font-semibold mb-3">Detail Pesanan ({selectedCustomer.jumlah_tagihan})</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {selectedCustomer.tagihan.map((tagihan, index) => (
                  <div
                    key={tagihan.id_pesanan}
                    className="border rounded-lg p-4 bg-green-50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-800">
                          Pesanan #{tagihan.id_pesanan}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(tagihan.tanggal).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-green-500 text-white rounded-full">
                        ✓ Lunas
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Layanan:</p>
                        <p className="font-medium">{tagihan.jenis}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Harga:</p>
                        <p className="font-medium">
                          Rp {tagihan.total.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Berat:</p>
                        <p className="font-medium">
                          {tagihan.berat ? `${tagihan.berat} kg` : 'Tidak tersedia'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Metode Pembayaran:</p>
                        <p className="font-medium">
                          {tagihan.metode_pembayaran || "Cash"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Pembayaran */}
            <div className="flex items-center justify-center bg-green-100 text-green-700 p-3 rounded font-medium gap-2">
              ✅ Semua Pembayaran Berhasil
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
