import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
    id: number;
    name?: string;        // untuk admin
    username?: string;    // untuk owner
    email: string;
    nama_laundry?: string; // untuk owner
    id_owner?: number;    // untuk admin
}

interface StateContextType {
    user: User | null;
    token: string | null;
    userType: 'user' | 'admin' | 'owner' | null;
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    setUserType: (userType: 'user' | 'admin' | 'owner' | null) => void;
}

const StateContext = createContext<StateContextType>({
    user: null,
    token: null,
    userType: null,
    setUser: () => {},
    setToken: () => {},
    setUserType: () => {},
});

interface ContextProviderProps {
    children: ReactNode;
}

export const ContextProvider = ({ children }: ContextProviderProps) => {
    // Fungsi untuk membersihkan semua data
    const clearAllData = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("userType");
        localStorage.removeItem("CACHED_ADMINS");
        localStorage.removeItem("USER_DATA");
        localStorage.removeItem("ACCESS_TOKEN");
        localStorage.removeItem("USER_TYPE");
    };

    // Fungsi untuk mengambil data user dari localStorage
    const getUserFromStorage = (): User | null => {
        try {
            const userData = localStorage.getItem("user");
            if (userData) {
                const parsedUser = JSON.parse(userData);
                // Validasi data user
                if (parsedUser && parsedUser.id && parsedUser.email) {
                    return parsedUser;
                }
            }
            return null;
        } catch (e) {
            console.error("Error parsing user data:", e);
            clearAllData(); // Bersihkan data jika ada error
            return null;
        }
    };

    const [user, _setUser] = useState<User | null>(getUserFromStorage());
    const [token, _setToken] = useState<string | null>(localStorage.getItem("token"));
    const [userType, _setUserType] = useState<'user' | 'admin' | 'owner' | null>(
        localStorage.getItem("userType") as 'user' | 'admin' | 'owner' | null
    );

    const setUser = (newUser: User | null) => {
        _setUser(newUser);
        if (newUser) {
            localStorage.setItem("user", JSON.stringify(newUser));
        } else {
            clearAllData();
        }
    };

    const setToken = (newToken: string | null) => {
        _setToken(newToken);
        if (newToken) {
            localStorage.setItem("token", newToken);
        } else {
            clearAllData();
        }
    };

    const setUserType = (newUserType: 'user' | 'admin' | 'owner' | null) => {
        _setUserType(newUserType);
        if (newUserType) {
            localStorage.setItem("userType", newUserType);
        } else {
            clearAllData();
        }
    };

    // Effect untuk validasi data saat komponen mount
    useEffect(() => {
        const validateAndSetData = () => {
            const savedUser = getUserFromStorage();
            const savedToken = localStorage.getItem("token");
            const savedUserType = localStorage.getItem("userType") as ('user' | 'admin' | 'owner' | null);

            // Validasi data
            if (savedUser && savedToken && savedUserType) {
                // Pastikan data konsisten
                if ((savedUserType === 'admin' && savedUser.id_owner) || 
                    (savedUserType === 'owner' && savedUser.nama_laundry)) {
                    _setUser(savedUser);
                    _setToken(savedToken);
                    _setUserType(savedUserType);
                } else {
                    console.error("Inconsistent user data found");
                    clearAllData();
                    _setUser(null);
                    _setToken(null);
                    _setUserType(null);
                }
            } else {
                // Jika ada data yang hilang, bersihkan semua
                clearAllData();
                _setUser(null);
                _setToken(null);
                _setUserType(null);
            }
        };

        validateAndSetData();
    }, []);

    return (
        <StateContext.Provider value={{
            user,
            token,
            userType,
            setUser,
            setToken,
            setUserType
        }}>
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);