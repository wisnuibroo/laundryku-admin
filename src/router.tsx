import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "./views/Login";
import Dashboard from "./views/dashboard/Dashboard";
import DefaultLayout from "./components/DefaultLayout";
import GuestLayout from "./components/GuestLayout";
import NotFound from "./views/NotFound";
import Pesanan from "./views/Pesanan";
import Tagihan from "./views/Tagihan";
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
                element: <Pesanan />
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
