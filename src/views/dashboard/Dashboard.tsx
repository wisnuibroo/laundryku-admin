import { useState } from "react";
import BtnQuickAccess from "../../components/BtnQuickAccess";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { Icon } from "@iconify/react";
import PemasukanCard from "../../components/PemasukanCard";
import MonthlyReportCard from "../../components/MonthlyCard";

export default function Dashboard() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex-1 p-6">
                <h1 className="text-2xl font-semibold">Dashboard</h1>

                <div className="grid  lg:grid-cols-5 gap-9 mt-10 ">
                    <BtnQuickAccess
                        icon={<Icon icon="streamline:transfer-motorcycle-solid" width={60} />}
                        title="Pesanan"
                        onClick={() => navigate("/pesanan")}
                    />
                    <BtnQuickAccess
                        icon={<Icon icon="material-symbols:history" width={60} />}
                        title="Riwayat"
                    />
                   
                    <BtnQuickAccess
                        icon={<Icon icon="solar:bill-list-bold" width={60} />}
                        title="Tagihan"
                        onClick={() => {
                            console.log("Tagihan diklik");
                            navigate("/tagihan");
                        }}
                    />
                    <div className="h-full">
                        <MonthlyReportCard
                            title="Laporan Bulanan"
                            icon={<Icon icon="streamline:task-list-solid" width={24} />}
                            data={[
                                { label: "Total Pesanan", value: "3" },
                                { label: "Diterima", value: "0" },
                                { label: "Diproses", value: "2" },
                                { label: "Selesai", value: "1" },
                            ]}
                        />
                    </div>


                    <div className="justify-end ">
                       <PemasukanCard
                           title="Pemasukan"
                           icon={<Icon icon="fluent:wallet-credit-card-32-filled" width={30} />}
                           data={[
                               { value: "Rp. 470.000" },
                           ]}
                           waktu="Minggu ini"
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
                        <p className="text-gray-400 text-xs">
                            Mitra Kost, Jl. Bae-Besito, Besito Kulon, Jurang, <br />
                            Kec. Gebog, Kabupaten Kudus, Jawa Tengah 59333
                        </p>
                        <div className="pr-3 rounded-lg flex flex-col items-end">
                            <p className="text-gray-600">18-2-2025</p>
                            <p className="text-gray-600">Rp. 100.000</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
    );
}

