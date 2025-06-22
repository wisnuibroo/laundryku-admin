import { useState } from "react";
import { My_EmployeeSearch } from "./EmployeeSearch";
import { My_EmployeeDialog } from "./EmployeeDialog";
import { My_EmployeeList } from "./EmployeeList";
import { Icon } from "@iconify/react/dist/iconify.js";

export function My_EmployeeTabs({
  isAddDialogOpen,
  setIsAddDialogOpen,
  newEmployee,
  setNewEmployee,
  searchTerm,
  setSearchTerm,
  filteredEmployees,
}) {
  const [activeTab, setActiveTab] = useState("pendapatan");

  return (
    <div className="mb-6">
      {/* Tombol Tab */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setActiveTab("pendapatan")}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeTab === "pendapatan"
              ? "bg-white text-black shadow"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          Analisis Pendapatan
        </button>
    
        <button
          onClick={() => setActiveTab("transaksi")}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeTab === "transaksi"
              ? "bg-white text-black shadow"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          Transaksi Terbaru
        </button>
        <button
          onClick={() => setActiveTab("karyawan")}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeTab === "karyawan"
              ? "bg-white text-black shadow"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          Manajemen Karyawan
        </button>
      </div>

      {/* Konten Tab */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        {activeTab === "pendapatan" && (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Kiri: Tren Pendapatan Bulanan */}
      <div className="border-r md:pr-6">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2"><Icon icon="mdi:chart-line" className="w-6 h-6 text-gray-800"/>Tren Pendapatan Bulanan</h2>
          <p className="text-sm text-gray-500">Performa pendapatan 4 bulan terakhir</p>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {[
            {
              month: "Jan 2024",
              orders: 280,
              revenue: "Rp 12,500,000",
              customers: 120,
            },
            {
              month: "Feb 2024",
              orders: 295,
              revenue: "Rp 13,200,000",
              customers: 135,
            },
            {
              month: "Mar 2024",
              orders: 315,
              revenue: "Rp 14,100,000",
              customers: 142,
            },
            {
              month: "Apr 2024",
              orders: 342,
              revenue: "Rp 15,750,000",
              customers: 156,
            },
          ].map((item, idx) => (
            <div key={idx} className="bg-gray-50 px-4 py-3 rounded-lg shadow-sm flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium">{item.month}</h3>
                <p className="text-xs text-gray-500">{item.orders} pesanan</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{item.revenue}</p>
                <p className="text-xs text-gray-500">{item.customers} pelanggan</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kanan: Metrik Performa */}
      <div>
        <h2 className="text-2xl font-semibold flex items-center gap-2"><Icon icon="ix:stopwatch" className="w-6 h-6 text-gray-800"/>Metrik Performa</h2>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">8</p>
            <p className="text-sm text-gray-700">Karyawan Aktif</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600">94%</p>
            <p className="text-sm text-gray-700">Kepuasan Pelanggan</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">2.3</p>
            <p className="text-sm text-gray-700">Hari Rata-rata</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">87%</p>
            <p className="text-sm text-gray-700">Pelanggan Kembali</p>
          </div>
        </div>
      </div>
    </div>
        )}
        {activeTab === "transaksi" && (
         <div className="  bg-white rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold">Transaksi Terbaru</h2>
          <p className="text-sm text-gray-500">Daftar transaksi pelanggan terbaru</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800">
           <Icon icon="material-symbols:download" width={22} />
          Download
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-700 border-collapse">
          <thead className="bg-gray-100 text-gray-700 font-semibold">
            <tr>
              <th className="px-4 py-3">ID Transaksi</th>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Pelanggan</th>
              <th className="px-4 py-3">Jumlah</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Jenis Pembayaran</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: "TRX-001", date: "2024-01-15", name: "Budi Santoso", amount: "Rp 35,000", status: "Selesai", jenispembayaran: "Cash" },
              { id: "TRX-002", date: "2024-01-15", name: "Siti Aminah", amount: "Rp 25,000", status: "Selesai", jenispembayaran: "Transfer"  },
              { id: "TRX-003", date: "2024-01-14", name: "Ahmad Rahman", amount: "Rp 45,000", status: "Selesai", jenispembayaran: "Cash"  },
              { id: "TRX-004", date: "2024-01-14", name: "Maya Sari", amount: "Rp 40,000", status: "Pending", jenispembayaran: "Cash"  },
              { id: "TRX-005", date: "2024-01-13", name: "Rudi Hartono", amount: "Rp 30,000", status: "Selesai", jenispembayaran: "Cash"  },
            ].map((trx) => (
              <tr key={trx.id} className="border-t">
                <td className="px-4 py-3 font-medium">{trx.id}</td>
                <td className="px-4 py-3">{trx.date}</td>
                <td className="px-4 py-3">{trx.name}</td>
                <td className="px-4 py-3">{trx.amount}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                      trx.status === "Selesai"
                        ? "text-white bg-black"
                        : "text-gray-800 bg-gray-200"
                    }`}
                  >
                    {trx.status}
                  </span>
                </td>
                 <td className="px-4 py-3">{trx.jenispembayaran}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
        )}
        {activeTab === "karyawan" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold">Daftar Karyawan</h2>
                <p className="text-sm text-gray-500">Kelola informasi dan status karyawan</p>
              </div>
              <My_EmployeeDialog
                isOpen={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                newEmployee={newEmployee}
                setNewEmployee={setNewEmployee}
              />
            </div>
            <My_EmployeeSearch value={searchTerm} onChange={setSearchTerm} />
            <My_EmployeeList employees={filteredEmployees} />
          </div>
        )}
      </div>
    </div>
  );
}
