import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/auth";
import API from "../../services/api";

const AdminRoute = () => {
    const { auth, loading: authLoading } = useAuth();
    const [isAdminValid, setIsAdminValid] = useState(false);
    const [verifying, setVerifying] = useState(true);

    useEffect(() => {
        const checkAdmin = async () => {
            if (!auth?.token || auth?.user?.role !== "admin") {
                setIsAdminValid(false);
                setVerifying(false);
                return;
            }
            try {
                const { data } = await API.get("/api/admin/dashboard");
                if (data?.success) {
                    setIsAdminValid(true);
                } else {
                    setIsAdminValid(false);
                }
            } catch (err) {
                console.error("Admin verification failed", err);
                setIsAdminValid(false);
            } finally {
                setVerifying(false);
            }
        };

        if (!authLoading) {
            checkAdmin();
        }
    }, [auth?.token, auth?.user?.role, authLoading]);
    if (authLoading || verifying) {
        return (
            <div className="route-loading-container">
                <p className="element-p">Verifying Admin Access...</p>
            </div>
        );
    }

    return isAdminValid ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AdminRoute;
