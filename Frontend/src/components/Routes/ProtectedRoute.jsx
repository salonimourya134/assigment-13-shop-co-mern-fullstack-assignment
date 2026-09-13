import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/auth";

const ProtectedRoute = () => {
    const { auth, loading } = useAuth();
    if (loading) {
        return (
            <div className="route-loading-container">
                <p className="element-p">Loading...</p>
            </div>
        );
    }
    return auth?.token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
