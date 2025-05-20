import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Search from "../../components/search";
import { getUrl, updateHargaPesanan } from "../../data/service/ApiService";
import { Pesanan } from "../../data/model/Pesanan";
import { Icon } from '@iconify/react';
import Lottie from "lottie-react";
import animasiData from "../../assets/Animation - 1739535831442.json";

export default function TagihanPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [tagihan, setTagihan] = useState<Pesanan[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchKeyword, setSearchKeyword] = useState<string>("");
    const [showHargaDialog, setShowHargaDialog] = useState(false);
    const [selectedTagihan, setSelectedTagihan] = useState<Pesanan|null>(null);
    const [inputHarga, setInputHarga] = useState<string>("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setLoading(true);
        getUrl((data) => {
         setTagihan(Array.isArray(data) ? data.filter((item: Pesanan) => item.status === "Selesai") : []);
            setLoading(false);
        });
    }, []);

    const searchedTagihan = searchKeyword
        ? tagihan.filter((item: Pesanan) => {
            const keyword = searchKeyword.toLowerCase();
            return (
                (item.name && item.name.toLowerCase().includes(keyword)) ||
                ((item as any).user?.name && (item as any).user?.name.toLowerCase().includes(keyword)) ||
                (item.phone && item.phone.toLowerCase().includes(keyword)) ||
                ((item as any).user?.phone && (item as any).user?.phone.toLowerCase().includes(keyword)) ||
                (item.alamat && item.alamat.toLowerCase().includes(keyword))
            );
        })
        : tagihan;

    const handleOpenHargaDialog = (item: Pesanan) => {
        setSelectedTagihan(item);
        setInputHarga(item.total_harga ? String(item.total_harga) : "");
        setShowHargaDialog(true);
    };

    const handleCloseHargaDialog = () => {
        setShowHargaDialog(false);
        setSelectedTagihan(null);
        setInputHarga("");
    };

    const handleSaveHarga = async () => {
        if (!selectedTagihan) return;
        const harga = parseInt(inputHarga);
        if (isNaN(harga) || harga <= 0) {
            alert("Masukkan harga yang valid!");
            return;
        }
        setSaving(true);
        const success = await updateHargaPesanan(selectedTagihan.id, harga);
        if (success) {
            setTagihan(prev => prev.map(item => item.id === selectedTagihan.id ? { ...item, total_harga: harga } : item));
            handleCloseHargaDialog();
        } else {
            alert("Gagal menyimpan harga!");
        }
        setSaving(false);
    };

    return (
        <div className="flex h-screen bg-white-100">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <div className="flex-1 p-6">  
                <h1 className="text-2xl font-semibold">Tagihan</h1>
                <div className="mt-10 ">
                  <Search value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} />
                </div>
                <div className="mt-6 bg-gray-100 p-4  shadow rounded-[10px]">
                  <table className="w-full text-center">
                    <thead>
                      <tr className="bg-gray-10 text-gray-600 text-sm ">
                        <th className="py-2 px-4">No</th> 
                        <th className="py-2 px-4">Nama</th> 
                        <th className="py-2 px-4">No.Hp</th>
                        <th className="py-2 px-4">Alamat</th>
                        <th className="py-2 px-4 pr-8">Tagihan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <div className="w-32 h-32 mx-auto">
                                <Lottie animationData={animasiData} loop={true} />
                              </div>
                              <span className="text-gray-500 text-lg mt-1">Loading...</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        searchedTagihan.length > 0 ? (
                          searchedTagihan.map((item, idx) => (
                            <tr key={item.id} className="bg-white rounded-[10px] text-sm text-black-600">
                              <td className="py-3 px-4 rounded-l-[19px]">{idx + 1}</td>
                              <td className="py-3 px-4">{(item as any).user?.name || item.name}</td>
                              <td className="py-3 px-4">{(item as any).user?.phone || item.phone}</td>
                              <td className="py-3 px-4">{item.alamat}</td>
                              <td className="py-3 px-4">Rp. {item.total_harga?.toLocaleString() || '-'}</td>
                              <td className="py-3 px-4 rounded-r-[19px]">
                                <button
                                  className="p-2 bg-[#00ADB5] hover:bg-[#129990] text-white rounded flex "
                                  onClick={() => handleOpenHargaDialog(item)}
                                >
                                  <Icon icon="mdi:cash-plus" width="20" height="20" />
                                  {item.total_harga ? 'Tentukan Harga' : 'Buat Harga'}
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan={7} className="py-4 text-gray-500">Belum ada tagihan.</td></tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
                {showHargaDialog && (
                  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px]">
                      <h2 className="text-lg font-semibold mb-4">{selectedTagihan?.total_harga ? 'Edit Harga Tagihan' : 'Buat Harga Tagihan'}</h2>
                      <input
                        type="number"
                        className="border rounded px-3 py-2 w-full mb-4"
                        placeholder="Masukkan harga (Rp)"
                        value={inputHarga}
                        onChange={e => setInputHarga(e.target.value)}
                        min={0}
                        disabled={saving}
                      />
                      <div className="flex justify-end gap-2">
                        <button className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400" onClick={handleCloseHargaDialog} disabled={saving}>Batal</button>
                        <button className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white" onClick={handleSaveHarga} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
                      </div>
                    </div>
                  </div>
                )}
            </div>
        </div>
    );
}



  