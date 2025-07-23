import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "./views/Login";

import DefaultLayout from "./components/DefaultLayout";
import GuestLayout from "./components/GuestLayout";
import NotFound from "./views/NotFound";
// import PesananPage from "./views/pesanan/PesananPage";
import RiwayatPage from "./views/RiwayatPage";

import SettingsPage from "./views/settings/SettingsPage";
import TagihanPage from "./views/tagihan/TagihanPage";
import Dashboard from "./views/dashboard/admin/Dashboard";
import EmployeesPage from "./views/dashboard/owner/Dashboard";
import TambahPesananPage from "./views/pesanan/TambahPesananPage";
import OwnerDashboard from "./views/dashboard/owner/Dashboard";
import KelolaKaryawanPage from "./views/dashboard/owner/KelolaKaryawanPage";
import TagihanBlmByrPage from "./views/dashboard/owner/TagihanBlmByrPage";
import TagihanLunasPage from "./views/dashboard/owner/TagihanLunasPage";
import LaporanKeunganPage from "./views/dashboard/owner/LaporanKeuanganPage";
import PengeluaranPage from "./views/dashboard/owner/PengeluaranPage";



// import Register from "./views/register";

const route = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
    children: [
      {
       
      }
    ]
  },
  {
    path: "/",
    element: <DefaultLayout />,
    children: [
      {
        path: "/",
        element: <Navigate to="/login" />
      },
      {
        path: "/dashboard/admin",
        element: <Dashboard />
      },
      {
        path: "/dashboard/owner",
        element: <OwnerDashboard />
      },
      // {
      //   path: "/pesanan",
      //   element: <PesananPage />
      // },
      {
        path: "/pesanan/tambah",
        element: <TambahPesananPage />
      },
      {
        path: "/dashboard/owner/laporan-keuangan",
        element: <LaporanKeunganPage />
      },
      {
        path: "/dashboard/owner/laporan-pengeluaran",
        element: <PengeluaranPage />
      },

      {
        path: "/dashboard/owner/kelolakaryawan",
        element: <KelolaKaryawanPage />
      },
      {
        path: "/dashboard/owner/tagihan/belum-bayar",
        element: <TagihanBlmByrPage />
      },
      {
        path: "/dashboard/owner/tagihan/lunas",
        element: <TagihanLunasPage />
      },

      // {
      //   path: "/tagihan",
      //   element: <TagihanPage />
      // },
      // {
      //   path: "/riwayat",
      //   element: <RiwayatPage />
      // },
      // {
      //   path: "/settings",
      //   element: <SettingsPage />
      // }
    ]
  },
  {
    path: "*",
    element: <NotFound />
  }
]);


export default route;
