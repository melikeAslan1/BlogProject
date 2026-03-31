import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";

type User = {
    id?: string;
    email: string;
    fullName?: string | null;
}

type AuthContextType = {
    user: User | null;
    login: (user: Omit<User, "id">) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({children}) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        api
            .get<Omit<User, "id">>("/api/auth/me", {
                // Login olmayan kullanıcı için 401 beklenen durum; global interceptor redirect etmesin.
                validateStatus: (status) => status === 200 || status === 401
            })
            .then((res) => setUser(res.status === 200 ? (res.data ?? null) : null))
            .catch(() => setUser(null));
    }, []);

    const login = (u: Omit<User, "id">) => {
        setUser(u);
    };
    const logout = ()=>{
        api.post("/api/auth/logout").catch(() => undefined);
        setUser(null);
    };
    return(
        <AuthContext.Provider value={{user,login,logout,isAuthenticated: !!user}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if(!ctx)throw new Error("useAuth must be used within AuthPrvider");
    return ctx;
}