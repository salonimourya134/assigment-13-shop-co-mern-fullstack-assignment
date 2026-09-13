import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import "./AdminCommon.scss";

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0,
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const baseURL = API.defaults.baseURL || "http://localhost:5000";

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);

            const [dashboardRes, ordersRes] = await Promise.all([
                API.get("/api/admin/dashboard"),
                API.get("/api/admin/orders"),
            ]);

            const dashboard = dashboardRes.data || {};
            const orders = ordersRes.data?.orders || [];

            setStats({
                totalRevenue: Number(dashboard.totalRevenue || 0),
                totalOrders: Number(dashboard.totalOrders || orders.length),
                totalProducts: Number(dashboard.totalProducts || 0),
                totalUsers: Number(dashboard.totalUsers || 0),
            });

            setRecentOrders(orders.slice(0, 5));
            setLowStockProducts(dashboard.lowStockProducts || []);
        } catch (err) {
            console.error("Error loading dashboard data:", err);
            setStats({
                totalRevenue: 0,
                totalOrders: 0,
                totalProducts: 0,
                totalUsers: 0,
            });
            setRecentOrders([]);
            setLowStockProducts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await API.put(`/api/admin/orders/${orderId}/status`, { status: newStatus });
            fetchDashboardData();
        } catch (err) {
            console.error("Failed to update status:", err);
        }
    };

    return (
        <div className="admin-page">

            <div className="admin-page__header">
                <div className="header-title">
                    <h1 className="element-h1">Dashboard Overview</h1>
                    <p className="element-p">Welcome back to SHOP.CO Management Portal</p>
                </div>
                <div className="header-actions">
                    <Link to="/admin/products" className="btn-admin-primary">
                        + Add Product
                    </Link>
                </div>
            </div>

            <div className="admin-page__stats-grid">
                <div className="admin-stat-card">
                    <div className="stat-icon revenue"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-dollar-sign"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
                    <div className="stat-info">
                        <span className="element-span">Total Revenue</span>
                        <strong className="element-strong">${stats.totalRevenue.toLocaleString()}</strong>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="stat-icon orders"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-cart"><path d="m2.05 2.05 1.099-.028a1 1 0 0 1 1.008.815l2.69 14.347A1 1 0 0 0 7.83 18H18"/><path d="M4.563 5h16.435a1 1 0 0 1 .981 1.204l-1.026 6.226A2 2 0 0 1 18.962 14H6.25"/><circle cx="18" cy="20" r="2"/><circle cx="8" cy="20" r="2"/></svg></div>
                    <div className="stat-info">
                        <span className="element-span">Total Orders</span>
                        <strong className="element-strong">{stats.totalOrders}</strong>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="stat-icon products"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-basket"><path d="m15 11-1 9"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4"/><path d="M4.5 15.5h15"/><path d="m5 11 4-7"/><path d="m9 11 1 9"/></svg></div>
                    <div className="stat-info">
                        <span className="element-span">Total Products</span>
                        <strong className="element-strong">{stats.totalProducts}</strong>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="stat-icon users"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/></svg></div>
                    <div className="stat-info">
                        <span className="element-span">Registered Users</span>
                        <strong className="element-strong">{stats.totalUsers}</strong>
                    </div>
                </div>
            </div>

            <div className="admin-card">
                <div className="admin-card__header">
                    <h3 className="element-h3">Recent Customer Orders</h3>
                    <Link to="/admin/orders" className="admin-link-bold">
                        View All Orders &rarr;
                    </Link>
                </div>

                {loading ? (
                    <p className="admin-state-loading">Loading orders...</p>
                ) : recentOrders.length === 0 ? (
                    <p className="admin-state-empty">No orders placed yet.</p>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr className="element-tr">
                                    <th className="element-th"># Order</th>
                                    <th className="element-th">Customer</th>
                                    <th className="element-th">Date</th>
                                    <th className="element-th">Items</th>
                                    <th className="element-th">Amount</th>
                                    <th className="element-th">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((ord, idx) => (
                                    <tr key={ord._id || idx}>
                                        <td className="element-td"><strong className="element-strong">#{ord._id?.substring(ord._id.length - 6).toUpperCase()}</strong></td>
                                        <td className="element-td">{ord.user?.name || "Guest Customer"}</td>
                                        <td className="element-td">{new Date(ord.createdAt).toLocaleDateString()}</td>
                                        <td className="element-td">{ord.items?.length || 0} item(s)</td>
                                        <td className="element-td"><strong className="element-strong">${ord.total || 0}</strong></td>
                                        <td className="element-td">
                                            <select
                                                value={ord.status}
                                                onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                                                className="admin-status-select"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="processing">Processing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {lowStockProducts.length > 0 && (
                <div className="admin-card">
                    <div className="admin-card__header">
                        <h3 className="admin-low-stock-title">⚠️ Low Stock Inventory Alerts</h3>
                        <Link to="/admin/products" className="admin-link-bold">
                            Manage Stock &rarr;
                        </Link>
                    </div>

                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr className="element-tr">
                                    <th className="element-th">Product</th>
                                    <th className="element-th">Category</th>
                                    <th className="element-th">Price</th>
                                    <th className="element-th">Available Stock</th>
                                    <th className="element-th">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lowStockProducts.map((p) => (
                                    <tr key={p._id}>
                                        <td className="product-cell">
                                            <img
                                                src={p.images?.[0] ? `${baseURL}${p.images[0]}` : ""}
                                                alt={p.name}
                                                onError={(e) => { e.currentTarget.classList.add("image-hidden"); }}
                                            />
                                            <span className="product-name">{p.name}</span>
                                        </td>
                                        <td className="element-td">{p.category?.name || "Apparel"}</td>
                                        <td className="element-td"><strong className="element-strong">${p.price}</strong></td>
                                        <td className="element-td"><strong className="element-strong">{p.quantity} units left</strong></td>
                                        <td className="element-td">
                                            <span className="badge badge--stock-low">Low Stock</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
