import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import Sidebar from "../../components/Sidebar";
import { useStateContext } from "../../contexts/ContextsProvider";
import { addPesanan } from "../../data/service/pesananService";
import Notification from "../../components/Notification";

interface TambahPesananPageProps {
  onClose?: () => void;
  onAdded?: () => void;
  isModal?: boolean;
}

export default function TambahPesananPage({ onClose, onAdded, isModal = false }: TambahPesananPageProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [nama, setNama] = useState("");
  const [phone, setPhone] = useState("");
  const [alamat, setAlamat] = useState("");
  const [layanan, setLayanan] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error"
  });

  const { user } = useStateContext();
  const navigate = useNavigate();

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      setNotification({
        show: true,
        message: "User tidak ditemukan",
        type: "error"
      });
      return;
    }

    if (!nama || !phone || !alamat || !layanan) {
      setNotification({
        show: true,
        message: "Validasi gagal: Data yang dimasukkan tidak lengkap/salah!",
        type: "error"
      });
      return;
    }

    setLoading(true);
    
    try {
      await addPesanan({
        id_owner: Number(user.id),
        nama_pelanggan: nama,
        nomor: phone,
        alamat: alamat,
        layanan: layanan,
        status: "pending"
      });
      
      setNotification({
        show: true,
        message: "Pesanan berhasil ditambahkan!",
        type: "success"
      });
      
      // Reset form
      setNama("");
      setPhone("");
      setAlamat("");
      setLayanan("");
      
      if (onAdded) {
        onAdded();
      }
    } catch (error: any) {
      console.error("Error adding pesanan:", error);
      setNotification({
        show: true,
        message: error.message || "Gagal menambahkan pesanan",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const FormContent = () => (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Nama Pelanggan *</label>
        <input
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
          required
          disabled={loading}
          placeholder="Masukkan nama pelanggan"
          autoComplete="off"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">No. Telepon *</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
          required
          disabled={loading}
          placeholder="Masukkan nomor telepon"
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
      <h1 className="text-2xl font-bold text-black mb-4">Tambah Pesanan Baru</h1>
      <FormContent />
      <Notification
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={closeNotification}
      />
    </div>
  ) : (
    <div className="flex h-screen bg-white">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold text-black mb-4">Tambah Pesanan Baru</h1>
        <div className="bg-white p-6 rounded-lg shadow-md max-w-xl">
          <FormContent />
        </div>
        <Notification
          show={notification.show}
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      </div>
    </div>
  );
}