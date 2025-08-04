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
  type: 'success' | 'error';
}

interface Tagihan {
  id_pesanan: string;
  jenis: string;
  tanggal: string;
  jatuh_tempo: string;
  total: number;
  overdue: string;
  berat?: number; // Tambahkan berat sebagai opsional
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

export default function TagihanBlmByrPage() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Pelanggan | null>(null);
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
          berat: item.berat || 0,
        });

        // Update total
        acc[phone].total_tagihan += parseFloat(item.jumlah_harga) || 0;
        acc[phone].total_berat += parseFloat(item.berat) || 0;

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
  const showNotification = (message: string, type: 'success' | 'error') => {
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
      showNotification(error.message || "Gagal mengupdate status pesanan", "error");
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
      showNotification(error.message || "Gagal mengupdate status pesanan", "error");
    } finally {
      setIsUpdating(false);
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
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}
        >
          <div className="flex items-center gap-2">
            <Icon
              icon={notification.type === 'success' ? 'mdi:check-circle' : 'mdi:alert-circle'}
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
            <Icon icon="mdi:account-circle-outline" width={24} className="text-gray-700" />
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
            icon={
              <Icon
                icon="hugeicons:task-01"
                width={24}
              />
            }
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
            {/* <div className="w-full md:w-auto">
              <button
                onClick={handleFilterClick}
                className="flex items-center gap-1 border rounded px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Icon icon="mdi:filter-variant" width={16} />
                Filter
              </button>
            </div> */}
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
              <table className="min-w-full border text-sm rounded-lg overflow-hidden">
                <thead className="bg-gray-100 text-gray-600 text-sm">
                  <tr>
                    <th className="px-4 py-3 text-left">Pelanggan</th>
                    <th className="px-4 py-3 text-left">Jumlah Tagihan</th>
                    <th className="px-4 py-3 text-left">Total Tagihan</th>
                    <th className="px-4 py-3 text-left">Berat</th>
                    <th className="px-4 py-3 text-left">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {filteredPelanggan.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        Tidak ada data tagihan yang ditemukan
                      </td>
                    </tr>
                  ) : (
                    filteredPelanggan.map((cust) => (
                      <React.Fragment key={cust.id}>
                        <tr
                          className="border-b bg-red-50 hover:bg-red-100 cursor-pointer"
                          onClick={() => toggleRow(cust.id)}
                        >
                          <td className="px-4 py-3">
                            <p className="font-semibold">{cust.name}</p>
                            <p className="text-xs text-gray-500">
                              {cust.phone}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            {cust.jumlah_tagihan} tagihan
                          </td>
                          <td className="px-4 py-3 font-medium">
                            Rp {cust.total_tagihan.toLocaleString("id-ID")}
                          </td>
                          <td className="px-4 py-3 font-medium">
                            {cust.total_berat
                              ? `${cust.total_berat} kg`
                              : "Berat tidak tersedia"}
                          </td>
                          <td className="px-4 py-3 flex gap-2">
                            <button
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAllAsLunas(cust);
                              }}
                              disabled={isUpdating}
                            >
                              {isUpdating ? "Memproses..." : "Lunas Semua"}
                            </button>
                            <button
                              className="text-gray-700 hover:text-black"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCustomer(cust);
                              }}
                            >
                              <Icon icon="proicons:eye" width={18} />
                            </button>
                          </td>
                        </tr>
                        {openRowId === cust.id && (
                          <tr>
                            <td colSpan={5}>
                              <div className="   ">
                                {cust.tagihan.map((tgh, idx) => (
                                  <div
                                    key={idx}
                                    className="flex justify-between items-center border rounded p-3 bg-white shadow-sm"
                                  >
                                    <div>
                                      <p className="font-semibold">
                                        {tgh.id_pesanan}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {tgh.jenis}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm">
                                        Tanggal: {tgh.tanggal}
                                      </p>
                                    </div>
                                    <div className="text-sm font-medium">
                                      Rp {tgh.total.toLocaleString("id-ID")}
                                    </div>
                                    <div className="text-sm font-medium">
                                      {tgh.berat} Kg
                                    </div>
                                    <div>
                                      <button
                                        className="text-sm px-3 py-1 bg-green-500 hover:bg-green-200 rounded text-white"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleMarkAsLunas(tgh.id_pesanan);
                                        }}
                                        disabled={isUpdating}
                                      >
                                        {isUpdating
                                          ? "Memproses..."
                                          : "Tandai Lunas"}
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-2xl rounded-lg p-6 shadow-lg relative">
            <button
              className="absolute top-2 right-3 text-xl text-gray-600 hover:text-black"
              onClick={() => setSelectedCustomer(null)}
            >
              &times;
            </button>

            <h2 className="text-xl font-bold mb-4">
              Detail Tagihan - {selectedCustomer.name}
            </h2>
            <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
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

            <h3 className="text-lg font-semibold mb-2">Rincian Tagihan</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {selectedCustomer.tagihan.map((tgh, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center border rounded p-3 bg-red-50"
                >
                  <div>
                    <p className="font-semibold">{tgh.id_pesanan}</p>
                    <p className="text-xs text-gray-500">{tgh.jenis}</p>
                  </div>
                  <div>
                    <p className="text-sm">Tanggal: {tgh.tanggal}</p>
                    {/* <p className="text-xs text-gray-500">
                      Due: {tgh.jatuh_tempo}
                    </p> */}
                  </div>
                  <div className="text-sm font-medium">
                    <p>Rp {tgh.total.toLocaleString("id-ID")}</p>
                    <p className="text-xs text-blue-600">
                      {tgh.berat
                        ? `Berat: ${tgh.berat} kg`
                        : "Berat tidak tersedia"}
                    </p>
                  </div>
                  {/* <div>
                    <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full">
                      Overdue {tgh.overdue}
                    </span>
                  </div> */}
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
              <div className="flex justify-end mt-4">
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
        </div>
      )}
    </div>
  );
}
