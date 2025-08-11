import { Icon } from "@iconify/react";
import CardStat from "../../../components/CardStat";
import { useState, useEffect } from "react";
import Search from "../../../components/search";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../lib/axios";
import React from "react";
import { useStateContext } from "../../../contexts/ContextsProvider";

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
  banyak_satuan?: number;
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
  total_satuan?: number;
}

export default function TagihanLunasPage() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Pelanggan | null>(
    null
  );
  const [openRowId, setOpenRowId] = useState<number | null>(null); // Tambahkan state untuk expandable rows
  const [isLoading, setIsLoading] = useState(true);
  const [pelanggan, setPelanggan] = useState<Pelanggan[]>([]);
  const [showOwnerMenu, setShowOwnerMenu] = useState(false); // Tambahkan state untuk dropdown menu
  const [stats, setStats] = useState({
    total_tagihan: 0,
    total_pendapatan: 0,
  });
  const { user } = useStateContext();

  // Fungsi untuk menentukan unit berdasarkan jenis layanan
  const getUnitDisplay = (layanan: string, berat?: number, satuan?: number) => {
    const layananLower = layanan.toLowerCase();

    // Check if it's kiloan service
    if (layananLower.includes("kiloan") || layananLower.includes("kg")) {
      return berat ? `${berat} kg` : "Berat tidak tersedia";
    }

    // Check if it's satuan service
    if (layananLower.includes("satuan") || layananLower.includes("item")) {
      return satuan ? `${satuan} item` : "Jumlah tidak tersedia";
    }

    // Default: prioritize berat if available, otherwise satuan
    if (berat && berat > 0) {
      return `${berat} kg`;
    } else if (satuan && satuan > 0) {
      return `${satuan} item`;
    }

    return "Tidak tersedia";
  };

  // Fungsi untuk menampilkan unit di tabel customer
  const getCustomerUnitDisplay = (customer: Pelanggan) => {
    // Ambil jenis layanan dari tagihan pertama untuk menentukan tipe dominan
    const firstLayanan = customer.tagihan[0]?.jenis || "";
    const layananLower = firstLayanan.toLowerCase();

    if (layananLower.includes("kiloan") || layananLower.includes("kg")) {
      return customer.total_berat
        ? `${customer.total_berat} kg`
        : "Berat tidak tersedia";
    } else if (
      layananLower.includes("satuan") ||
      layananLower.includes("item")
    ) {
      return customer.total_satuan
        ? `${customer.total_satuan} item`
        : "Jumlah tidak tersedia";
    }

    // Default: tampilkan yang tersedia
    if (customer.total_berat && customer.total_berat > 0) {
      return `${customer.total_berat} kg`;
    } else if (customer.total_satuan && customer.total_satuan > 0) {
      return `${customer.total_satuan} item`;
    }

    return "Tidak tersedia";
  };

  // Tambahkan fungsi untuk toggle expandable rows
  const toggleRow = (id: number) => {
    setOpenRowId(openRowId === id ? null : id);
  };

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
      console.log("Data dari API (Lunas):", data);
      if (!Array.isArray(data)) {
        console.log("Data bukan array", data);
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
            total_berat: 0,
            total_satuan: 0,
          };
        }

        // Tambahkan tagihan ke grup
        acc[phone].tagihan.push({
          id_pesanan: item.id.toString(),
          jenis:
            typeof item.layanan === "string"
              ? item.layanan
              : (item.layanan as any)?.nama_layanan || "-",
          tanggal: item.created_at,
          jatuh_tempo: item.updated_at,
          total: parseFloat(item.jumlah_harga) || 0,
          overdue: "-",
          metode_pembayaran: item.jenis_pembayaran || "Cash",
          berat: item.berat || 0,
          banyak_satuan: item.banyak_satuan || 0,
        });

        // Update total
        acc[phone].total_tagihan += parseFloat(item.jumlah_harga) || 0;
        acc[phone].total_berat += parseFloat(item.berat) || 0;
        acc[phone].total_satuan += parseFloat(item.banyak_satuan) || 0;

        return acc;
      }, {});

      // Transformasi ke format yang dibutuhkan
      const transformedData = Object.values(groupedByPhone).map(
        (group: any, index: number) => ({
          id: index + 1,
          name: group.name,
          phone: group.phone,
          jumlah_tagihan: group.tagihan.length,
          total_tagihan: group.total_tagihan,
          status: "Lunas",
          tagihan: group.tagihan,
          total_berat: group.total_berat,
          total_satuan: group.total_satuan,
        })
      ) as Pelanggan[];

      console.log("Data yang ditransformasi (Lunas):", transformedData);
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

  useEffect(() => {
    setStats({
      total_tagihan: pelanggan.reduce((acc, p) => acc + p.jumlah_tagihan, 0),
      total_pendapatan: pelanggan.reduce((acc, p) => acc + p.total_tagihan, 0),
    });
  }, [pelanggan]);

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
    ].some((field) => field.toLowerCase().includes(searchText.toLowerCase()))
  );

  return (
    <div className="flex-1 overflow-auto">
      <nav className="sticky top-0 z-10 w-full flex items-center justify-between bg-white px-6 py-6 shadow mb-2">
        <div className="flex items-center gap-2">
          <Icon
            icon="material-symbols-light:arrow-back-rounded"
            className="w-7 h-7 object-contain cursor-pointer"
            onClick={() => navigate("/dashboard/owner")}
          />
          <Icon
            icon="mdi:tick-circle-outline"
            className="w-7 h-7 text-[#06923E]"
          />
          <span className="text-lg font-bold text-gray-900">Tagihan Lunas</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
          <h2>Klik nama pelanggan untuk melihat detail pembayaran</h2>

          <div className="mt-3 flex flex-col md:flex-row items-center gap-3">
            <div className="w-full md:w-1/2">
              <Search value={searchText} onChange={handleSearchChange} />
            </div>
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
              <div className="space-y-3">
                {filteredPelanggan.length === 0 ? (
                  <div className="bg-white rounded-lg border p-8 text-center">
                    <Icon
                      icon="mdi:inbox-outline"
                      className="w-12 h-12 mx-auto text-gray-300 mb-3"
                    />
                    <p className="text-gray-500">
                      Tidak ada data tagihan lunas yang ditemukan
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Belum ada pembayaran yang selesai atau semua tagihan masih
                      dalam proses
                    </p>
                  </div>
                ) : (
                  filteredPelanggan.map((cust) => (
                    <div
                      key={cust.id}
                      className="bg-white rounded-lg border hover:shadow-sm transition-shadow"
                    >
                      {/* Customer Header */}
                      <div
                        className="bg-green-50 border-l-4 border-green-400 p-4 cursor-pointer hover:bg-green-100 transition-colors"
                        onClick={() => toggleRow(cust.id)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <div className="bg-green-100 p-2 rounded-full">
                              <Icon
                                icon="mdi:account-circle"
                                className="w-6 h-6 text-green-500"
                              />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-800">
                                {cust.name}
                              </h3>
                              <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                <div className="flex items-center gap-1">
                                  <Icon icon="mdi:phone" className="w-3 h-3" />
                                  <span>{cust.phone}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Icon
                                    icon="mdi:calendar-check"
                                    className="w-3 h-3"
                                  />
                                  <span>
                                    {cust.jumlah_tagihan} pembayaran selesai
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <div className="bg-green-500 text-white px-3 py-1 rounded text-sm">
                                Rp {cust.total_tagihan.toLocaleString("id-ID")}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCustomer(cust);
                                }}
                              >
                                <Icon icon="mdi:eye" className="w-3 h-3" />
                              </button>

                              <button className="text-gray-400 hover:text-gray-600 p-1 transition-colors">
                                <Icon
                                  icon={
                                    openRowId === cust.id
                                      ? "mdi:chevron-up"
                                      : "mdi:chevron-down"
                                  }
                                  className="w-4 h-4"
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {openRowId === cust.id && (
                        <div className="border-t bg-gray-50">
                          <div className="p-4">
                            <h4 className="text-gray-700 mb-3 flex items-center gap-2">
                              <Icon
                                icon="mdi:format-list-bulleted"
                                className="w-4 h-4"
                              />
                              Detail Pembayaran ({cust.tagihan.length})
                            </h4>
                            <div className="grid gap-3">
                              {cust.tagihan.map((tgh, idx) => (
                                <div
                                  key={idx}
                                  className="bg-white rounded border p-3 hover:shadow-sm transition-shadow"
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1 space-y-2">
                                      <div className="flex items-center gap-2">
                                        <div className="bg-blue-100 px-2 py-1 rounded">
                                          <span className="text-blue-700 text-sm">
                                            #{tgh.id_pesanan}
                                          </span>
                                        </div>
                                        <div className="bg-purple-100 px-2 py-1 rounded">
                                          <span className="text-purple-700 text-sm">
                                            {tgh.jenis}
                                          </span>
                                        </div>
                                        <div className="bg-green-100 px-2 py-1 rounded">
                                          <span className="text-green-700 text-xs font-medium">
                                            ✓ LUNAS
                                          </span>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                                        <div className="flex items-center gap-2">
                                          <Icon
                                            icon="mdi:calendar"
                                            className="w-3 h-3 text-gray-400"
                                          />
                                          <div>
                                            <p className="text-gray-500 text-xs">
                                              Tanggal Pesanan
                                            </p>
                                            <p className="text-gray-700">
                                              {new Date(
                                                tgh.tanggal
                                              ).toLocaleDateString("id-ID", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                              })}
                                            </p>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          <Icon
                                            icon="mdi:calendar-check"
                                            className="w-3 h-3 text-gray-400"
                                          />
                                          <div>
                                            <p className="text-gray-500 text-xs">
                                              Tanggal Bayar
                                            </p>
                                            <p className="text-green-600">
                                              {new Date(
                                                tgh.jatuh_tempo
                                              ).toLocaleDateString("id-ID", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                              })}
                                            </p>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          <Icon
                                            icon="mdi:scale"
                                            className="w-3 h-3 text-gray-400"
                                          />
                                          <div>
                                            <p className="text-gray-500 text-xs">
                                              Kuantitas
                                            </p>
                                            <p className="text-blue-600">
                                              {getUnitDisplay(
                                                tgh.jenis,
                                                tgh.berat,
                                                tgh.banyak_satuan
                                              )}
                                            </p>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          <Icon
                                            icon="mdi:currency-usd"
                                            className="w-3 h-3 text-gray-400"
                                          />
                                          <div>
                                            <p className="text-gray-500 text-xs">
                                              Harga
                                            </p>
                                            <p className="text-green-600 font-medium">
                                              Rp{" "}
                                              {tgh.total.toLocaleString(
                                                "id-ID"
                                              )}
                                            </p>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          <Icon
                                            icon="mdi:credit-card"
                                            className="w-3 h-3 text-gray-400"
                                          />
                                          <div>
                                            <p className="text-gray-500 text-xs">
                                              Metode Bayar
                                            </p>
                                            <p className="text-gray-700">
                                              {tgh.metode_pembayaran || "Cash"}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Summary Section */}
                            <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <Icon
                                    icon="mdi:calculator"
                                    className="w-4 h-4 text-green-500"
                                  />
                                  <span className="text-green-700 font-medium">
                                    Total Pendapatan
                                  </span>
                                </div>
                                <div className="text-right">
                                  <p className="text-xl text-green-600 font-bold">
                                    Rp{" "}
                                    {cust.total_tagihan.toLocaleString("id-ID")}
                                  </p>
                                  <p className="text-sm text-green-500">
                                    {cust.jumlah_tagihan} pembayaran selesai{" "}
                                    {/* {getCustomerUnitDisplay(cust)} */}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-hidden">
          <div className="bg-white w-[90%] max-w-3xl rounded-lg shadow-lg relative max-h-[90vh] flex flex-col">
            <button
              className="absolute top-4 right-4 text-2xl text-gray-600 hover:text-black z-10"
              onClick={() => setSelectedCustomer(null)}
            >
              &times;
            </button>

            <div className="p-6 overflow-y-auto">
              {/* Header */}
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Detail Pembayaran Selesai
                </h2>
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <Icon icon="mdi:check-circle" className="w-4 h-4" />
                  <span className="font-medium">Semua pembayaran berhasil</span>
                </div>
              </div>

              {/* Info Pelanggan */}
              <div className="bg-green-50 p-4 rounded-lg mb-6 border border-green-200 text-sm">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-base">
                  <Icon
                    icon="mdi:account-circle"
                    className="w-5 h-5 text-green-600"
                  />
                  Informasi Pelanggan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon
                        icon="mdi:account"
                        className="w-4 h-4 text-gray-500"
                      />
                      <div>
                        <p className="text-xs text-gray-500">Nama Pelanggan</p>
                        <p className="font-semibold text-gray-800">
                          {selectedCustomer.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon
                        icon="mdi:phone"
                        className="w-4 h-4 text-gray-500"
                      />
                      <div>
                        <p className="text-xs text-gray-500">Nomor Telepon</p>
                        <p className="font-semibold text-gray-800">
                          {selectedCustomer.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon
                        icon="mdi:receipt"
                        className="w-4 h-4 text-gray-500"
                      />
                      <div>
                        <p className="text-xs text-gray-500">
                          Total Pembayaran
                        </p>
                        <p className="font-semibold text-gray-800">
                          {selectedCustomer.jumlah_tagihan} pesanan
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon icon="mdi:cash" className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">
                          Total Pendapatan
                        </p>
                        <p className="font-bold text-green-600 text-base">
                          Rp{" "}
                          {selectedCustomer.total_tagihan.toLocaleString(
                            "id-ID"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail Pembayaran */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Icon
                    icon="mdi:format-list-bulleted"
                    className="w-5 h-5 text-blue-600"
                  />
                  Rincian Pembayaran ({selectedCustomer.jumlah_tagihan} pesanan)
                </h3>
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {selectedCustomer.tagihan.map((tagihan) => (
                    <div
                      key={tagihan.id_pesanan}
                      className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow text-sm"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-100 px-2 py-0.5 rounded-full text-xs font-medium text-blue-700">
                            Pesanan #{tagihan.id_pesanan}
                          </div>
                          <div className="bg-green-100 px-2 py-0.5 rounded-full text-xs font-medium text-green-700 flex items-center gap-1">
                            <Icon icon="mdi:check" className="w-3 h-3" />
                            LUNAS
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-bold text-green-600">
                            Rp {tagihan.total.toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>

                      {/* Info pesanan */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div>
                          <p className="text-gray-500 mb-1">Layanan</p>
                          <p className="font-medium text-gray-800 bg-purple-50 px-2 py-0.5 rounded">
                            {tagihan.jenis}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Kuantitas</p>
                          <p className="font-medium text-blue-600">
                            {getUnitDisplay(
                              tagihan.jenis,
                              tagihan.berat,
                              tagihan.banyak_satuan
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Tanggal Pesanan</p>
                          <p className="font-medium text-gray-800">
                            {new Date(tagihan.tanggal).toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">
                            Metode Pembayaran
                          </p>
                          <p className="font-medium text-gray-800 bg-gray-50 px-2 py-0.5 rounded">
                            {tagihan.metode_pembayaran || "Cash"}
                          </p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="mt-3 pt-2 border-t border-gray-100 text-xs flex justify-between">
                        <span className="text-gray-500">
                          Tanggal Pembayaran:
                        </span>
                        <span className="font-medium text-green-600">
                          {new Date(tagihan.jatuh_tempo).toLocaleDateString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
