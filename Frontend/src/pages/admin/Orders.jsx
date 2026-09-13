import { useCallback, useEffect, useState } from "react";
import API from "../../services/api";
import "./AdminCommon.scss";

const STATUS_OPTIONS = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);

      const res = await API.get("/api/admin/orders");

      const orderList = Array.isArray(res.data)
        ? res.data
        : res.data?.orders || [];

      setOrders(orderList);
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await API.put(`/api/admin/orders/${orderId}/status`, {
        status: newStatus,
      });
      setOrders((prev) =>
        prev.map((ord) =>
          ord._id === orderId ? { ...ord, status: newStatus } : ord,
        ),
      );
    } catch (err) {
      alert(
        "Failed to update order status: " +
          (err.response?.data?.message || err.message),
      );
    }
  };

  const filteredOrders = orders.filter((o) =>
    statusFilter === "All" ? true : o.status === statusFilter,
  );

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div className="header-title">
          <h1 className="element-h1">Customer Orders</h1>
          <p className="element-p">
            Total {orders.length} order(s) placed across all customer accounts
          </p>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-filter-bar">
          <button
            type="button"
            onClick={() => setStatusFilter("All")}
            className={`admin-filter-pill ${statusFilter === "All" ? "active" : ""}`}
          >
            All ({orders.length})
          </button>
          {STATUS_OPTIONS.map((st) => {
            const count = orders.filter((o) => o.status === st).length;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`admin-filter-pill ${statusFilter === st ? "active" : ""}`}
              >
                {st.charAt(0).toUpperCase() + st.slice(1)} ({count})
              </button>
            );
          })}
        </div>

        {loading ? (
          <p className="admin-state-loading">Loading orders...</p>
        ) : filteredOrders.length === 0 ? (
          <p className="admin-state-empty">No orders match "{statusFilter}".</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr className="element-tr">
                  <th className="element-th">Order ID</th>
                  <th className="element-th">Customer</th>
                  <th className="element-th">Date</th>
                  <th className="element-th">Products Ordered</th>
                  <th className="element-th">Payment</th>
                  <th className="element-th">Total Amount</th>
                  <th className="element-th">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((ord) => (
                  <tr key={ord._id}>
                    <td className="element-td">
                      <strong className="element-strong">
                        #{ord._id?.substring(ord._id.length - 8).toUpperCase()}
                      </strong>
                    </td>
                    <td className="element-td">
                      <div>
                        <strong className="element-strong">{ord.user?.name || "Customer"}</strong>
                        <div className="admin-small-id">{ord.user?.email}</div>
                      </div>
                    </td>
                    <td className="element-td">{new Date(ord.createdAt).toLocaleDateString()}</td>
                    <td className="element-td">
                      <div className="admin-order-items">
                        {ord.items?.map((item, i) => (
                          <span key={i}>
                            • {item.product?.name || item.name || "Product"}{" "}
                            &times; {item.quantity || 1}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="element-td">
                      <span className="admin-payment-method">
                        {ord.payment?.method === "card"
                          ? "Card"
                          : ord.payment?.method === "upi"
                            ? "UPI"
                            : "Cash on Delivery"}
                      </span>
                    </td>
                    <td className="element-td">
                      <strong className="admin-total-amount element-strong">
                        ${ord.total || 0}
                      </strong>
                    </td>
                    <td className="element-td">
                      <select
                        value={ord.status}
                        onChange={(e) =>
                          handleStatusChange(ord._id, e.target.value)
                        }
                        className="admin-status-select"
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
