import { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
import { useStateContext } from "../contexts/ContextsProvider";
import Notification from "./Notification";
import { getPesananById, updatePesanan } from "../data/service/pesananService";
import { Pesanan } from "../data/model/Pesanan";

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
  const { user } = useStateContext();

  const [pesananData, setPesananData] = useState<Pesanan | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [errorFetch, setErrorFetch] = useState<string | null>(null);

  const [nama, setNama] = useState("");
  const [phone, setPhone] = useState("");
  const [alamat, setAlamat] = useState("");
  const [layanan, setLayanan] = useState("");
  const [harga, setHarga] = useState("");
  const [berat, setBerat] = useState("");
  const [loading, setLoading] = useState(false);

  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
  });

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

  useEffect(() => {
    if (pesananData) {
      setNama(pesananData.nama_pelanggan || "");
      setPhone(pesananData.nomor || "");
      setAlamat(pesananData.alamat || "");
      setLayanan(pesananData.layanan || "");
      setHarga(
        pesananData.jumlah_harga
          ? formatRupiah(pesananData.jumlah_harga.toString())
          : ""
      );
      setBerat(pesananData.berat?.toString() || "");
    }
  }, [pesananData]);

  const closeNotification = () =>
    setNotification((prev) => ({ ...prev, show: false }));

  const formatRupiah = (value: string) => {
    const angka = value.replace(/[^0-9]/g, "");
    return angka.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleHargaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/^Rp\s?/, "").replace(/\./g, "");
    setHarga(formatRupiah(raw));
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!user?.id || !pesananData?.id) {
        setNotification({
          show: true,
          message: "User atau data pesanan tidak ditemukan",
          type: "error",
        });
        return;
      }

      setLoading(true);
      try {
        const updatedData = {
          nama_pelanggan: nama,
          nomor: phone,
          alamat,
          layanan,
          berat: berat ? parseFloat(berat) : 0,
          jumlah_harga: harga ? parseFloat(harga.replace(/\./g, "")) : 0,
          id_owner: user.id,
        };

        await updatePesanan(pesananData.id, updatedData);

        setNotification({
          show: true,
          message: "Pesanan berhasil diperbarui!",
          type: "success",
        });

        if (onUpdated) onUpdated();
        if (onClose) onClose();
      } catch (error: any) {
        console.error(error);
        setNotification({
          show: true,
          message: error.message || "Terjadi kesalahan saat memperbarui pesanan",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [user?.id, pesananData?.id, nama, phone, alamat, layanan, berat, harga, onUpdated, onClose]
  );

  if (loadingData)
    return <div className="p-4 text-center">Memuat data pesanan...</div>;
  if (errorFetch)
    return <div className="p-4 text-center text-red-500">{errorFetch}</div>;
  if (!pesananData) return null;

  const formContent = (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Nama Pelanggan *</label>
        <input
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Nomor HP *</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => {
            const value = e.target.value;
            if (/^[0-9]*$/.test(value) && value.length <= 13)
              setPhone(value);
          }}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Alamat *</label>
        <textarea
          value={alamat}
          onChange={(e) => setAlamat(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          rows={2}
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Layanan *</label>
        <textarea
          value={layanan}
          onChange={(e) => setLayanan(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          rows={2}
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Harga *</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2">Rp</span>
          <input
            type="text"
            value={harga}
            onChange={handleHargaChange}
            className="w-full pl-10 pr-3 py-2 border rounded"
            required
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Berat (kg)</label>
        <input
          type="number"
          value={berat}
          onChange={(e) => setBerat(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

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
          disabled={loading}
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
