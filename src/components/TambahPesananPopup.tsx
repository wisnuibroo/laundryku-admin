import { useState, useCallback, useMemo, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useStateContext } from "../contexts/ContextsProvider";
import Notification from "./Notification";
import { useNavigate } from "react-router-dom";
import { addPesanan, AddPesananInput, getPesanan } from "../data/service/pesananService"; // Modified: Added getPesanan import
import {
  findPelangganByNomor,
  getPelangganList,
  PelangganData,
} from "../data/service/pelangganService";
import { Layanan, Pesanan } from "../data/model/Pesanan";
import { getLayanan, getLayananByOwner } from "../data/service/ApiService";

interface TambahPesananPopupProps {
  onClose?: () => void;
  onAdded?: () => void;
  isModal?: boolean;
}

export default function TambahPesananPopup({
  onClose,
  onAdded,
  isModal = false,
}: TambahPesananPopupProps) {
  const [nama, setNama] = useState("");
  const [phone, setPhone] = useState("");
  const [alamat, setAlamat] = useState("");
  const [layanan, setLayanan] = useState("");
  const [layananList, setLayananList] = useState<Layanan[]>([]);
  const [loadingLayanan, setLoadingLayanan] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingPelanggan, setLoadingPelanggan] = useState(false);
  const [pelangganList, setPelangganList] = useState<PelangganData[]>([]);
  // NEW: State for customers from pesanan (for UI indicator)
  const [pesananCustomerList, setPesananCustomerList] = useState<PelangganData[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isTypingNama, setIsTypingNama] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const { user, userType } = useStateContext();
  const navigate = useNavigate();

  // Existing useEffect for fetching layanan (unchanged)
  useEffect(() => {
    const fetchLayanan = async () => {
      try {
        setLoadingLayanan(true);
        console.log("🔍 Starting to fetch layanan...");
        console.log("👤 User data:", user);
        console.log("🔑 User type:", userType);

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
          console.log(
            "📋 Layanan names:",
            data.map((l) => l.nama_layanan)
          );
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

  // Modified useEffect to fetch both pelanggan and pesanan
  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!user?.id) return;

      try {
        setLoadingPelanggan(true);

        let ownerId: number;
        if (userType === "admin") {
          if (!user.id_owner) {
            console.error("❌ Admin/Karyawan doesn't have id_owner for pelanggan");
            setNotification({
              show: true,
              message: "Admin/Karyawan tidak memiliki ID Owner yang valid",
              type: "error",
            });
            return;
          }
          ownerId = Number(user.id_owner);
        } else {
          ownerId = Number(user.id);
        }

        console.log("👥 Fetching customer data for owner:", ownerId);

        // Fetch pelanggan list
        const pelangganData = await getPelangganList(ownerId);
        console.log("📋 Pelanggan list:", pelangganData);

        // Fetch pesanan list to extract customer data
        const pesananData = await getPesanan(ownerId);
        console.log("📋 Pesanan list:", pesananData);

        // Extract unique customers from pesanan
        const pesananCustomers: PelangganData[] = [];
        const uniqueCustomers = new Map<string, PelangganData>();

        pesananData.forEach((pesanan: Pesanan) => {
          const key = `${pesanan.nama_pelanggan}-${pesanan.nomor}`;
          if (!uniqueCustomers.has(key)) {
            uniqueCustomers.set(key, {
              nama_pelanggan: pesanan.nama_pelanggan,
              nomor: pesanan.nomor,
              alamat: pesanan.alamat || "", // Handle null alamat
            });
          }
        });

        uniqueCustomers.forEach((customer) => {
          pesananCustomers.push(customer);
        });

        console.log("📋 Unique customers from pesanan:", pesananCustomers);

        // Merge pelangganData with pesananCustomers, avoiding duplicates
        const mergedCustomers: PelangganData[] = [...pelangganData];
        pesananCustomers.forEach((pesananCustomer) => {
          const exists = mergedCustomers.some(
            (pelanggan) =>
              pelanggan.nomor === pesananCustomer.nomor &&
              pelanggan.nama_pelanggan === pesananCustomer.nama_pelanggan
          );
          if (!exists) {
            mergedCustomers.push(pesananCustomer);
          }
        });

        console.log("📋 Merged customer list:", mergedCustomers);
        setPelangganList(mergedCustomers);
        setPesananCustomerList(pesananCustomers); // Store for UI indicator
      } catch (error) {
        console.error("Error fetching customer data:", error);
        setNotification({
          show: true,
          message: `Gagal memuat data pelanggan: ${(error as Error).message}`,
          type: "error",
        });
        setPelangganList([]);
        setPesananCustomerList([]);
      } finally {
        setLoadingPelanggan(false);
      }
    };

    fetchCustomerData();
  }, [user?.id, user?.id_owner, userType]);

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  const filteredPelanggan = useMemo(() => {
    if (!searchTerm) return pelangganList;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return pelangganList.filter(
      (pelanggan) =>
        pelanggan.nama_pelanggan.toLowerCase().includes(lowerSearchTerm) ||
        pelanggan.nomor.includes(searchTerm)
    );
  }, [searchTerm, pelangganList]);

  const handleSelectPelanggan = useCallback((pelanggan: PelangganData) => {
    setNama(pelanggan.nama_pelanggan);
    setPhone(pelanggan.nomor);
    setAlamat(pelanggan.alamat);
    setShowDropdown(false);
    setSearchTerm("");
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!user?.id) {
        setNotification({
          show: true,
          message: "User tidak ditemukan",
          type: "error",
        });
        return;
      }

      if (userType === "admin" && !user.id_owner) {
        setNotification({
          show: true,
          message: "Admin tidak memiliki ID Owner yang valid",
          type: "error",
        });
        return;
      }

      const validationErrors = [];

      if (!nama || nama.trim().length === 0) {
        validationErrors.push("Nama pelanggan harus diisi");
      }

      if (!phone || phone.trim().length === 0) {
        validationErrors.push("Nomor telepon harus diisi");
      } else if (!/^08[0-9]{7,11}$/.test(phone)) {
        validationErrors.push(
          "Nomor telepon harus diawali dengan 08 dan maksimal 13 digit angka"
        );
      }

      if (!alamat || alamat.trim().length === 0) {
        validationErrors.push("Alamat harus diisi");
      }

      if (!layanan || layanan.trim().length === 0) {
        validationErrors.push("Layanan harus dipilih");
      }

      if (validationErrors.length > 0) {
        setNotification({
          show: true,
          message: `Validasi gagal: ${validationErrors.join(", ")}`,
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
          setNotification({
            show: true,
            message: "Layanan yang dipilih tidak valid",
            type: "error",
          });
          return;
        }

        const layananName = selectedLayanan.nama_layanan;

        console.log("Selected layanan:", selectedLayanan);
        console.log("Layanan name to save:", layananName);
        console.log("User data:", user);
        console.log("User type:", userType);

        const pesananData: AddPesananInput = {
          id_owner:
            userType === "admin" ? Number(user.id_owner) : Number(user.id),
          nama_pelanggan: nama.trim(),
          nomor: phone.trim(),
          alamat: alamat.trim(),
          id_layanan: Number(layanan),
          layanan: layananName.trim(),
          status: "pending",
          berat: 0,
          jumlah_harga: 0,
        };

        if (userType === "admin" && user && user.id) {
          pesananData.id_admin = Number(user.id);
        }

        console.log("=== DEBUG INFO ===");
        console.log("Pesanan data to submit:", pesananData);
        console.log("User ID:", user.id);
        console.log("User ID Owner:", user.id_owner);
        console.log("User Type:", userType);
        console.log("Selected layanan ID:", layanan);
        console.log("Layanan name:", layananName);
        console.log("ID Layanan to send:", pesananData.id_layanan);
        console.log("Data types:", {
          id_owner: typeof pesananData.id_owner,
          id_layanan: typeof pesananData.id_layanan,
          nama_pelanggan: typeof pesananData.nama_pelanggan,
          nomor: typeof pesananData.nomor,
          alamat: typeof pesananData.alamat,
        });
        console.log("=== END DEBUG ===");

        const finalValidationErrors = [];

        if (!pesananData.id_owner || pesananData.id_owner <= 0) {
          console.error("Invalid id_owner:", pesananData.id_owner);
          finalValidationErrors.push("ID Owner tidak valid");
        }

        if (
          !pesananData.nama_pelanggan ||
          pesananData.nama_pelanggan.trim().length === 0
        ) {
          finalValidationErrors.push("Nama pelanggan tidak boleh kosong");
        }

        if (!pesananData.nomor || pesananData.nomor.trim().length === 0) {
          finalValidationErrors.push("Nomor telepon tidak boleh kosong");
        }

        if (!pesananData.alamat || pesananData.alamat.trim().length === 0) {
          finalValidationErrors.push("Alamat tidak boleh kosong");
        }

        if (!pesananData.id_layanan || pesananData.id_layanan <= 0) {
          console.error("Invalid id_layanan:", pesananData.id_layanan);
          finalValidationErrors.push("ID Layanan tidak valid");
        }

         

        if (finalValidationErrors.length > 0) {
          console.error("Final validation failed:", finalValidationErrors);
          setNotification({
            show: true,
            message: `Data tidak valid: ${finalValidationErrors.join(", ")}`,
            type: "error",
          });
          return;
        }

        await addPesanan(pesananData);

        setNotification({
          show: true,
          message: "Pesanan berhasil ditambahkan!",
          type: "success",
        });

        setNama("");
        setPhone("");
        setAlamat("");
        setLayanan("");

        if (onAdded) onAdded();
      } catch (error: any) {
        console.error("Error adding pesanan:", error);

        let errorMessage = "Gagal menambahkan pesanan";

        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.errors) {
          const validationErrors = Object.entries(error.response.data.errors)
            .map(
              ([field, messages]) =>
                `${field}: ${(messages as string[]).join(", ")}`
            )
            .join("; ");
          errorMessage = `Validasi gagal: ${validationErrors}`;
        } else if (error.message) {
          errorMessage = error.message;
        }

        setNotification({
          show: true,
          message: errorMessage,
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [user?.id, userType, nama, phone, alamat, layanan, layananList, onAdded]
  );

  const formContent = useMemo(
    () => (
      <form onSubmit={handleSubmit}>
        <div className="mb-4 relative">
          <label className="block text-sm font-medium mb-1">
            Cari Pelanggan
          </label>
          <div className="relative">
            <div className="absolute left-3 top-2.5 text-gray-400">
              <Icon icon="mdi:magnify" width={20} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              className="w-full pl-10 pr-10 py-2 border rounded focus:outline-none focus:border-blue-500"
              placeholder="Cari nama atau nomor pelanggan"
              autoComplete="off"
              disabled={loading || loadingPelanggan}
            />
            {loadingPelanggan && (
              <div className="absolute right-3 top-2.5">
                <Icon icon="eos-icons:loading" width={20} />
              </div>
            )}
          </div>

          {showDropdown && searchTerm && !isTypingNama && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredPelanggan.length > 0 ? (
                filteredPelanggan.map((pelanggan, index) => (
                  <div
                    key={`${pelanggan.nomor}-${index}`}
                    className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                    onClick={() => handleSelectPelanggan(pelanggan)}
                  >
                    <div className="font-medium">
                      {pelanggan.nama_pelanggan}
                    </div>
                    <div className="text-sm text-gray-600">
                      {pelanggan.nomor}
                    </div>
                    {pesananCustomerList.some(
                      (p) =>
                        p.nomor === pelanggan.nomor &&
                        p.nama_pelanggan === pelanggan.nama_pelanggan
                    ) && (
                      <div className="text-xs text-blue-500">
                        (Dari riwayat pesanan)
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-2 text-gray-500">
                  Tidak ada pelanggan yang ditemukan
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Nama Pelanggan *
          </label>
          <input
            type="text"
            name="nama_manual"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            onFocus={() => setIsTypingNama(true)}
            onBlur={() => setTimeout(() => setIsTypingNama(false), 200)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
            required
            disabled={loading}
            placeholder="Masukkan nama pelanggan"
            autoComplete="on"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Nomor Hp (Whatsapp) *
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[0-9]*$/.test(value) && value.length <= 13) {
                setPhone(value);
              }
            }}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
            required
            disabled={loading}
            placeholder="Contoh: 081234567890"
            autoComplete="off"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Alamat *</label>
          <textarea
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
            rows={3}
            required
            disabled={loading}
            placeholder="Masukkan alamat pelanggan"
            autoComplete="off"
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
                console.log("🎯 Layanan selected:", e.target.value);
                const selectedItem = layananList.find(
                  (l) => l.id.toString() === e.target.value
                );
                console.log("🎯 Selected layanan object:", selectedItem);
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

        <div className="flex justify-end gap-2">
          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              disabled={loading}
            >
              Batal
            </button>
          )}
          <button
            type="submit"
            className="bg-[#1f1f1f] hover:bg-[#3d3d3d] text-white px-4 py-2 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || loadingLayanan}
          >
            {loading ? "Menyimpan..." : "Tambahkan Pesanan"}
          </button>
        </div>
      </form>
    ),
    [
      nama,
      phone,
      alamat,
      layanan,
      layananList,
      loading,
      loadingLayanan,
      loadingPelanggan,
      isModal,
      onClose,
      handleSubmit,
      searchTerm,
      showDropdown,
      filteredPelanggan,
      isTypingNama,
      pesananCustomerList, // NEW: Added to dependencies
    ]
  );

  if (isModal) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md max-w-xl mx-auto relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            <Icon icon="mdi:close" width={20} />
          </button>
        )}
        <h1 className="text-2xl font-bold text-black mb-4">
          Tambah Pesanan Baru
        </h1>
        {formContent}
        {notification.show && (
          <Notification
            show={notification.show}
            message={notification.message}
            type={notification.type}
            onClose={closeNotification}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold text-black mb-4">
          Tambah Pesanan Baru
        </h1>
        <div className="bg-white p-6 rounded-lg shadow-md max-w-xl">
          {formContent}
        </div>
        {notification.show && (
          <Notification
            show={notification.show}
            message={notification.message}
            type={notification.type}
            onClose={closeNotification}
          />
        )}
      </div>
    </div>
  );
}