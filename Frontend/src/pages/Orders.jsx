import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API, { getImageUrl } from "../services/api";
import { useAuth } from "../context/auth";
import "./Orders.scss";

import fallbackImg from "../assets/images/products/image-1.png";

const Orders = () => {
    const { auth } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const fetchUserOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await API.get("/api/orders/myorders");
            const orderList = Array.isArray(res.data) ? res.data : (res.data?.orders || []);
            setOrders(orderList);
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError("Failed to load your orders. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!auth?.token) {
            navigate("/login?redirect=/orders");
            return;
        }
        fetchUserOrders();
    }, [auth?.token, navigate]);

    const getPaymentLabel = (method) => {
        if (method === "card") return "Card";
        if (method === "upi") return "UPI";
        return "Cash on Delivery";
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "delivered":
            case "Delivered":
                return "badge--delivered";
            case "shipped":
            case "Shipped":
                return "badge--shipped";
            case "processing":
            case "Processing":
                return "badge--processing";
            case "cancelled":
            case "Cancelled":
                return "badge--cancelled";
            default:
                return "badge--not-process";
        }
    };

    return (
        <div className="orders-page">

            <nav className="orders-page__breadcrumb">
                <Link to="/">Home</Link>
                <span className="element-span">&gt;</span>
                <span className="active">My Orders</span>
            </nav>

            <h1 className="orders-page__heading">MY ORDERS</h1>

            {loading ? (
                <div className="orders-page__loading">
                    <p className="element-p">Loading your orders...</p>
                </div>
            ) : error ? (
                <div className="orders-page__empty">
                    <h3 className="element-h3">{error}</h3>
                    <button type="button" className="btn-shop" onClick={fetchUserOrders}>
                        Retry
                    </button>
                </div>
            ) : orders.length === 0 ? (
                <div className="orders-page__empty">
                    <h2 className="element-h2">No orders yet</h2>
                    <p className="element-p">You haven't placed any orders with SHOP.CO yet.</p>
                    <Link to="/products" className="btn-shop">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="orders-page__list">
                    {orders.map((order) => (
                        <div key={order._id} className="order-card">

                            <div className="order-card__header">
                                <div className="order-info">
                                    <span className="order-id">
                                        Order #{order._id?.substring(order._id.length - 8).toUpperCase()}
                                    </span>
                                    <span className="order-date">
                                        Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </span>
                                </div>

                                <div className="order-meta">
                                    <span className={`order-status ${getStatusClass(order.status)}`}>
                                        {order.status || "Not Process"}
                                    </span>
                                    <span className="order-total">
                                        ${order.total || 0}
                                    </span>
                                </div>
                            </div>

                            <div className="order-card__items">
                                {order.items?.map((item, idx) => {
                                    const productObj = item.product || {};
                                    const photoUrl =
                                        getImageUrl(item.selectedImage || item.image) ||
                                        getImageUrl(productObj.images?.[0]) ||
                                        fallbackImg;

                                    return (
                                        <div key={idx} className="order-item">
                                            <div className="order-item__image">
                                                <img
                                                    src={photoUrl}
                                                    alt={productObj.name || "Product"}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = fallbackImg;
                                                    }}
                                                />
                                            </div>

                                            <div className="order-item__details">
                                                <h4 className="order-item__title">
                                                    {productObj.name || "Apparel Item"}
                                                </h4>
                                                <p className="order-item__qty">
                                                    Qty: <strong className="element-strong">{item.quantity || 1}</strong> &times; ${item.price || productObj.price || 0}
                                                </p>
                                            </div>

                                            <div className="order-item__subtotal">
                                                <span className="element-span">${(item.price || productObj.price || 0) * (item.quantity || 1)}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="order-card__footer">
                                <div className="shipping-info">
                                    <span className="element-span">
                                        📍 Shipping to: <strong className="element-strong">{order.shippingAddress?.address || auth?.user?.address || "Primary Address"}</strong>
                                    </span>
                                    <span className="element-span">
                                        💳 Payment: <strong className="element-strong">{getPaymentLabel(order.payment?.method)}</strong>
                                    </span>
                                    <span className="element-span">
                                        Delivery by: <strong className="element-strong">{order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-"}</strong>
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;
