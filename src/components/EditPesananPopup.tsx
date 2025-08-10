import { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
import { useStateContext } from "../contexts/ContextsProvider";
import Notification from "./Notification";
import { getPesananById, updatePesanan } from "../data/service/pesananService";
import { Pesanan, Layanan } from "../data/model/Pesanan";
import { getLayananByOwner } from "../data/service/ApiService";

interface EditPesananPopupProps {
  pesananId: number;
  onClose?: () => void;
  onUpdated?: () => void;
  isModal?: boolean;
}

export default function EditPesananPopup({
  pesananId,
  onClose,
  onUpdated,
  isModal = false,
}: EditPesananPopupProps) {
  const { user, userType } = useStateContext();

  const [pesananData, setPesananData] = useState<Pesanan | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [errorFetch, setErrorFetch] = useState<string | null>(null);

  const [nama, setNama] = useState("");
  const [phone, setPhone] = useState("");
  const [alamat, setAlamat] = useState("");
  const [layanan, setLayanan] = useState("");
  const [layananList, setLayananList] = useState<Layanan[]>([]);
  const [loadingLayanan, setLoadingLayanan] = useState(false);
  const [loading, setLoading] = useState(false);

  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
  });

  // Fetch layanan list
  useEffect(() => {
    const fetchLayanan = async () => {
      try {
        setLoadingLayanan(true);
        console.log("🔍 Starting to fetch layanan for edit...");

        if (!user?.id) {
          console.warn("⚠️ No user ID available, skipping layanan fetch");
          return;
        }

        let ownerId: number;

        if (userType === "admin") {
          if (!user.id_owner) {
            console.error("❌ Admin/Karyawan doesn't have id_owner");
            setNotification({
              show: true,
              message: "Admin/Karyawan tidak memiliki ID Owner yang valid",
              type: "error",
            });
            return;
          }
          ownerId = Number(user.id_owner);
          console.log("👨‍💼 Admin/Karyawan mode - using id_owner:", ownerId);
        } else {
          ownerId = Number(user.id);
          console.log("👑 Owner mode - using user.id:", ownerId);
        }

        console.log("🎯 Final owner ID to fetch layanan:", ownerId);

        let data: Layanan[] = [];

        try {
          const token =
            localStorage.getItem("ACCESS_TOKEN") ||
            localStorage.getItem("token");
          const url = `https://laundryku.rplrus.com/api/layanan?id_owner=${ownerId}`;

          console.log("📡 Fetching from URL:", url);

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

          if (responseData.success && Array.isArray(responseData.data)) {
            data = responseData.data;
          } else if (Array.isArray(responseData)) {
            data = responseData;
          } else {
            throw new Error("Format response tidak valid");
          }

          data = data.filter((layanan) => layanan.id_owner === ownerId);

          console.log("✅ Filtered layanan for owner", ownerId, ":", data);
        } catch (fetchError) {
          console.error("❌ Direct fetch failed:", fetchError);
          try {
            console.log("🔄 Trying fallback with getLayananByOwner...");
            data = await getLayananByOwner(ownerId);
          } catch (serviceError) {
            console.error("❌ Service fallback failed:", serviceError);
            throw fetchError;
          }
        }

        if (Array.isArray(data)) {
          setLayananList(data);
          console.log(
            "✅ Layanan list set successfully for owner:",
            ownerId,
            "- Count:",
            data.length
          );

          if (data.length === 0) {
            console.log("⚠️ No layanan found for this owner");
            setNotification({
              show: true,
              message: `Belum ada layanan untuk owner ini. Owner perlu menambahkan layanan terlebih dahulu.`,
              type: "error",
            });
          }
        } else {
          console.error("❌ Invalid data format received");
          setLayananList([]);
          throw new Error("Data layanan tidak valid");
        }
      } catch (error) {
        console.error("🚨 Error in fetchLayanan:", error);
        setNotification({
          show: true,
          message: `Gagal memuat layanan: ${(error as Error).message}`,
          type: "error",
        });
        setLayananList([]);
      } finally {
        setLoadingLayanan(false);
      }
    };

    if (user?.id) {
      fetchLayanan();
    }
  }, [user?.id, user?.id_owner, userType]);

  // Fetch pesanan data
  useEffect(() => {
    const fetchPesanan = async () => {
      try {
        setLoadingData(true);
        const data = await getPesananById(pesananId);
        setPesananData(data);
      } catch (error: any) {
        console.error("Gagal ambil data pesanan", error);
        setErrorFetch("Tidak bisa memuat data pesanan");
      } finally {
        setLoadingData(false);
      }
    };
    fetchPesanan();
  }, [pesananId]);

  // Set form data when pesanan data is loaded
  useEffect(() => {
    if (pesananData && layananList.length > 0) {
      console.log("🔄 Setting form data from pesanan:", pesananData);
      console.log("📊 Available layanan list:", layananList);
      
      setNama(pesananData.nama_pelanggan || "");
      setPhone(pesananData.nomor || "");
      setAlamat(pesananData.alamat || "");

      // Set layanan berdasarkan id_layanan jika tersedia
      if (pesananData.id_layanan) {
        console.log("🎯 Looking for layanan with ID:", pesananData.id_layanan);
        const matchedLayanan = layananList.find(
          (l) => l.id === pesananData.id_layanan
        );
        if (matchedLayanan) {
          console.log("✅ Found matching layanan by ID:", matchedLayanan);
          setLayanan(matchedLayanan.id.toString());
        } else {
          console.log("⚠️ No layanan found with ID, trying by name...");
          // Fallback: cari berdasarkan nama layanan
          const matchedByName = layananList.find(
            (l) =>
              l.nama_layanan.toLowerCase() === pesananData.layanan.toLowerCase()
          );
          if (matchedByName) {
            console.log("✅ Found matching layanan by name:", matchedByName);
            setLayanan(matchedByName.id.toString());
          } else {
            console.log("❌ No matching layanan found");
          }
        }
      } else if (pesananData.layanan) {
        console.log("🎯 Looking for layanan by name:", pesananData.layanan);
        // Fallback: cari berdasarkan nama layanan
        const matchedLayanan = layananList.find(
          (l) =>
            l.nama_layanan.toLowerCase() === pesananData.layanan.toLowerCase()
        );
        if (matchedLayanan) {
          console.log("✅ Found matching layanan by name:", matchedLayanan);
          setLayanan(matchedLayanan.id.toString());
        } else {
          console.log("❌ No matching layanan found by name");
        }
      }
    }
  }, [pesananData, layananList]);

  const closeNotification = () =>
    setNotification((prev) => ({ ...prev, show: false }));

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      console.log("🚀 Starting edit pesanan submit...");

      if (!user?.id || !pesananData?.id) {
        console.error("❌ Missing user ID or pesanan data");
        setNotification({
          show: true,
          message: "User atau data pesanan tidak ditemukan",
          type: "error",
        });
        return;
      }

      // Validasi layanan dipilih
      if (!layanan) {
        console.error("❌ No layanan selected");
        setNotification({
          show: true,
          message: "Layanan harus dipilih",
          type: "error",
        });
        return;
      }

      setLoading(true);
      try {
        const selectedLayanan = layananList.find(
          (l) => l.id.toString() === layanan
        );

        if (!selectedLayanan) {
          console.error("❌ Selected layanan not found in list");
          setNotification({
            show: true,
            message: "Layanan yang dipilih tidak valid",
            type: "error",
          });
          return;
        }

        const updatedData = {
          nama_pelanggan: nama,
          nomor: phone,
          alamat,
          layanan: selectedLayanan.nama_layanan, // Simpan nama layanan
          id_layanan: selectedLayanan.id, // 🔥 PENTING: Simpan ID layanan untuk API
          id_owner:
            userType === "admin" ? Number(user.id_owner) : Number(user.id),
        };

        console.log("📝 Updating pesanan ID:", pesananData.id);
        console.log("📊 Updated data:", updatedData);

        const result = await updatePesanan(pesananData.id, updatedData);
        console.log("✅ Update pesanan result:", result);

        setNotification({
          show: true,
          message: "Pesanan berhasil diperbarui!",
          type: "success",
        });

        console.log("🎉 Edit success, calling callbacks in 1.5s...");
        
        // Wait a bit to show success message
        setTimeout(() => {
          console.log("🔄 Calling onUpdated callback");
          // Call onUpdated to refresh the parent component
          if (onUpdated) {
            onUpdated();
          }
          console.log("🚪 Calling onClose callback");
          // Close the modal
          if (onClose) {
            onClose();
          }
        }, 1500); // 1.5 second delay to show success message
        
      } catch (error: any) {
        console.error("❌ Error updating pesanan:", error);
        setNotification({
          show: true,
          message:
            error.message || "Terjadi kesalahan saat memperbarui pesanan",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [
      user?.id,
      userType,
      user?.id_owner,
      pesananData?.id,
      nama,
      phone,
      alamat,
      layanan,
      layananList,
      onUpdated,
      onClose,
    ]
  );

  if (loadingData)
    return <div className="p-4 text-center">Memuat data pesanan...</div>;
  if (errorFetch)
    return <div className="p-4 text-center text-red-500">{errorFetch}</div>;
  if (!pesananData) return null;

  const formContent = (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Nama Pelanggan *
        </label>
        <input
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
          required
          disabled={loading}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Nomor HP *</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => {
            const value = e.target.value;
            if (/^[0-9]*$/.test(value) && value.length <= 13) setPhone(value);
          }}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
          required
          disabled={loading}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Alamat *</label>
        <textarea
          value={alamat}
          onChange={(e) => setAlamat(e.target.value)}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
          rows={2}
          required
          disabled={loading}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Pilih Layanan *
        </label>
        <div className="relative">
          <select
            value={layanan}
            onChange={(e) => {
              console.log("🎯 Layanan selected in edit:", e.target.value);
              const selectedItem = layananList.find(
                (l) => l.id.toString() === e.target.value
              );
              console.log("🎯 Selected layanan object in edit:", selectedItem);
              setLayanan(e.target.value);
            }}
            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring focus:border-blue-300"
            required
            disabled={loading || loadingLayanan}
          >
            <option value="">-- Pilih layanan --</option>
            {layananList.map((item) => (
              <option key={item.id} value={item.id.toString()}>
                {item.nama_layanan}
              </option>
            ))}
          </select>
          {loadingLayanan && (
            <div className="absolute right-8 top-2">
              <Icon icon="eos-icons:loading" width={20} />
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">{/* Bagian harga dan berat dihapus */}</div>

      <div className="flex justify-end gap-2">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-100"
            disabled={loading}
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
          disabled={loading || loadingLayanan}
        >
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </form>
  );

  return isModal ? (
    <div className="p-6 bg-white rounded-lg shadow max-w-xl mx-auto relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          disabled={loading}
        >
          <Icon icon="mdi:close" width={20} />
        </button>
      )}
      <h1 className="text-2xl font-bold mb-4">Edit Pesanan</h1>
      {formContent}
      {notification.show && (
        <Notification {...notification} onClose={closeNotification} />
      )}
    </div>
  ) : (
    <div className="flex h-screen bg-white">
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">Edit Pesanan</h1>
        <div className="bg-white p-6 rounded shadow max-w-xl">
          {formContent}
          {notification.show && (
            <Notification {...notification} onClose={closeNotification} />
          )}
        </div>
      </div>
    </div>
  );
}