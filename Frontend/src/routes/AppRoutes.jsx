import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import MainLayoutCommon from "../layout/MainLayoutCommon";
import AdminLayoutCommon from "../layout/AdminLayoutCommon";
import ProtectedRoute from "../components/Routes/ProtectedRoute";
import AdminRoute from "../components/Routes/AdminRoute";

const Home = lazy(() => import("../pages/Home"));
const Products = lazy(() => import("../pages/Products"));
const ProductDetails = lazy(() => import("../pages/ProductDetails"));
const Category = lazy(() => import("../pages/Category"));
const Cart = lazy(() => import("../pages/Cart"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const Profile = lazy(() => import("../pages/Profile"));
const Orders = lazy(() => import("../pages/Orders"));

const Dashboard = lazy(() => import("../pages/admin/Dashboard"));
const AdminProducts = lazy(() => import("../pages/admin/Products"));
const AdminCategories = lazy(() => import("../pages/admin/Categories"));
const AdminOrders = lazy(() => import("../pages/admin/Orders"));
const AdminUsers = lazy(() => import("../pages/admin/Users"));

export const AppRoutes = () => {
    return (
        <Suspense fallback={<div className="route-loading-container">Loading page...</div>}>
            <Routes>

            <Route element={<MainLayoutCommon />}>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/category" element={<Category />} />
                <Route path="/category/:slug" element={<Category />} />
                <Route path="/cart" element={<Cart />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/orders" element={<Orders />} />
                </Route>
            </Route>

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/admin" element={<AdminRoute />}>
                <Route element={<AdminLayoutCommon />}>
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="users" element={<AdminUsers />} />
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    );
};
