import { createContext, useContext, useEffect, useState } from "react";
import API from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [auth, setAuth] = useState(() => {
        try {
            const stored = localStorage.getItem("auth");
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed?.token && parsed?.user) {
                    return parsed;
                }
            }
        } catch {
            localStorage.removeItem("auth");
        }
        return { user: null, token: "" };
    });

    const token = auth?.token;
    useEffect(() => {
        if (auth?.token) {
            localStorage.setItem("auth", JSON.stringify(auth));
        }
    }, [auth]);

    useEffect(() => {
        const verifyAuth = async () => {
            if (!token) {
                delete API.defaults.headers.common.Authorization;
                localStorage.removeItem("auth");
                setLoading(false);
                return;
            }

            API.defaults.headers.common.Authorization = `Bearer ${token}`;
            try {
                const { data } = await API.get("/api/users/me");

                if (data?.success && data.user) {
                    setAuth((prev) => ({
                        ...prev,
                        user: data.user,
                    }));
                }
            } catch {
                setAuth({ user: null, token: "" });
                delete API.defaults.headers.common.Authorization;
                localStorage.removeItem("auth");
            } finally {
                setLoading(false);
            }
        };

        verifyAuth();
    }, [token]);

    useEffect(() => {
        const handleAuthExpired = () => {
            setAuth({ user: null, token: "" });
            delete API.defaults.headers.common.Authorization;
            localStorage.removeItem("auth");
        };

        window.addEventListener("authExpired", handleAuthExpired);

        return () => {
            window.removeEventListener("authExpired", handleAuthExpired);
        };
    }, []);

    const login = (userData, token) => {
        setAuth({
            user: userData,
            token,
        });
    };
    const logout = async () => {
        try {
            await API.post("/api/auth/logout");
        } catch {
            void 0;
        } finally {
            setAuth({
                user: null,
                token: "",
            });
            delete API.defaults.headers.common.Authorization;
            localStorage.removeItem("auth");
        }
    };
    const updateUser = (updatedUserData) => {
        setAuth((prev) => ({
            ...prev,
            user: updatedUserData,
        }));
    };

    return (
        <AuthContext.Provider
            value={{
                auth,
                setAuth,
                login,
                logout,
                updateUser,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);