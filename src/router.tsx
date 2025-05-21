import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "./views/Login";
import Dashboard from "./views/dashboard/Dashboard";
import DefaultLayout from "./components/DefaultLayout";
import GuestLayout from "./components/GuestLayout";
import NotFound from "./views/NotFound";
import PesananPage from "./views/pesanan/PesananPage";
import RiwayatPage from "./views/RiwayatPage";

import SettingsPage from "./views/settings/SettingsPage";
import TagihanPage from "./views/tagihan/TagihanPage";



// import Register from "./views/register";

const router = createBrowserRouter([
    {
        path: "/",
        element: <DefaultLayout />,
        children: [
            {
                path: "/",
                element: <Navigate to="/dashboard" />
            },
            {
                path: "/dashboard",
                element: <Dashboard />
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
            }
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
