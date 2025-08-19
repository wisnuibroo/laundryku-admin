import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import Search from "../../../components/search";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../../../contexts/ContextsProvider";
import { Layanan } from "../../../data/model/Pesanan";
import {
  getLayananByOwner,
} from "../../../data/service/ApiService";
import axiosInstance from "../../../lib/axios";

export default function LayananPage() {
  const navigate = useNavigate();
  const { user } = useStateContext();
  const [openDialog, setOpenDialog] = useState(false);
  const [showOwnerMenu, setShowOwnerMenu] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [layananList, setLayananList] = useState<Layanan[]>([]);
  const [loadingLayanan, setLoadingLayanan] = useState(false);

  // Form state for adding new service
  const [formData, setFormData] = useState<{
    nama_layanan: string;
    kategori: string;
    harga_layanan: string;
    satuan: string;
    waktu_pengerjaan: string;
    status: "aktif" | "nonaktif";
    keterangan_layanan: string;
    tipe: "Kiloan" | "Satuan";
  }>({
    nama_layanan: "",
    kategori: "",
    harga_layanan: "",
    satuan: "kg",
    waktu_pengerjaan: "",
    status: "aktif",
    keterangan_layanan: "",
    tipe: "Kiloan",
  });

  useEffect(() => {
    if (user?.id) {
      fetchLayanan();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchLayanan = async () => {
    try {
      setLoadingLayanan(true);
      setLoading(true);
      console.log("🔍 Fetching layanan for owner ID:", user?.id);

      let data: Layanan[] = [];

      // Pastikan user ada dan punya ID
      if (!user?.id) {
        throw new Error("User ID tidak ditemukan. Silakan login ulang.");
      }

      try {
        // PERBAIKAN: Gunakan query parameter untuk filter berdasarkan owner
        const token = localStorage.getItem("ACCESS_TOKEN");
        const url = `https://laundryku.rplrus.com/api/layanan?id_owner=${user.id}`;

        console.log("📡 Requesting URL:", url);

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        console.log("📊 Response status:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseData = await response.json();
        console.log("📊 Response data:", responseData);

        // Handle different response formats
        if (responseData.success && Array.isArray(responseData.data)) {
          data = responseData.data;
        } else if (Array.isArray(responseData)) {
          data = responseData;
        } else {
          throw new Error("Format response tidak sesuai");
        }

        // PERBAIKAN: Filter di frontend juga sebagai backup
        data = data.filter((layanan) => layanan.id_owner === Number(user.id));

        console.log("✅ Filtered layanan data:", data);
        console.log("✅ Jumlah layanan untuk owner", user.id, ":", data.length);
      } catch (error) {
        console.error("❌ Error fetching layanan:", error);

        // Fallback: coba dengan service function yang sudah ada
        try {
          console.log("🔄 Trying fallback with getLayananByOwner...");
          data = await getLayananByOwner(Number(user.id));
          console.log("✅ Fallback success:", data);
        } catch (fallbackError) {
          console.error("❌ Fallback also failed:", fallbackError);
          throw error; // throw error asli
        }
      }

      if (Array.isArray(data) && data.length >= 0) {
        setLayananList(data);
        setError(null);
        console.log("✅ Layanan list updated:", data.length, "items");
      } else {
        setLayananList([]);
        setError("Tidak ada data layanan yang ditemukan untuk owner ini");
      }
    } catch (error) {
      console.error("🚨 Final error:", error);
      setError(`Gagal memuat data layanan: ${(error as Error).message}`);
      setLayananList([]);
    } finally {
      setLoadingLayanan(false);
      setLoading(false);
    }
  };
  [user?.id]; // ✅ Dependency user.id untuk re-fetch jika user berubah

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi form
    if (!formData.nama_layanan.trim()) {
      setError("Nama layanan harus diisi");
      return;
    }

    if (!formData.harga_layanan || Number(formData.harga_layanan) <= 0) {
      setError("Harga layanan harus diisi dan lebih dari 0");
      return;
    }

    if (!formData.keterangan_layanan.trim()) {
      setError("Keterangan layanan harus diisi");
      return;
    }

    if (!user?.id) {
      setError("User tidak ditemukan. Silakan login kembali.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Data yang akan dikirim sesuai dengan validasi controller PHP
      const layananData = {
        nama_layanan: formData.nama_layanan.trim(),
        harga_layanan: formData.harga_layanan.toString(), // String sesuai validasi PHP
        keterangan_layanan: formData.keterangan_layanan.trim(),
        tipe: formData.tipe, // NEW: Added tipe field
        waktu_pengerjaan: formData.waktu_pengerjaan
          ? Number(formData.waktu_pengerjaan)
          : null,
        id_owner: Number(user.id),
      };

      console.log("🚀 Submitting layanan data:", layananData);

      // Menggunakan axiosInstance yang sudah dikonfigurasi
      const response = await axiosInstance.post("/layanan", layananData);

      console.log("✅ Layanan berhasil ditambahkan:", response.data);

      // Reset form dan tutup dialog
      setOpenDialog(false);
      setFormData({
        nama_layanan: "",
        kategori: "",
        harga_layanan: "",
        satuan: "kg",
        waktu_pengerjaan: "",
        status: "aktif",
        keterangan_layanan: "",
        tipe: "Kiloan",
      });

      await fetchLayanan();
    } catch (err: any) {
      console.error("❌ Error creating service:", err);
      console.error("❌ Error response:", err.response?.data);

      // Handle specific validation errors
      if (err.response?.data?.errors) {
        const errorMessages = Object.entries(err.response.data.errors)
          .map(
            ([field, messages]) =>
              `${field}: ${(messages as string[]).join(", ")}`
          )
          .join("\n");
        setError(`Validasi gagal:\n${errorMessages}`);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || "Gagal menambah layanan. Silakan coba lagi.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteService = async (id: number) => {
    try {
      const token = localStorage.getItem("ACCESS_TOKEN");
      const response = await fetch(
        `https://laundryku.rplrus.com/api/layanan/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      await fetchLayanan();
    } catch (err: any) {
      console.error("Error deleting service:", err);
      setError(err.message || "Gagal menghapus layanan");
    }
  };



  const filteredLayanan = layananList.filter((layanan) =>
    [layanan.nama_layanan, layanan.keterangan_layanan].some((field) =>
      field.toLowerCase().includes(searchText.toLowerCase())
    )
  );

  // Helper functions untuk menentukan kategori dan popularitas (konsisten berdasarkan data API)
  const estimateCategory = (namaLayanan: string) => {
    const nama = namaLayanan.toLowerCase();
    if (nama.includes("cuci") && nama.includes("setrika")) return "Cuci";
    if (nama.includes("cuci") && !nama.includes("setrika")) return "Cuci";
    if (nama.includes("setrika")) return "Setrika";
    if (nama.includes("dry") || nama.includes("kering")) return "Dry Clean";
    return "Khusus";
  };



  const getCategoryColor = (kategori: string) => {
    switch (kategori.toLowerCase()) {
      case "cuci":
        return "bg-blue-100 text-blue-800";
      case "setrika":
        return "bg-purple-100 text-purple-800";
      case "dry clean":
        return "bg-orange-100 text-orange-800";
      case "khusus":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };



  // NEW: Get tipe color
  const getTipeColor = (tipe: string) => {
    switch (tipe) {
      case "Kiloan":
        return "bg-green-100 text-green-800";
      case "Satuan":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-auto">
        <nav className="sticky top-0 z-10 w-full flex items-center justify-between bg-white px-6 py-6 shadow mb-2">
          <div className="flex items-center gap-2">
            <Icon
              icon={"material-symbols-light:arrow-back-rounded"}
              className="w-7 h-7 object-contain cursor-pointer"
              onClick={() => navigate(-1)}
            />
            <Icon
              icon={"material-symbols:local-laundry-service"}
              className="w-7 h-7 text-[#0432b3]"
            />
            <span className="text-lg font-bold text-gray-900">
              Daftar Layanan
            </span>
          </div>
        </nav>
        <div className="p-6 flex justify-center items-center h-64">
          <div className="text-center">
            <Icon icon="eos-icons:loading" className="w-8 h-8 mx-auto mb-2" />
            <p>Memuat data layanan...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <nav className="sticky top-0 z-10 w-full flex items-center justify-between bg-white px-6 py-6 shadow mb-2">
        <div className="flex items-center gap-2">
          <Icon
            icon={"material-symbols-light:arrow-back-rounded"}
            className="w-7 h-7 object-contain cursor-pointer"
            onClick={() => navigate(-1)}
          />
          <Icon
            icon={"material-symbols:local-laundry-service"}
            className="w-7 h-7 text-[#0432b3]"
          />
          <span className="text-lg font-bold text-gray-900">
            Daftar Layanan
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
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 float-right"
            >
              ×
            </button>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="mb-6">
            <h3 className="text-2xl font-semibold text-gray-900">
              Daftar Layanan
            </h3>
            <p className="text-gray-600 mt-1">
              Kelola semua layanan laundry dan harga
            </p>
          </div>

          <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="w-full md:w-3/4">
              <Search value={searchText} onChange={handleSearchChange} />
            </div>

            <button
              onClick={() => setOpenDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
            >
              <Icon icon="material-symbols:add" className="w-5 h-5" />
              <span className="font-semibold">Tambah Layanan</span>
            </button>
          </div>

          {/* Service Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Layanan
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Tipe
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Kategori
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Harga
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Waktu
                  </th>
                  {/* <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Popularitas
                  </th> */}
                  {/* <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Status
                  </th> */}
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLayanan.map((layanan) => {
                  const kategori = estimateCategory(layanan.nama_layanan);

                  return (
                    <tr key={layanan.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <Icon
                              icon={
                                kategori === "Cuci"
                                  ? "material-symbols:local-laundry-service"
                                  : kategori === "Setrika"
                                  ? "material-symbols:iron"
                                  : kategori === "Dry Clean"
                                  ? "material-symbols:dry-cleaning"
                                  : "material-symbols:cleaning-services"
                              }
                              className="w-5 h-5 text-gray-600"
                            />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {layanan.nama_layanan}
                            </div>
                            <div className="text-sm text-gray-500">
                              {layanan.keterangan_layanan}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getTipeColor(
                            layanan.tipe || "Kiloan"
                          )}`}
                        >
                          {layanan.tipe || "Kiloan"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                            kategori
                          )}`}
                        >
                          {kategori}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-green-600">
                          Rp {layanan.harga_layanan.toLocaleString("id-ID")}
                        </span>
                        <div className="text-xs text-gray-500">
                          per {layanan.tipe === "Satuan" ? "item" : "kg"}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Icon
                            icon="material-symbols:schedule"
                            className="w-4 h-4"
                          />
                          <span className="text-sm">
                            {layanan.waktu_pengerjaan
                              ? `${layanan.waktu_pengerjaan} hari`
                              : "1-2 hari"}
                          </span>
                        </div>
                      </td>
                      {/* <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getPopularityColor(
                                popularitas
                              )}`}
                              style={{ width: `${popularitas}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-600">
                            {popularitas}%
                          </span>
                        </div>
                      </td> */}
                      {/* <td className="py-4 px-4">
                        <button
                          onClick={() =>
                            handleToggleStatus(layanan.id, "aktif")
                          }
                          className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          Aktif
                        </button>
                      </td> */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteService(layanan.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Hapus layanan"
                          >
                            <Icon
                              icon="material-symbols:delete-outline"
                              className="w-5 h-5"
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredLayanan.length === 0 && !loading && (
            <div className="text-center py-12">
              <Icon
                icon="material-symbols:search-off"
                className="w-12 h-12 text-gray-400 mx-auto mb-4"
              />
              <p className="text-gray-500">
                {searchText
                  ? "Tidak ada layanan yang ditemukan"
                  : "Belum ada layanan. Tambahkan layanan pertama Anda!"}
              </p>
            </div>
          )}

          {/* Add Service Dialog */}
          {openDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-md max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Tambah Layanan</h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Nama Layanan *
                    </label>
                    <input
                      type="text"
                      name="nama_layanan"
                      value={formData.nama_layanan}
                      onChange={handleInputChange}
                      placeholder="Contoh: Cuci Kering"
                      required
                      className="w-full border p-2 rounded focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* NEW: Tipe Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Tipe Layanan *
                    </label>
                    <select
                      name="tipe"
                      value={formData.tipe}
                      onChange={handleInputChange}
                      className="w-full border p-2 rounded focus:outline-none focus:border-blue-500"
                      required
                    >
                      <option value="Kiloan">Kiloan (per kg)</option>
                      <option value="Satuan">Satuan (per item)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Pilih apakah layanan ini dihitung per kilogram atau per
                      satuan item
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Harga (Rp) *
                    </label>
                    <input
                      type="number"
                      name="harga_layanan"
                      value={formData.harga_layanan}
                      onChange={handleInputChange}
                      placeholder="5000"
                      required
                      min="1"
                      className="w-full border p-2 rounded focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Harga per{" "}
                      {formData.tipe === "Satuan" ? "item/satuan" : "kilogram"}
                    </p>
                  </div>

                  {/* NEW: Waktu Pengerjaan */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Waktu Pengerjaan (hari)
                    </label>
                    <input
                      type="number"
                      name="waktu_pengerjaan"
                      value={formData.waktu_pengerjaan}
                      onChange={handleInputChange}
                      placeholder="1"
                      min="1"
                      max="30"
                      className="w-full border p-2 rounded focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Estimasi waktu pengerjaan dalam hari (opsional)
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Keterangan Layanan *
                    </label>
                    <textarea
                      name="keterangan_layanan"
                      value={formData.keterangan_layanan}
                      onChange={handleInputChange}
                      placeholder="Deskripsi singkat tentang layanan"
                      required
                      rows={3}
                      className="w-full border p-2 rounded focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Keterangan layanan wajib diisi
                    </p>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenDialog(false);
                        setFormData({
                          nama_layanan: "",
                          kategori: "",
                          harga_layanan: "",
                          satuan: "kg",
                          waktu_pengerjaan: "",
                          status: "aktif",
                          keterangan_layanan: "",
                          tipe: "Kiloan",
                        });
                        setError(null);
                      }}
                      disabled={submitting}
                      className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || loadingLayanan}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {submitting && (
                        <Icon icon="eos-icons:loading" className="w-4 h-4" />
                      )}
                      {submitting ? "Menambahkan..." : "Tambahkan"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
