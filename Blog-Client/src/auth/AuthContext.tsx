import React, { createContext, useContext, useEffect, useState } from "react";
import { decodeJwt } from "../lib/jwt";

type User = {
    id?: string;
    email: string;
    fullName?: string | null;
}

type AuthContextType = {
    user: User | null;
    token: string | null;
    login: (token: string, user: Omit<User, "id">) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({children}) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const t = localStorage.getItem("token");
        const u = localStorage.getItem("user");
        if (t) setToken(t);

        if (u) {
            const parsed: User = JSON.parse(u);
            if (!parsed.id && t) {
                const payload = decodeJwt<{ sub?: string; nameid?: string }>(t);
                const id = payload?.sub ?? payload?.nameid;
                setUser({ ...parsed, id });
                return;
            }
            setUser(parsed);
        }
    }, []);

    const login = (t: string, u: Omit<User, "id">) => {
        const payload = decodeJwt<{ sub?: string; nameid?: string }>(t);
        const id = payload?.sub ?? payload?.nameid;
        const userWithId: User = { ...u, id };

        setToken(t);
        setUser(userWithId);
        localStorage.setItem("token", t);
        localStorage.setItem("user", JSON.stringify(userWithId));
    };
    const logout = ()=>{
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };
    return(
        <AuthContext.Provider value={{user,token,login,logout,isAuthenticated: !!token}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if(!ctx)throw new Error("useAuth must be used within AuthPrvider");
    return ctx;
}