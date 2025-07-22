import React, { useState } from "react";

const OverviewCard = () => {
  const [activeTab, setActiveTab] = useState("overview");

//   const tabs = [
//     { key: "overview", label: "Overview" },
//     { key: "layanan", label: "Layanan Terpopuler" },
//     { key: "performa", label: "Performa Karyawan" },
//     { key: "aktivitas", label: "Aktivitas Terbaru" },
//   ];

  return (
    <div className=" mt-8  ">
     
      {/* <div className="flex gap-3 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === tab.key
                ? "bg-white shadow text-black"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div> */}

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border">
            <h3 className="text-xl font-bold mb-1">Status Pesanan</h3>
            <p className="text-sm text-gray-500 mb-4">
              Ringkasan pesanan hari ini
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-blue-100">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                  ⏰ Diproses
                </div>
                <div className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500 text-white">
                  12
                </div>
              </div>
              <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-green-100">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                  ✔️ Selesai
                </div>
                <div className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500 text-white">
                  319
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border">
            <h3 className="text-xl font-bold mb-1">Breakdown Pendapatan</h3>
            <p className="text-sm text-gray-500 mb-4">
              Analisis pendapatan bulan ini
            </p>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1 text-sm font-medium text-gray-800">
                  <span>Cuci Setrika</span>
                  <span>Rp 1,872,000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-600"
                    style={{ width: "93%" }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 text-sm font-medium text-gray-800">
                  <span>Dry Clean</span>
                  <span>Rp 1,350,000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-green-600"
                    style={{ width: "67.5%" }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 text-sm font-medium text-gray-800">
                  <span>Cuci Kering</span>
                  <span>Rp 980,000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-purple-600"
                    style={{ width: "49%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewCard;
