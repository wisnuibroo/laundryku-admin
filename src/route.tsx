import { Navigate, createBrowserRouter } from "react-router-dom";
import Login from "./views/Login";
import NotFound from "./views/NotFound";
import DefaultLayout from "./components/DefaultLayout";
import AdminDashboard from "./views/dashboard/admin/Dashboard";
import OwnerDashboard from "./views/dashboard/owner/Dashboard";
import KelolaKaryawanPage from "./views/dashboard/owner/KelolaKaryawanPage";
import LaporanKeuanganPage from "./views/dashboard/owner/LaporanKeuanganPage";
import PengeluaranPage from "./views/dashboard/owner/PengeluaranPage";
import TagihanBlmByrPage from "./views/dashboard/owner/TagihanBlmByrPage";
import TagihanLunasPage from "./views/dashboard/owner/TagihanLunasPage";
import LaporanKeunganPage from "./views/dashboard/owner/LaporanKeuanganPage";
import PengeluaranPage from "./views/dashboard/owner/PengeluaranPage";
import TambahPesananPopup from "./components/TambahPesananPopup";
import EditPesananPopup from "./components/EditPesananPopup";
import LayananPage from "./views/dashboard/owner/LayananPage";
 


// import Register from "./views/register";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DefaultLayout />,
    children: [
      {
        path: "/",
        element: <Navigate to="/login" />,
      },
      {
        path: "/dashboard/admin",
        element: <AdminDashboard />,
      },
      {
        path: "/dashboard/owner",
        element: <OwnerDashboard />,
      },
      {
        path: "/dashboard/owner/kelolakaryawan",
        element: <KelolaKaryawanPage />,
      },
      {
        path: "/dashboard/owner/laporan-keuangan",
        element: <LaporanKeuanganPage />,
      },
      {
        path: "/dashboard/owner/laporan-pengeluaran",
        element: <PengeluaranPage />,
      },
      {
        path: "/dashboard/owner/layanan",
        element: <LayananPage />
      },
      {
        path: "/dashboard/owner/tagihan/belum-bayar",
        element: <TagihanBlmByrPage />,
      },
      {
        path: "/dashboard/owner/tagihan/lunas",
        element: <TagihanLunasPage />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);


export default router;
