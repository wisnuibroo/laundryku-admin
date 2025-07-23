import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import Sidebar from "../../components/Sidebar";
import { useStateContext } from "../../contexts/ContextsProvider";
import { addPesanan } from "../../data/service/pesananService";

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
  const [totalHarga, setTotalHarga] = useState(0);
  const [jenisPembayaran, setJenisPembayaran] = useState("cash");
  const [berat, setBerat] = useState(0);
  const [loading, setLoading] = useState(false);

  const { user } = useStateContext();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      alert("User tidak ditemukan");
      return;
    }

    if (!nama || !phone || !alamat || !layanan) {
      alert("Validasi gagal: Data yang dimasukkan tidak lengkap/salah!");
      return;
    }

    console.log("User data:", user);
    console.log("Sending data:", {
      id_owner: Number(user.id),
      nama_pelanggan: nama,
      nomor: phone,
      alamat: alamat,
      layanan: layanan,
      berat: berat,
      jumlah_harga: totalHarga,
      jenis_pembayaran: jenisPembayaran,
      status: "pending"
    });

    setLoading(true);
    
    try {
      await addPesanan({
        id_owner: Number(user.id),
        nama_pelanggan: nama,
        nomor: phone,
        alamat: alamat,
        layanan: layanan,
        berat: berat,
        jumlah_harga: totalHarga,
        jenis_pembayaran: jenisPembayaran as 'cash' | 'transfer',
        status: "pending"
      });
      
      alert("Pesanan berhasil ditambahkan!");
      
      // Reset form
      setNama("");
      setPhone("");
      setAlamat("");
      setLayanan("");
      setTotalHarga(0);
      setBerat(0);
      setJenisPembayaran("cash");
      
      if (onAdded) {
        onAdded();
      } else {
        navigate("/pesanan");
      }
    } catch (error: any) {
      console.error("Error adding pesanan:", error);
      alert(error.message || "Gagal menambahkan pesanan");
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
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Layanan *</label>
        <textarea
          value={layanan}
          onChange={(e) => setLayanan(e.target.value)}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
          rows={2}
          required
          disabled={loading}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Berat (kg)</label>
        <input
          type="number"
          value={berat}
          onChange={(e) => setBerat(Number(e.target.value))}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
          min={0}
          step={0.1}
          disabled={loading}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Total Harga</label>
        <input
          type="number"
          value={totalHarga}
          onChange={(e) => setTotalHarga(Number(e.target.value))}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
          min={0}
          disabled={loading}
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Jenis Pembayaran</label>
        <select
          value={jenisPembayaran}
          onChange={(e) => setJenisPembayaran(e.target.value)}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
          disabled={loading}
        >
          <option value="cash">Cash</option>
          <option value="transfer">Transfer</option>
        </select>
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
          className="bg-[#00ADB5] hover:bg-[#009BA1] text-white px-4 py-2 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Simpan Pesanan"}
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
    </div>
  ) : (
    <div className="flex h-screen bg-white">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold text-black mb-4">Tambah Pesanan Baru</h1>
        <div className="bg-white p-6 rounded-lg shadow-md max-w-xl">
          <FormContent />
        </div>
      </div>
    </div>
  );
}