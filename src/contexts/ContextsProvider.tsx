import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useEffect } from "react";

const ACCESS_TOKEN = "ACCESS_TOKEN";
const USER_TYPE = "USER_TYPE";
const USER_DATA = "USER_DATA";

// Tipe data untuk user/admin/owner
export interface User {
    id: number;
    name?: string;        // untuk admin
    username?: string;    // untuk owner
    email: string;
    nama_laundry?: string; // untuk owner
}

// Tipe data untuk konteks
interface StateContextType {
    user: User | null;
    token: string | null;
    userType: 'user' | 'admin' | 'owner' | null;
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    setUserType: (userType: 'user' | 'admin' | 'owner' | null) => void;
}

// Nilai default untuk context
const StateContext = createContext<StateContextType>({
    user: null,
    token: localStorage.getItem(ACCESS_TOKEN),
    userType: localStorage.getItem(USER_TYPE) as 'user' | 'admin' | 'owner' | null,
    setUser: () => {},
    setToken: () => {},
    setUserType: () => {},
});

// Props untuk ContextProvider
interface ContextProviderProps {
    children: ReactNode;
}

export const ContextProvider = ({ children }: ContextProviderProps) => {
    // Coba ambil data user dari localStorage saat inisialisasi
    const getUserFromStorage = (): User | null => {
        const userData = localStorage.getItem(USER_DATA);
        if (userData) {
            try {
                return JSON.parse(userData);
            } catch (e) {
                console.error("Error parsing user data from localStorage", e);
                return null;
            }
        }
        return null;
    };

    const [user, _setUser] = useState<User | null>(getUserFromStorage());
    const [userType, _setUserType] = useState<'user' | 'admin' | 'owner' | null>(
        localStorage.getItem(USER_TYPE) as 'user' | 'admin' | 'owner' | null
    );
    const [token, _setToken] = useState<string | null>(localStorage.getItem(ACCESS_TOKEN) || null);

    const setUser = (user: User | null) => {
        _setUser(user);
        if (user) {
            localStorage.setItem(USER_DATA, JSON.stringify(user));
        } else {
            localStorage.removeItem(USER_DATA);
        }
    };

    const setToken = (token: string | null) => {
        _setToken(token);
        if (token) {
            localStorage.setItem(ACCESS_TOKEN, token);
        } else {
            localStorage.removeItem(ACCESS_TOKEN);
            localStorage.removeItem(USER_TYPE);
            _setUserType(null);
        }
    };

    const setUserType = (userType: 'user' | 'admin' | 'owner' | null) => {
        _setUserType(userType);
        if (userType) {
            localStorage.setItem(USER_TYPE, userType);
        } else {
            localStorage.removeItem(USER_TYPE);
        }
    };

    // Efek untuk memastikan konsistensi state
    useEffect(() => {
        // Coba ambil data dari localStorage saat komponen mount
        const savedUser = getUserFromStorage();  
        const savedToken = localStorage.getItem(ACCESS_TOKEN);
        const savedUsertype = localStorage.getItem(USER_TYPE) as ("user" | "admin" | "owner" | null);

        // Jika ada data di localStorage, gunakan data tersebut
        if (savedUser && savedToken && savedUsertype) {
            _setUser(savedUser); // Gunakan _setUser untuk menghindari penulisan ulang ke localStorage
            _setToken(savedToken); // Gunakan _setToken untuk menghindari penulisan ulang ke localStorage
            _setUserType(savedUsertype); // Gunakan _setUserType untuk menghindari penulisan ulang ke localStorage
        } else if (!savedToken) {
            // Jika token tidak ada, hapus semua data user
            localStorage.removeItem(USER_DATA);
            localStorage.removeItem(USER_TYPE);
            _setUser(null);
            _setUserType(null);
        }
    }, []);

    return (
        <StateContext.Provider value={{
            user,
            setUser,
            token,
            setToken,
            userType,
            setUserType
        }}>
            {children}
        </StateContext.Provider>
    );
};

// Custom hook
export const useStateContext = () => useContext(StateContext);