import { Icon } from "@iconify/react";
import CardStat from "../../../components/CardStat";
import { useState, useEffect } from "react";
import Search from "../../../components/search";
import { useNavigate } from "react-router-dom";
import React from "react";

interface Tagihan {
  id_pesanan: string;
  jenis: string;
  tanggal: string;
  jatuh_tempo: string;
  total: number;
  overdue: string;
}

interface Pelanggan {
  id: number;
  name: string;
  phone: string;
  jumlah_tagihan: number;
  total_tagihan: number;
  status: string;
  tagihan: Tagihan[];
}

export default function TagihanBlmByrPage() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Pelanggan | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openRowId, setOpenRowId] = useState<number | null>(null);

  const [stats, setStats] = useState({
    total_pelanggan: 0,
    total_tagihan: 0,
    nilai_tagihan: 0,
    overduedate: 0,
  });

  const pelanggan: Pelanggan[] = [
    {
      id: 1,
      name: "Yusuf Rizqy Mubarok",
      phone: "082231233019",
      jumlah_tagihan: 3,
      total_tagihan: 150000,
      status: "Belum Lunas",
      tagihan: [
        {
          id_pesanan: "ORD-001",
          jenis: "Kiloan",
          tanggal: "2024-01-10",
          jatuh_tempo: "2024-01-15",
          total: 50000,
          overdue: "3 Hari",
        },
        {
          id_pesanan: "ORD-002",
          jenis: "Satuan",
          tanggal: "2024-02-20",
          jatuh_tempo: "2024-02-25",
          total: 50000,
          overdue: "1 Hari",
        },
        {
          id_pesanan: "ORD-003",
          jenis: "Selimut",
          tanggal: "2024-03-12",
          jatuh_tempo: "2024-03-17",
          total: 50000,
          overdue: "5 Hari",
        },
      ],
    },
    {
      id: 2,
      name: "Rayhan Fathurrahman",
      phone: "081234567890",
      jumlah_tagihan: 2,
      total_tagihan: 100000,
      status: "Belum Lunas",
      tagihan: [
        {
          id_pesanan: "ORD-010",
          jenis: "Kiloan",
          tanggal: "2024-04-01",
          jatuh_tempo: "2024-04-06",
          total: 50000,
          overdue: "2 Hari",
        },
        {
          id_pesanan: "ORD-011",
          jenis: "Satuan",
          tanggal: "2024-05-01",
          jatuh_tempo: "2024-05-06",
          total: 50000,
          overdue: "4 Hari",
        },
      ],
    },
  ];

  useEffect(() => {
    setStats({
      total_pelanggan: pelanggan.length,
      total_tagihan: pelanggan.reduce((acc, p) => acc + p.jumlah_tagihan, 0),
      nilai_tagihan: pelanggan.reduce((acc, p) => acc + p.total_tagihan, 0),
      overduedate: 2.9,
    });
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleFilterClick = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const toggleRow = (id: number) => {
    setOpenRowId(openRowId === id ? null : id);
  };

  const filteredPelanggan = pelanggan.filter((emp) =>
    [
      emp.name,
      emp.phone,
      emp.jumlah_tagihan.toString(),
      emp.total_tagihan.toString(),
      emp.status,
    ].some((field) => field.toLowerCase().includes(searchText.toLowerCase()))
  );

  return (
    <div className="flex-1 overflow-auto">
      <nav className="sticky top-0 z-10 w-full flex items-center justify-between bg-white px-6 py-6 shadow mb-2">
        <div className="flex items-center gap-2">
          <Icon
            icon={"material-symbols-light:arrow-back-rounded"}
            className="w-7 h-7 object-contain cursor-pointer"
            onClick={() => navigate("/dashboard/owner")}
          />
          <Icon icon={"ion:card-outline"} className="w-7 h-7 text-[#DC2525]" />
          <span className="text-lg font-bold text-gray-900">Tagihan Belum Bayar</span>
        </div>
        <div className="flex items-center gap-6">
          <button className="text-gray-500 hover:text-gray-700">
            <Icon icon="mdi:bell-outline" width={22} />
          </button>
          <div className="flex items-center gap-2">
            <Icon icon="mdi:account-circle-outline" width={22} className="text-gray-700" />
            <span className="text-sm text-gray-700">Owner</span>
          </div>
        </div>
      </nav>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <CardStat icon={<Icon icon="stash:user-group-duotone" width={24} />} label="Total Pelanggan" value={stats.total_pelanggan.toString()} subtitle="Punya tagihan" iconColor="#DC2525" />
          <CardStat icon={<Icon icon="mdi:person-outline" width={24} />} label="Total Tagihan" value={stats.total_tagihan.toString()} subtitle="Belum bayar" iconColor="#DC2525" />
          <CardStat icon={<Icon icon="material-symbols:person-add-outline-rounded" width={24} />} label="Nilai Tagihan" value={`Rp ${stats.nilai_tagihan.toLocaleString("id-ID")}`} subtitle="Total outstanding" iconColor="#DC2525" />
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => navigate("/dashboard/owner/tagihan/belum-bayar")}
            className="flex items-center gap-2 px-4 py-2 rounded bg-red-700 text-white font-semibold shadow">
            <Icon icon="mdi:credit-card-outline" width={18} />Belum Bayar
          </button>
          <button
            onClick={() => navigate("/dashboard/owner/tagihan/lunas")}
            className="flex items-center gap-2 px-4 py-2 rounded border border-gray-300 bg-white text-black font-semibold shadow">
            <Icon icon="mdi:credit-card-outline" width={18} />Sudah Lunas
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mt-5 border">
          <h3 className="text-3xl font-semibold">Tagihan Belum Bayar (Dikelompokkan per Pelanggan)</h3>
          <h2>Klik nama pelanggan untuk melihat detail tagihan</h2>

          <div className="mt-3 flex flex-col md:flex-row items-center gap-3">
            <div className="w-full md:w-1/2">
              <Search value={searchText} onChange={handleSearchChange} />
            </div>
            <div className="w-full md:w-auto">
              <button onClick={handleFilterClick} className="flex items-center gap-1 border rounded px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <Icon icon="mdi:filter-variant" width={16} />
                Filter
              </button>
            </div>
          </div>

          <div className="overflow-x-auto mt-6">
            <table className="min-w-full border text-sm rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-gray-600 text-sm">
                <tr>
                  <th className="px-4 py-3 text-left">Pelanggan</th>
                  <th className="px-4 py-3 text-left">Jumlah Tagihan</th>
                  <th className="px-4 py-3 text-left">Total Tagihan</th>
                  <th className="px-4 py-3 text-left">Status Terburuk</th>
                  <th className="px-4 py-3 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {filteredPelanggan.map((cust) => (
                  <React.Fragment key={cust.id}>
                    <tr className="border-b bg-red-50 hover:bg-red-100 cursor-pointer" onClick={() => toggleRow(cust.id)}>
                      <td className="px-4 py-3">
                        <p className="font-semibold">{cust.name}</p>
                        <p className="text-xs text-gray-500">{cust.phone}</p>
                      </td>
                      <td className="px-4 py-3">{cust.jumlah_tagihan} tagihan</td>
                      <td className="px-4 py-3 font-medium">Rp {cust.total_tagihan.toLocaleString("id-ID")}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 bg-red-500 text-white rounded-full">
                          Status {cust.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium">
                          Lunas Semua
                        </button>
                        <button
                          className="text-gray-700 hover:text-black"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomer(cust);
                          }}
                        >
                          <Icon icon="proicons:eye" width={18} />
                        </button>
                      </td>
                    </tr>
                    {openRowId === cust.id && (
                      <tr>
                        <td colSpan={5}>
                          <div className="   ">
                            {cust.tagihan.map((tgh, idx) => (
                              <div key={idx} className="flex justify-between items-center border rounded p-3 bg-white shadow-sm">
                                <div>
                                  <p className="font-semibold">{tgh.id_pesanan}</p>
                                  <p className="text-xs text-gray-500">{tgh.jenis}</p>
                                </div>
                                <div>
                                  <p className="text-sm">Tanggal: {tgh.tanggal}</p>
                                  <p className="text-xs text-gray-500">Due: {tgh.jatuh_tempo}</p>
                                </div>
                                <div className="text-sm font-medium">
                                  Rp {tgh.total.toLocaleString("id-ID")}
                                </div>
                                <div>
                                  <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full">
                                    Belum lunas {tgh.overdue} lalu
                                  </span>
                                </div>
                                <div>
                                  <button className="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-800">
                                    Tandai Lunas
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-2xl rounded-lg p-6 shadow-lg relative">
            <button
              className="absolute top-2 right-3 text-xl text-gray-600 hover:text-black"
              onClick={() => setSelectedCustomer(null)}
            >
              &times;
            </button>

            <h2 className="text-xl font-bold mb-4">Detail Tagihan - {selectedCustomer.name}</h2>
            <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Nama Pelanggan</p>
                <p className="font-semibold">{selectedCustomer.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Telepon</p>
                <p>{selectedCustomer.phone}</p>
              </div>
              <div>
                <p className="text-gray-500">Total Tagihan</p>
                <p className="text-red-600 font-semibold">Rp {selectedCustomer.total_tagihan.toLocaleString("id-ID")}</p>
              </div>
              <div>
                <p className="text-gray-500">Jumlah Pesanan</p>
                <p className="font-semibold">{selectedCustomer.tagihan.length} pesanan</p>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-2">Rincian Tagihan</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {selectedCustomer.tagihan.map((tgh, idx) => (
                <div key={idx} className="flex justify-between items-center border rounded p-3 bg-red-50">
                  <div>
                    <p className="font-semibold">{tgh.id_pesanan}</p>
                    <p className="text-xs text-gray-500">{tgh.jenis}</p>
                  </div>
                  <div>
                    <p className="text-sm">Tanggal: {tgh.tanggal}</p>
                    <p className="text-xs text-gray-500">Due: {tgh.jatuh_tempo}</p>
                  </div>
                  <div className="text-sm font-medium">Rp {tgh.total.toLocaleString("id-ID")}</div>
                  <div>
                    <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full">
                      Overdue {tgh.overdue}
                    </span>
                  </div>
                  <div>
                    <button className="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-800">
                      Tandai Lunas
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex justify-end mt-4">
                <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                  Tandai Semua Lunas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
