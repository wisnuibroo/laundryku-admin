import { FaMotorcycle, FaComments, FaClipboardList } from "react-icons/fa";
import { MdDashboard, MdHistory, MdSettings, MdMenu, MdClose } from "react-icons/md";
import { useState } from "react";
import { ReactNode } from "react";

export default function Pesanan() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className={`bg-[#00ADB5] text-white p-5 space-y-6 transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-16"}`}>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-xl focus:outline-none">
                    {isSidebarOpen ? <MdClose /> : <MdMenu />}
                </button>
                <div className="flex flex-col space-y-6">
                    <SidebarItem icon={<MdDashboard size={24} />} text="Dashboard" isOpen={isSidebarOpen} />
                    <SidebarItem icon={<FaMotorcycle size={24} />} text="Pesanan" isOpen={isSidebarOpen} />
                    <SidebarItem icon={<MdHistory size={24} />} text="Riwayat" isOpen={isSidebarOpen} />
                    <SidebarItem icon={<FaComments size={24} />} text="Pesan" isOpen={isSidebarOpen} />
                    <SidebarItem icon={<FaClipboardList size={24} />} text="Tagihan" isOpen={isSidebarOpen} />
                    <SidebarItem icon={<MdSettings size={24} />} text="Pengaturan" isOpen={isSidebarOpen} />
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 p-6">  
                <h1 className="text-2xl font-semibold">Pesanan Harus Diambil</h1>

                {/* Tabel */}
                <div className="mt-6 bg-gray p-4  shadow rounded-lg">
                  <table className="w-full text-center">
                    <thead>
                      <tr className="bg-gray-10 text-gray-600 text-sm ">
                        <th className="py-2 px-4">Status</th> 
                        <th className="py-2 px-4">Nama</th> 
                        <th className="py-2 px-4">No.Hp</th>
                        <th className="py-2 px-4">Alamat</th>
                        <th className="py-2 pl-4 pr-8">Tanggal</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white rounded-[10px]">
                        <td className="py-3 px-4 rounded-l-[19px]">Harus Diambil</td>
                        <td className="py-3 px-4">Kenas Akia</td>
                        <td className="text-gray-800">08112071740</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          Mitra Kost, Jl. Bae-Besito, Besito Kulon, Jurang,<br />
                          Kec. Gebog, Kabupaten Kudus, Jawa Tengah 59333
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">18-2-2025</td>
                        <td className="py-3 pl-4 align-middle rounded-r-[19px]">
                        <button type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                          >Selesai
                        </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
            </div>
        </div>
    );
}

type SidebarItemProps = {
    icon: ReactNode;
    text: string;
    isOpen: boolean;
  };

function SidebarItem({ icon, text, isOpen }: SidebarItemProps) {
    return (
      <div className="flex items-center space-x-2">
        {icon}
        {isOpen && <span>{text}</span>}
      </div>
    );
  }
  