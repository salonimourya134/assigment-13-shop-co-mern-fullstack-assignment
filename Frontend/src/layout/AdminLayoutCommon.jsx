import { useState } from "react";
import { NavLink, Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth";
import "./AdminLayout.scss";

const AdminLayoutCommon = () => {
    const { auth, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="admin-layout">
            <div className="admin-mobile-header">
                <button
                    className="mobile-toggle-btn"
                    onClick={() => setMobileNavOpen(!mobileNavOpen)}
                    aria-label="Toggle navigation"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu"><path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/></svg>
                </button>
                <Link to="/admin/dashboard" className="admin-brand-logo">
                    SHOP.CO <span className="admin-mobile__badge">ADMIN</span>
                </Link>
                <Link to="/" className="store-link-icon" title="View Store">

                </Link>
            </div>

            <aside className={`admin-sidebar ${mobileNavOpen ? "open" : ""} element-a`}>
                <div className="admin-sidebar__header">
                    <Link to="/" className="admin-sidebar__logo">
                        SHOP.CO
                        <span className="admin-badge">ADMIN</span>
                    </Link>
                    <button
                        className="close-sidebar-btn"
                        onClick={() => setMobileNavOpen(false)}
                        aria-label="Close navigation"
                    >
                        &times;
                    </button>
                </div>

                <div className="admin-sidebar__user">
                    <div className="avatar">{auth?.user?.name ? auth.user.name.charAt(0).toUpperCase() : "A"}</div>
                    <div className="user-info">
                        <strong className="admin-mobile__badge element-strong">{auth?.user?.name || "Administrator"}</strong>
                        <span className="admin-sidebar__user-email">{auth?.user?.email || "admin@shop.co"}</span>
                    </div>
                </div>

                <nav className="admin-sidebar__nav">
                    <NavLink
                        to="/admin/dashboard"
                        className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                        onClick={() => setMobileNavOpen(false)}
                    >

                        <span lassName="admin-sidebar__user-email">Dashboard</span>
                    </NavLink>

                    <NavLink
                        to="/admin/products"
                        className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                        onClick={() => setMobileNavOpen(false)}
                    >

                        <span lassName="admin-sidebar__user-email">Products</span>
                    </NavLink>

                    <NavLink
                        to="/admin/categories"
                        className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                        onClick={() => setMobileNavOpen(false)}
                    >
                        <span lassName="admin-sidebar__user-email">Categories</span>
                    </NavLink>

                    <NavLink
                        to="/admin/orders"
                        className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                        onClick={() => setMobileNavOpen(false)}
                    >

                        <span lassName="admin-sidebar__user-email">Orders</span>
                    </NavLink>

                    <NavLink
                        to="/admin/users"
                        className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                        onClick={() => setMobileNavOpen(false)}
                    >
                        <span lassName="admin-sidebar__user-email">Users</span>
                    </NavLink>

                    <hr className="nav-divider element-hr" />

                    <Link to="/" className="nav-link store-link" onClick={() => setMobileNavOpen(false)}>

                        <span lassName="admin-sidebar__user-email">View Store</span>
                    </Link>
                </nav>

                <div className="admin-sidebar__footer">
                    <button className="logout-btn" onClick={handleLogout}>

                        <span lassName="admin-sidebar__user-email">Logout</span>
                    </button>
                </div>
            </aside>

            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayoutCommon;
