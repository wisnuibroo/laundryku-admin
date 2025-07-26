import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useStateContext } from "../contexts/ContextsProvider";
import Notification from "./Notification";
import { addPesanan } from "../data/service/pesananService";
import {
  findPelangganByNomor,
  getPelangganList,
  PelangganData,
} from "../data/service/pelangganService";

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
  const [loading, setLoading] = useState(false);
  const [loadingPelanggan, setLoadingPelanggan] = useState(false);
  const [pelangganList, setPelangganList] = useState<PelangganData[]>([]);
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

  useEffect(() => {
    const fetchPelangganList = async () => {
      if (user?.id) {
        try {
          setLoadingPelanggan(true);
          const data = await getPelangganList(Number(user.id));
          setPelangganList(data);
        } catch (error) {
          console.error("Error fetching pelanggan list:", error);
        } finally {
          setLoadingPelanggan(false);
        }
      }
    };
    fetchPelangganList();
  }, [user?.id]);

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
  }, [pelangganList, searchTerm]);

  const handleSelectPelanggan = (pelanggan: PelangganData) => {
    setNama(pelanggan.nama_pelanggan);
    setPhone(pelanggan.nomor);
    setAlamat(pelanggan.alamat);
    setShowDropdown(false);
    setSearchTerm("");
  };

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
      if (!nama || !phone || !alamat || !layanan) {
        setNotification({
          show: true,
          message: "Validasi gagal: Data tidak lengkap",
          type: "error",
        });
        return;
      }
      if (!/^08[0-9]{7,11}$/.test(phone)) {
        setNotification({
          show: true,
          message:
            "Nomor telepon harus diawali dengan 08 dan maksimal 13 digit angka.",
          type: "error",
        });
        return;
      }

      setLoading(true);
      try {
        const pesananData: any = {
          id_owner: Number(user.id),
          nama_pelanggan: nama,
          nomor: phone,
          alamat,
          layanan,
          status: "pending",
        };

        if (userType === "admin" && user && user.id) {
          pesananData.id_admin = Number(user.id);
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
        setNotification({
          show: true,
          message: error.message || "Gagal menambahkan pesanan",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [user?.id, userType, nama, phone, alamat, layanan, onAdded]
  );

  const formContent = useMemo(
    () => (
      <form onSubmit={handleSubmit}>
        <div className="mb-4 relative">
          <label className="block text-sm font-medium mb-1">
            Cari Pelanggan
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
              placeholder="Cari nama atau nomor pelanggan"
              autoComplete="off"
              disabled={loading || loadingPelanggan}
            />
            {loadingPelanggan && (
              <div className="absolute right-3 top-2">
                <Icon icon="eos-icons:loading" width={24} />
              </div>
            )}
          </div>

          {/* ✅ Tampilkan dropdown hanya saat tidak sedang mengetik nama */}
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
            placeholder="Contoh: 081234 567890"
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

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Layanan *</label>
          <textarea
            value={layanan}
            onChange={(e) => setLayanan(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
            rows={2}
            required
            disabled={loading}
            placeholder="Masukkan jenis layanan"
            autoComplete="off"
          />
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
            disabled={loading}
          >
            {loading ? "Menyimpan..." : "Tambahkan Pesanan"}
          </button>
        </div>
      </form>
    ),
    [nama, phone, alamat, layanan, loading, isModal, onClose, handleSubmit, searchTerm, showDropdown, filteredPelanggan, isTypingNama]
  );

  return isModal ? (
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
  ) : (
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
