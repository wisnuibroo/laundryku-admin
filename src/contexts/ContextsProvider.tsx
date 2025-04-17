import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from "react";

// Tipe data untuk konteks
interface StateContextType {
    user: { name: string } | null;
    token: string | null;
    setUser: Dispatch<SetStateAction<{ name: string } | null>>;
    setToken: (token: string | null) => void;
}

// Nilai default untuk context
const StateContext = createContext<StateContextType>({
    user: null,
    token: null,
    setUser: () => {},
    setToken: () => {},
});

// Props untuk ContextProvider
interface ContextProviderProps {
    children: ReactNode;
}

export const ContextProvider = ({ children }: ContextProviderProps) => {
    const [user, setUser] = useState<{ name: string } | null>({ name: 'KENNN ' });
    const [token, _setToken] = useState<string | null > ('123');

    const setToken = (token: string | null) => {
        _setToken(token);
        if (token) {
            localStorage.setItem('ACCESS_TOKEN', token);
        } else {
            localStorage.removeItem('ACCESS_TOKEN');
        }
    };

    return (
        <StateContext.Provider value={{
            user,
            setUser,
            token,
            setToken
        }}>
            {children}
        </StateContext.Provider>
    );
};

// Custom hook
export const useStateContext = () => useContext(StateContext);
