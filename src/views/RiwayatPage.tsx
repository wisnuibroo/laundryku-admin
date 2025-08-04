import { Icon } from "@iconify/react";
import Search from "../components/search";
import { useState } from "react";

export default function RiwayatPage() {
  const [searchValue, setSearchValue] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  return (
    <div className="flex-1 overflow-auto">
      <nav className="sticky top-0 z-10 w-full flex items-center justify-between bg-white px-6 py-6 shadow mb-2">
        <div className="flex items-center gap-2">
          <Icon icon="mdi:history" className="w-7 h-7 text-[#0065F8]" />
          <span className="text-lg font-bold text-gray-900">Riwayat</span>
        </div>
      </nav>

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="w-full max-w-xl">
            <Search 
              value={searchValue}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Konten riwayat akan ditambahkan di sini */}
        <div className="text-center text-gray-500 py-8">
          Belum ada riwayat transaksi
        </div>
      </div>
    </div>
  );
}



  