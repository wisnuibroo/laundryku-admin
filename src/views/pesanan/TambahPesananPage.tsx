import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import Sidebar from "../../components/Sidebar";
import { useStateContext } from "../../contexts/ContextsProvider";


export default function TambahPesananPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [nama, setNama] = useState("");
  const [phone, setPhone] = useState("");
  const [alamat, setAlamat] = useState("");
  const [catatan, setCatatan] = useState("");
  const [totalHarga, setTotalHarga] = useState(0);
  const [jenisPembayaran, setJenisPembayaran] = useState("Tunai");

  const { user } = useStateContext();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ({
        name: nama,
        phone,
        alamat,
        catatan,
        total_harga: totalHarga,
        jenis_pembayaran: jenisPembayaran,
        id_laundry: user?.id_laundry,
      });
      alert("Pesanan berhasil ditambahkan!");
      navigate("/pesanan");
    } catch (error: any) {
      alert(error.message || "Gagal menambahkan pesanan");
    }
  };

  return (
    <div className="flex h-screen bg-white">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold text-black mb-4">Tambah Pesanan Baru</h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-xl">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Nama Pelanggan</label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">No. Telepon</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Alamat</label>
            <textarea
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Catatan</label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Total Harga</label>
            <input
              type="number"
              value={totalHarga}
              onChange={(e) => setTotalHarga(parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded"
              required
              min={0}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Jenis Pembayaran</label>
            <select
              value={jenisPembayaran}
              onChange={(e) => setJenisPembayaran(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="Tunai">Tunai</option>
              <option value="Transfer">Transfer</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-[#00ADB5] hover:bg-[#009BA1] text-white px-4 py-2 rounded font-semibold"
            >
              Simpan Pesanan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
