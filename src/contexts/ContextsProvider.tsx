import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from "react";

// Tipe data untuk user/admin
interface User {
    id?: number;
    name: string;
    email?: string;
    phone?: string;
    id_laundry?: number;
    laundry?: {
        id: number;
        name: string;
    };
}

// Tipe data untuk konteks
interface StateContextType {
    user: User | null;
    token: string | null;
    userType: 'user' | 'admin' | 'owner' | null;
    setUser: Dispatch<SetStateAction<User | null>>;
    setToken: (token: string | null) => void;
    setUserType: Dispatch<SetStateAction<'user' | 'admin' | 'owner' | null>>;
}

// Nilai default untuk context
const StateContext = createContext<StateContextType>({
    user: null,
    token: null,
    userType: null,
    setUser: () => {},
    setToken: () => {},
    setUserType: () => {},
});

// Props untuk ContextProvider
interface ContextProviderProps {
    children: ReactNode;
}

export const ContextProvider = ({ children }: ContextProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [userType, setUserType] = useState<'user' | 'admin' | 'owner' | null>(
        localStorage.getItem('USER_TYPE') as 'user' | 'admin' | 'owner' | null
    );
    const [token, _setToken] = useState<string | null>(localStorage.getItem('ACCESS_TOKEN') || null);

    const setToken = (token: string | null) => {
        _setToken(token);
        if (token) {
            localStorage.setItem('ACCESS_TOKEN', token);
        } else {
            localStorage.removeItem('ACCESS_TOKEN');
            localStorage.removeItem('USER_TYPE');
            setUserType(null);
        }
    };

    // Buat custom setUserType yang juga update localStorage
    const customSetUserType: Dispatch<SetStateAction<'user' | 'admin' | 'owner' | null>> = (value) => {
        setUserType(value);
        const newValue = typeof value === 'function' ? value(userType) : value;
        if (newValue) {
            localStorage.setItem('USER_TYPE', newValue);
        } else {
            localStorage.removeItem('USER_TYPE');
        }
    };

    return (
        <StateContext.Provider value={{
            user,
            setUser,
            token,
            setToken,
            userType,
            setUserType: customSetUserType
        }}>
            {children}
        </StateContext.Provider>
    );
};

// Custom hook
export const useStateContext = () => useContext(StateContext);