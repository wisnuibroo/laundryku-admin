import { Icon } from "@iconify/react";
import CardStat from "../../../components/CardStat";
import { useState, useEffect } from "react";
import Search from "../../../components/search";
import { useNavigate } from "react-router-dom";


export default function KelolaKaryawanPage() {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [employees, setEmployees] = useState<Array<{
    id: number;
    name: string;
    email: string;
    phone: string;
    status: string;
    avatar: string;
  }>>([
    {
      id: 5,
      name: "Rina Wati",
      email: "rina@laundry.com",
      phone: "081234567894",
      status: "inactive",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 6,
      name: "Dedi Kurniawan",
      email: "dedi@laundry.com",
      phone: "081234567895",
      status: "active",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 7,
      name: "Lina Marlina",
      email: "lina@laundry.com",
      phone: "081234567896",
      status: "active",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 8,
      name: "Rudi Hartono",
      email: "rudi@laundry.com",
      phone: "081234567897",
      status: "active",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };


  const [stats, setStats] = useState({
    total_karyawan: 0,
    karyawan_aktif: 0,
    karyawan_baru: 0,
    ratarataRating: 0

  });

  useEffect(() => {
    // Simulasi fetch data (ganti dengan API asli jika ada)
    setStats({
      total_karyawan: 120,
      karyawan_aktif: 3,
      karyawan_baru: 4,
      ratarataRating: 4.6
    });
  }, []);



  

  const filteredEmployees = employees.filter((emp) =>
    [emp.name, emp.email].some((field) =>
      field.toLowerCase().includes(searchText.toLowerCase())
    )
  );

  return (
    <div className="flex-1 overflow-auto">
       <nav className="sticky top-0 z-10 w-full flex items-center justify-between bg-white px-6 py-6 shadow mb-2">
          <div className="flex items-center gap-2">
            <Icon icon={"material-symbols-light:arrow-back-rounded"} className="w-7 h-7 object-contain" onClick={() => navigate(-1)}/>
            <Icon icon={"stash:user-group-duotone"} className="w-7 h-7 text-[#9929EA]" />
            <span className="text-lg font-bold text-gray-900">Kelola Karyawan</span>
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
        <CardStat
          icon={<Icon icon="stash:user-group-duotone" width={24} />}
          label="Total Karyawan"
          value={stats.total_karyawan.toString()}
          subtitle="Semua Karyawan"
          iconColor="#9929EA"
        />
        <CardStat
          icon={<Icon icon="mdi:person-outline" width={24} />}
          label="Karyawan Aktif"
          value={stats.karyawan_aktif.toString()}
          subtitle="Sedang Bekerja"
          iconColor="#EB5B00"
        />
        <CardStat
          icon={<Icon icon="material-symbols:person-add-outline-rounded" width={24} />}
          label="Karyawan Baru"
          value={stats.karyawan_baru.toString()}
          subtitle="Bulan ini"
          iconColor="#0065F8"
        />
        <CardStat
          icon={<Icon icon="tabler:star" width={24} />}
          label="Rata-rata Rating"
          value={stats.ratarataRating.toString()}
          subtitle="Performa Karyawan"
          iconColor="#FFCC00"
        />
      </div>

          <div className="bg-white p-6 rounded-lg shadow mt-5">
            <h3 className="text-3xl font-semibold ">Daftar Karyawan</h3>
            <h2>Kelola informasi dan performa karyawan</h2>
           
           <div className="mt-3 flex flex-col md:flex-row justify-between items-center gap-3">

           <div className="w-full md:w-3/4">
             <Search value={searchText} onChange={handleSearchChange} />
           </div>
         
         
          <button
              onClick={() => setOpenDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition">
            <Icon icon="tabler:user-plus" className="w-5 h-5" />
            <span className="font-semibold">Tambah Karyawan</span>
          </button>

      {openDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-md">
            <h2 className="text-xl font-bold mb-4">Tambah Karyawan</h2>
            <form>
              <input
                type="text"
                placeholder="Nama"
                className="w-full border p-2 rounded mb-3"/>
                <input
                type="text"
                placeholder="Nomor HP"
                className="w-full border p-2 rounded mb-3"/>
              <input
                type="email"
                placeholder="Email"
                className="w-full border p-2 rounded mb-3"/>
              <input
                type="password"
                placeholder="Password"
                className="w-full border p-2 rounded mb-3"/>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpenDialog(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Batal</button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Tambahkan</button>
              </div>
            </form>
          </div>
        </div>
      )}
         </div>


            <ul className="space-y-2 mt-5">
              {filteredEmployees.map((emp) => (
                <li
                  key={emp.id}
                  className="flex justify-between items-center p-4 border rounded hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-semibold">{emp.name}</p>
                      <p className="font-light text-sm">{emp.phone}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-gray-700">{emp.email}</p>
                    <p className={`font-medium ${emp.status === "active" ? "text-green-600" : "text-red-500"}`}>
                      {emp.status}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
       </div>
    </div>
  );
}
