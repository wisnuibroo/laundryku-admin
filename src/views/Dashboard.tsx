import { FaMotorcycle, FaComments, FaClipboardList, FaList } from "react-icons/fa";
import {MdReceiptLong } from "react-icons/md";
import { useState } from "react";
import { ReactNode } from "react";
import BtnQuickAccess from "../components/BtnQuickAccess";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar"; 

export default function Dashboard() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const navigate = useNavigate();

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            {/* Main Content */}
            <div className="flex-1 p-6">
                <h1 className="text-2xl font-semibold">Dashboard</h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-9">
                    {/* Menu Shortcut */}
                    <BtnQuickAccess icon={<FaMotorcycle size={32} />} title="Pesanan" onClick={() => { console.log("Pesanan diklik"); (navigate('/pesanan')) }} />
                    <BtnQuickAccess icon={<MdReceiptLong size={32} />} title="Proses Pesanan" onClick={() => console.log("Proses Pesanan diklik")} />
                    <BtnQuickAccess icon={<FaComments size={32} />} title="Pesan" onClick={() => console.log("Pesan diklik")} />
                    <BtnQuickAccess icon={<FaClipboardList size={32} />} title="Tagihan" onClick={() => console.log("Tagihan diklik")} />
                    <div className="h-full">
                        {/* Laporan bulanan */}
                        <MonthlyReportCard
                            title="Laporan Bulanan"
                            icon={<FaList size={24} />}
                            data={[
                                { label: "Total Pesanan", value: "52" },
                                { label: "Diterima", value: "52" },
                                { label: "Diproses", value: "12" },
                                { label: "Selesai", value: "43" },
                                { label: "Pemasukan", value: 'Rp.000.000' },
                            ]}
                        />
                    </div>
                </div>

                {/* Riwayat Order */}
                <div className="mt-6 bg-white p-4 shadow rounded-lg">
                    <h2 className="text-teal-500 text-lg font-semibold">Riwayat Order</h2>
                    <div className="mt-4 p-4 bg-gray-100 rounded-lg flex justify-between">
                        <div>
                            <p className="font-semibold">Kenas Akia</p>
                            <p className="text-gray-500 text-sm">08112071740</p>
                        </div>
                        <p className="text-gray-400 text-xs">Mitra Kost, Jl. Bae-Besito, Besito Kulon, Jurang, <br />Kec. Gebog, Kabupaten Kudus, Jawa Tengah 59333</p>
                        <div className="pr-3 rounded-lg flex flex-col items-end ">
                            <p className="text-gray-600">18-2-2025</p>
                            <p className="text-gray-600">Rp. 100.000</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

type MonthlyReportCardProps = {
    title: string;
    icon: ReactNode;
    data: { label: string; value: string }[];
};

function MonthlyReportCard({ title, icon, data }: MonthlyReportCardProps) {
    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full">
            {/* Header */}
            <div className="bg-[#00ADB5] text-white px-4 py-3 flex justify-between items-center">
                <h3 className="font-semibold text-lg">{title}</h3>
                <div className="text-white">{icon}</div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-2">
                {data.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm text-gray-600">
                        <span>{item.label}</span>
                        <span className="text-blue-500 font-semibold">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
