import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "./views/Login";
import Dashboard from "./views/dashboard/Dashboard";
import DefaultLayout from "./components/DefaultLayout";
import GuestLayout from "./components/GuestLayout";
import NotFound from "./views/NotFound";
import Tagihan from "./views/Tagihan";
import DicuciPage from "./views/pesanan/DicuciPage";
import DiambilPage from "./views/pesanan/DiambilPage";
import PesananPage from "./views/pesanan/PesananPage";
import SelesaiPage from "./views/pesanan/SelesaiPage";



// import Register from "./views/register"; // Pastikan ini ada

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
                path: "/pesanan/diambil",
                element: <DiambilPage />
            },
            {
                path: "/pesanan/dicuci",
                element: <DicuciPage />
            },
            {
                path: "/pesanan/selesai",
                element: <SelesaiPage />
            },
            {
                path: "/tagihan",
                element: <Tagihan />
            }
        ]
    },
    {
        path: "/login",
        element: <GuestLayout />,
        children: [
            {
                path: "",
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
