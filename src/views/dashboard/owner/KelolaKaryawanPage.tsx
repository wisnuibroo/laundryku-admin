import { Icon } from "@iconify/react";
import CardStat from "../../../components/CardStat";
import { useState, useEffect } from "react";
import Search from "../../../components/search";
import { useNavigate } from "react-router-dom";
import adminService, { Admin, AdminStats } from "../../../data/service/adminService";
import { useStateContext } from "../../../contexts/ContextsProvider";


export default function KelolaKaryawanPage() {
  const navigate = useNavigate();
  const { user, token } = useStateContext();
  const [openDialog, setOpenDialog] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [employees, setEmployees] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
const [phone, setPhone] = useState("");

  const [error, setError] = useState<string | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };


  const [stats, setStats] = useState<AdminStats>({
    total_karyawan: 0,
    karyawan_aktif: 0,
    karyawan_baru: 0,
    ratarataRating: 0
  });

  // Fetch data from API
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cek token dari localStorage
      const localToken = localStorage.getItem('ACCESS_TOKEN');
      if (!localToken && !token) {
        navigate('/login');
        return;
      }
      
      // Gunakan token dari localStorage jika token dari context tidak ada
      if (!token && localToken) {
        console.log('Using token from localStorage for employee data');
      }
      
      // Ambil data karyawan dan statistik secara terpisah untuk error handling yang lebih baik
      let employeesData: Admin[] = [];
      let statsData: AdminStats = {
        total_karyawan: 0,
        karyawan_aktif: 0,
        karyawan_baru: 0,
        ratarataRating: 0
      };
      
      try {
        employeesData = await adminService.getAdminsForCurrentOwner();
        setEmployees(employeesData);
      } catch (empError: any) {
        console.error('Error fetching employees:', empError);
        setError(empError.errors?.general?.[0] || 'Gagal memuat data karyawan');
      }
      
      try {
        statsData = await adminService.getAdminStats();
        setStats(statsData);
      } catch (statsError: any) {
        console.error('Error fetching stats:', statsError);
        // Jika gagal mengambil statistik, hitung dari data karyawan yang berhasil diambil
        if (employeesData.length > 0) {
          setStats({
            total_karyawan: employeesData.length,
            karyawan_aktif: employeesData.filter(emp => emp.status === 'aktif').length,
            karyawan_baru: 0, // Tidak bisa menentukan karyawan baru tanpa timestamp
            ratarataRating: 0 // Tidak bisa menghitung rating tanpa data rating
          });
        }
      }
    } catch (err: any) {
      console.error('Error in main try block:', err);
      setError(err.errors?.general?.[0] || 'Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Set up interval to refresh data every 60 seconds
    const intervalId = setInterval(() => {
      fetchData();
    }, 60000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [token, navigate]);



  

  const filteredEmployees = employees.filter((emp) =>
    [emp.name, emp.email, emp.nomor].some((field) =>
      field.toLowerCase().includes(searchText.toLowerCase())
    )
  );

  // Form state for adding new employee
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    nomor: string;
    status: 'aktif' | 'nonaktif';
    password: string;
  }>({
    name: '',
    email: '',
    nomor: '',
    status: 'aktif',
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await adminService.createAdmin(formData);
      setOpenDialog(false);
      setFormData({
        name: '',
        email: '',
        nomor: '',
        status: 'aktif',
        password: ''
      });
      // Refresh data
      await fetchData();
    } catch (err: any) {
      console.error('Error creating admin:', err);
      setError(err.errors?.general?.[0] || 'Gagal menambah karyawan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus karyawan ini?')) {
      try {
        await adminService.deleteAdmin(id);
        await fetchData(); // Refresh data
      } catch (err: any) {
        console.error('Error deleting admin:', err);
        setError(err.errors?.general?.[0] || 'Gagal menghapus karyawan');
      }
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'aktif' ? 'nonaktif' : 'aktif';
      await adminService.updateAdmin(id, { status: newStatus });
      await fetchData(); // Refresh data
    } catch (err: any) {
      console.error('Error updating admin status:', err);
      setError(err.errors?.general?.[0] || 'Gagal mengubah status karyawan');
    }
  };

  if (loading) {
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
        <div className="p-6 flex justify-center items-center h-64">
          <div className="text-center">
            <Icon icon="eos-icons:loading" className="w-8 h-8 mx-auto mb-2" />
            <p>Memuat data karyawan...</p>
          </div>
        </div>
      </div>
    );
  }

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
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 float-right"
          >
            ×
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
            <form onSubmit={handleSubmit}>
              <label className="block text-sm font-medium mb-1">Nama Karyawan *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Nama"
                required
                className="w-full border p-2 rounded mb-3"/>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Nomor HP (Whatsapp) *</label>
              <input
                type="text"
                name="nomor"
                value={formData.nomor}
                onChange={(e) => {
                  const value = e.target.value;
              
                  // Hanya angka, panjang maksimal 13, dan harus diawali dengan "08"
                  if (/^0?$|^08[0-9]{0,11}$/.test(value)) {
                    setFormData(prev => ({ ...prev, nomor: value }));
                  }
                }}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                required
                disabled={loading}
                placeholder="Contoh: 081234567890"
                autoComplete="off"
              />
            </div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                required
                className="w-full border p-2 rounded mb-3"/>
             <div className="relative mb-3">
             <label className="block text-sm font-medium mb-1">Password *</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                required
                minLength={6}
                className="w-full border p-2 pr-10 rounded"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 mt-3"
              >
                <Icon
                  icon={showPassword ? "mdi:eye-outline" : "mdi:eye-off-outline"}
                  className="text-xl"
                />
              </button>
            </div>

              <label className="block text-sm font-medium mb-1">Status Karyawan Saat Ini *</label>
              <select
                name="status"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'aktif' | 'nonaktif' }))}
                className="w-full border p-2 rounded mb-3"
              >
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Non-aktif</option>
              </select>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpenDialog(false);
                    setFormData({
                       name: '',
                       email: '',
                       nomor: '',
                       status: 'aktif',
                       password: ''
                     });
                  }}
                  disabled={submitting}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <Icon icon="eos-icons:loading" className="w-4 h-4" />}
                  {submitting ? 'Menambahkan...' : 'Tambahkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
         </div>


            {filteredEmployees.length === 0 ? (
              <div className="text-center py-8">
                <Icon icon="mdi:account-off-outline" className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Tidak ada karyawan yang ditemukan</p>
                {searchText && (
                  <p className="text-sm text-gray-400 mt-2">
                    Coba ubah kata kunci pencarian
                  </p>
                )}
              </div>
            ) : (
              <ul className="space-y-2 mt-5">
                {filteredEmployees.map((emp) => (
                  <li
                    key={emp.id}
                    className="flex justify-between items-center p-4 border rounded hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <Icon icon="mdi:account" className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{emp.name}</p>
                        <p className="font-light text-sm">{emp.nomor}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <p className="text-gray-700">{emp.email}</p>
                        <button
                          onClick={() => handleToggleStatus(emp.id, emp.status)}
                          className={`font-medium text-sm px-2 py-1 rounded ${
                            emp.status === "aktif" 
                              ? "text-green-600 bg-green-100 hover:bg-green-200" 
                              : "text-red-500 bg-red-100 hover:bg-red-200"
                          }`}
                        >
                          {emp.status}
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeleteEmployee(emp.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Hapus karyawan"
                        >
                          <Icon icon="mdi:delete-outline" className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
       </div>
    </div>
  );
}
