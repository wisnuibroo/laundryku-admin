import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "./views/Login";

import DefaultLayout from "./components/DefaultLayout";
import GuestLayout from "./components/GuestLayout";
import NotFound from "./views/NotFound";
import PesananPage from "./views/pesanan/PesananPage";
import RiwayatPage from "./views/RiwayatPage";

import SettingsPage from "./views/settings/SettingsPage";
import TagihanPage from "./views/tagihan/TagihanPage";
import Dashboard from "./views/dashboard/admin/Dashboard";
import EmployeesPage from "./views/dashboard/owner/Dashboard";



// import Register from "./views/register";

const router = createBrowserRouter([
    {
        path: "/",
        element: <DefaultLayout />,
        children: [
            {
                path: "/",
                element: <Navigate to="dashboard/admin" />
            },
            {
                path: "/dashboard/admin",
                element: <Dashboard />
            },
            {
                path: "/dashboard/owner",
                element: <EmployeesPage />
            },
            {
                path: "/pesanan",
                element: <PesananPage />
            },
            {
                path: "/tagihan",
                element: <TagihanPage />
            },
            {
                path: "/riwayat",
                element: <RiwayatPage />
            },
            {
                path: "/settings",
                element: <SettingsPage />
            },
           
          
        ]
    },
    {
        path: "/",
        element: <GuestLayout />,
        children: [
            {
                path: "/login",
                element: <Login />
            },
        ]
    },
    {
        path: "*",
        element: <NotFound />
    }
]);


export default router;
