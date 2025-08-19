import { Icon } from "@iconify/react";
import CardStat from "../../../components/CardStat";
import { useState, useEffect } from "react";
import Search from "../../../components/search";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../lib/axios";
import { updatePesanan } from "../../../data/service/pesananService";
import React from "react";
import { useStateContext } from "../../../contexts/ContextsProvider";

// Tambahkan interface untuk notifikasi
interface Notification {
  message: string;
  type: "success" | "error";
}

interface Tagihan {
  id_pesanan: string;
  jenis: string;
  tanggal: string;
  jatuh_tempo: string;
  total: number;
  overdue: string;
  berat?: number; // Tambahkan berat sebagai opsional
  banyak_satuan?: number; // Tambahkan satuan sebagai opsional
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
  total_satuan?: number; // Tambahkan total satuan
}

export default function TagihanBlmByrPage() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Pelanggan | null>(
    null
  );
  const [openRowId, setOpenRowId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  // Tambahkan state untuk notifikasi
  const [notification, setNotification] = useState<Notification | null>(null);
  const [showOwnerMenu, setShowOwnerMenu] = useState(false);
  const { user } = useStateContext();

  const [stats, setStats] = useState({
    total_pelanggan: 0,
    total_tagihan: 0,
    nilai_tagihan: 0,
    overduedate: 0,
  });

  const [pelanggan, setPelanggan] = useState<Pelanggan[]>([]);

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

  const fetchTagihanBelumBayar = async () => {
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
      console.log("Data dari API:", data);
      if (!Array.isArray(data)) {
        console.log("Data bukan array", data);
        return;
      }
      // Filter data untuk pesanan dengan status "selesai"
      const selesaiData = data.filter((item: any) => item.status === "selesai");

      // Kelompokkan berdasarkan nomor telepon
      const groupedByPhone = selesaiData.reduce((acc: any, item: any) => {
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
          status: "Selesai",
          tagihan: group.tagihan,
          total_berat: group.total_berat,
          total_satuan: group.total_satuan,
        })
      ) as Pelanggan[];

      console.log("Data yang ditransformasi:", transformedData);
      setPelanggan(transformedData);
    } catch (error) {
      console.error("Gagal ambil data tagihan:", error);
    } finally {
      setIsLoading(false);
    }
  };



  // Fungsi untuk menampilkan notifikasi
  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    // Hilangkan notifikasi setelah 3 detik
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleMarkAsLunas = async (idPesanan: string) => {
    try {
      setIsUpdating(true);
      await updatePesanan(parseInt(idPesanan), { status: "lunas" });

      // Refresh data setelah update
      await fetchTagihanBelumBayar();

      showNotification("Pesanan berhasil ditandai sebagai lunas!", "success");
    } catch (error: any) {
      console.error("Gagal mengupdate status pesanan:", error);
      showNotification(
        error.message || "Gagal mengupdate status pesanan",
        "error"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkAllAsLunas = async (customer: Pelanggan) => {
    try {
      setIsUpdating(true);

      // Update semua pesanan dalam tagihan customer
      const updatePromises = customer.tagihan.map((tagihan) =>
        updatePesanan(parseInt(tagihan.id_pesanan), { status: "lunas" })
      );

      await Promise.all(updatePromises);

      // Refresh data setelah update
      await fetchTagihanBelumBayar();

      showNotification(
        `Semua ${customer.tagihan.length} pesanan ${customer.name} berhasil ditandai sebagai lunas!`,
        "success"
      );
    } catch (error: any) {
      console.error("Gagal mengupdate status pesanan:", error);
      showNotification(
        error.message || "Gagal mengupdate status pesanan",
        "error"
      );
    } finally {
      setIsUpdating(false);
      setSelectedCustomer(null); // tutup popup
    }
  };

  useEffect(() => {
    fetchTagihanBelumBayar();
  }, []);

  useEffect(() => {
    setStats({
      total_pelanggan: pelanggan.length,
      total_tagihan: pelanggan.reduce((acc, p) => acc + p.jumlah_tagihan, 0),
      nilai_tagihan: pelanggan.reduce((acc, p) => acc + p.total_tagihan, 0),
      overduedate: 2.9, // ini placeholder, bisa diganti dinamis nanti
    });
  }, [pelanggan]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const toggleRow = (id: number) => {
    setOpenRowId(openRowId === id ? null : id);
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
      {/* Tambahkan notifikasi di bagian atas */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            notification.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          <div className="flex items-center gap-2">
            <Icon
              icon={
                notification.type === "success"
                  ? "mdi:check-circle"
                  : "mdi:alert-circle"
              }
              className="w-5 h-5"
            />
            <p>{notification.message}</p>
          </div>
        </div>
      )}

      <nav className="sticky top-0 z-10 w-full flex items-center justify-between bg-white px-6 py-6 shadow mb-2">
        <div className="flex items-center gap-2">
          <Icon
            icon={"material-symbols-light:arrow-back-rounded"}
            className="w-7 h-7 object-contain cursor-pointer"
            onClick={() => navigate("/dashboard/owner")}
          />
          <Icon icon={"ion:card-outline"} className="w-7 h-7 text-[#DC2525]" />
          <span className="text-lg font-bold text-gray-900">
            Tagihan Belum Bayar
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <CardStat
            icon={<Icon icon="stash:user-group-duotone" width={24} />}
            label="Total Pelanggan"
            value={stats.total_pelanggan.toString()}
            subtitle="Punya tagihan"
            iconColor="#DC2525"
          />
          <CardStat
            icon={<Icon icon="tdesign:money" width={24} />}
            label="Total Pesanan"
            value={stats.total_tagihan.toString()}
            subtitle="Belum bayar"
            iconColor="#DC2525"
          />
          <CardStat
            icon={<Icon icon="hugeicons:task-01" width={24} />}
            label="Total Tagihan"
            value={`Rp ${stats.nilai_tagihan.toLocaleString("id-ID")}`}
            subtitle="Belum Lunas"
            iconColor="#DC2525"
          />
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => navigate("/dashboard/owner/tagihan/belum-bayar")}
            className="flex items-center gap-2 px-4 py-2 rounded bg-red-700 text-white font-semibold shadow"
          >
            <Icon icon="mdi:credit-card-outline" width={18} />
            Belum Bayar
          </button>
          <button
            onClick={() => navigate("/dashboard/owner/tagihan/lunas")}
            className="flex items-center gap-2 px-4 py-2 rounded border border-gray-300 bg-white text-black font-semibold shadow"
          >
            <Icon icon="mdi:credit-card-outline" width={18} />
            Sudah Lunas
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mt-5 border">
          <h3 className="text-3xl font-semibold">
            Tagihan Belum Bayar (Dikelompokkan per Pelanggan)
          </h3>
          <h2>Klik nama pelanggan untuk melihat detail tagihan</h2>

          <div className="mt-3 flex flex-col md:flex-row items-center gap-3">
            <div className="w-full md:w-1/2">
              <Search value={searchText} onChange={handleSearchChange} />
            </div>
          </div>

          <div className="overflow-x-auto mt-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                  <p className="text-gray-600">Memuat data tagihan...</p>
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
                      Tidak ada data tagihan yang ditemukan
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Semua tagihan sudah dibayar atau belum ada pesanan yang
                      selesai
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
                        className="bg-red-50 border-l-4 border-red-400 p-4 cursor-pointer hover:bg-red-100 transition-colors"
                        onClick={() => toggleRow(cust.id)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <div className="bg-red-100 p-2 rounded-full">
                              <Icon
                                icon="mdi:account-circle"
                                className="w-6 h-6 text-red-500"
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
                                    icon="mdi:calendar-clock"
                                    className="w-3 h-3"
                                  />
                                  <span>{cust.jumlah_tagihan} pesanan</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <div className="bg-red-500 text-white px-3 py-1 rounded text-sm">
                                Rp {cust.total_tagihan.toLocaleString("id-ID")}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAllAsLunas(cust);
                                }}
                                disabled={isUpdating}
                              >
                                <Icon
                                  icon="mdi:check-circle"
                                  className="w-3 h-3"
                                />
                                {isUpdating ? "Memproses..." : "Lunas Semua"}
                              </button>

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
                              Detail Pesanan ({cust.tagihan.length})
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
                                      </div>

                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                        <div className="flex items-center gap-2">
                                          <Icon
                                            icon="mdi:calendar"
                                            className="w-3 h-3 text-gray-400"
                                          />
                                          <div>
                                            <p className="text-gray-500 text-xs">
                                              Tanggal
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
                                            <p className="text-green-600">
                                              Rp{" "}
                                              {tgh.total.toLocaleString(
                                                "id-ID"
                                              )}
                                            </p>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          <Icon
                                            icon="mdi:clock-outline"
                                            className="w-3 h-3 text-gray-400"
                                          />
                                          <div>
                                            <p className="text-gray-500 text-xs">
                                              Status
                                            </p>
                                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">
                                              Belum Bayar
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="ml-3">
                                      <button
                                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleMarkAsLunas(tgh.id_pesanan);
                                        }}
                                        disabled={isUpdating}
                                      >
                                        <Icon
                                          icon="mdi:check"
                                          className="w-3 h-3"
                                        />
                                        {isUpdating
                                          ? "Memproses..."
                                          : "Tandai Lunas"}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Summary Section */}
                            <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <Icon
                                    icon="mdi:calculator"
                                    className="w-4 h-4 text-red-500"
                                  />
                                  <span className="text-red-700">
                                    Total Tagihan
                                  </span>
                                </div>
                                <div className="text-right">
                                  <p className="text-xl text-red-600">
                                    Rp{" "}
                                    {cust.total_tagihan.toLocaleString("id-ID")}
                                  </p>
                                  <p className="text-sm text-red-500">
                                    {cust.jumlah_tagihan} pesanan{" "}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-2xl rounded-lg shadow-lg relative flex flex-col max-h-[90vh]">
            {/* Tombol Close */}
            <button
              className="absolute top-2 right-3 text-xl text-gray-600 hover:text-black"
              onClick={() => setSelectedCustomer(null)}
            >
              &times;
            </button>

            {/* Header & Info Pelanggan */}
            <div className="p-6 pb-3 border-b">
              <h2 className="text-xl font-bold mb-4">
                Detail Tagihan - {selectedCustomer.name}
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Nama Pelanggan</p>
                  <p className="font-semibold">{selectedCustomer.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Telepon</p>
                  <p>{selectedCustomer.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total Tagihan</p>
                  <p className="text-red-600 font-semibold">
                    Rp {selectedCustomer.total_tagihan.toLocaleString("id-ID")}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Jumlah Pesanan</p>
                  <p className="font-semibold">
                    {selectedCustomer.tagihan.length} pesanan
                  </p>
                </div>
              </div>
            </div>

            {/* List Pesanan Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {selectedCustomer.tagihan.map((tgh, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center border rounded p-3 bg-red-50"
                >
                  <div>
                    <p className="font-semibold">{tgh.id_pesanan}</p>
                    <p className="text-xs text-gray-500">{tgh.jenis}</p>
                  </div>
                  <p className="text-sm">
                    Tanggal:{" "}
                    {new Date(tgh.tanggal).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>

                  <div className="text-sm font-medium text-right">
                    <p>Rp {tgh.total.toLocaleString("id-ID")}</p>
                    <p className="text-xs text-blue-600">
                      {getUnitDisplay(tgh.jenis, tgh.berat, tgh.banyak_satuan)}
                    </p>
                  </div>
                  <div>
                    <button
                      className="text-sm px-3 py-1 bg-green-300 hover:bg-green-200 rounded text-gray-800"
                      onClick={() => handleMarkAsLunas(tgh.id_pesanan)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? "Memproses..." : "Tandai Lunas"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Tombol Tandai Semua Lunas */}
            <div className="p-4 border-t flex justify-end bg-white">
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={() => handleMarkAllAsLunas(selectedCustomer)}
                disabled={isUpdating}
              >
                {isUpdating ? "Memproses..." : "Tandai Semua Lunas"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
