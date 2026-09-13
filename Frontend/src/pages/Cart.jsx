import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/auth";
import { useToast } from "../context/toast";
import LocationModal from "../components/LocationModal";
import "./Cart.scss";

import trashIcon from "../assets/icons/cart-page-icons/Vector (4).svg";
import fallbackImg from "../assets/images/products/image-1.png";
import { formatDeliveryDate } from "../utils/delivery";

const Cart = () => {
    const { auth } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [summary, setSummary] = useState({
        subtotal: 0,
        discount: 0,
        discountPercent: 0,
        coupon: "",
        deliveryFee: 15,
        total: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [promoInput, setPromoInput] = useState("");
    const [promoLoading, setPromoLoading] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [couponError, setCouponError] = useState("");
    const [couponSuccess, setCouponSuccess] = useState("");
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [checkoutMode, setCheckoutMode] = useState("manual");
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [shippingAddress, setShippingAddress] = useState({
        name: "",
        phone: "",
        address: "",
        city: "",
        pincode: "",
        country: "India",
        locality: "",
        state: "",
        landmark: "",
        alternatePhone: "",
        type: "Home",
    });

    const [locationMessage, setLocationMessage] = useState("");
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [locationOpen, setLocationOpen] = useState(false);

    const deliveryText = shippingAddress.pincode
        ? formatDeliveryDate(shippingAddress.pincode)
        : "Add address";

    const applyCartData = (cartData) => {
        const items = cartData?.items || [];
        const subtotal = items.reduce(
            (sum, item) =>
                sum +
                Number(item.price || item.product?.price || 0) *
                Number(item.quantity || 0),
            0
        );
        const discountPercent = Number(cartData?.discountPercent || 0);
        const discount = subtotal * (discountPercent / 100);
        const deliveryFee = subtotal > 0 ? 15 : 0;
        const total = Math.max(0, subtotal - discount + deliveryFee);

        setCart(items);
        setSummary({
            subtotal,
            discount,
            discountPercent,
            coupon: cartData?.coupon || "",
            deliveryFee,
            total,
        });
    };

    const fetchCart = useCallback(async () => {
        if (!auth?.token) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const res = await API.get("/api/cart");

            if (res.data?.success && res.data.cart) {
                applyCartData(res.data.cart);
            }
        } catch (err) {
            console.error("Error fetching cart:", err);
            setError("Failed to load cart.");
        } finally {
            setLoading(false);
        }
    }, [auth?.token]);

    useEffect(() => {
        if (!auth?.token) {
            navigate("/login?redirect=/cart");
            return;
        }

        fetchCart();
    }, [auth?.token, fetchCart, navigate]);

    useEffect(() => {
        setShippingAddress((prev) => ({
            ...prev,
            name: auth?.user?.name || prev.name,
            phone: auth?.user?.phone || prev.phone,
            address: auth?.user?.address || prev.address,
        }));
    }, [auth?.user]);

    const handleUpdateQuantity = async (itemId, newQty) => {
        try {
            if (newQty < 1) {
                await API.delete(`/api/cart/${itemId}`);
                await fetchCart();
                window.dispatchEvent(new Event("cartUpdated"));
                return;
            }

            const res = await API.put(`/api/cart/${itemId}`, {
                quantity: newQty,
            });

            if (res.data?.success && res.data.cart) {
                applyCartData(res.data.cart);
                window.dispatchEvent(new Event("cartUpdated"));
            }
        } catch (err) {
            const message = err.response?.data?.message || "Unable to update cart";
            showToast(message, "error");
            await fetchCart();
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            const res = await API.delete(`/api/cart/${itemId}`);

            if (res.data?.success && res.data.cart) {
                applyCartData(res.data.cart);
                window.dispatchEvent(new Event("cartUpdated"));
            }
        } catch (err) {
            showToast(err.response?.data?.message || "Unable to remove item", "error");
        }
    };

    const handleApplyPromo = async (e) => {
        e.preventDefault();
        setCouponError("");
        setCouponSuccess("");

        const code = promoInput.trim().toUpperCase();

        if (!code) return;

        try {
            setPromoLoading(true);

            const res = await API.post("/api/cart/coupon", {
                coupon: code,
            });

            if (res.data?.success && res.data.cart) {
                applyCartData(res.data.cart);
                setCouponSuccess(
                    res.data.message ||
                    `Coupon ${res.data.cart.coupon} applied!`
                );
                setPromoInput("");
            }
        } catch (err) {
            setCouponError(
                err.response?.data?.message ||
                "Invalid coupon. Use SAVE10 or SAVE20."
            );
        } finally {
            setPromoLoading(false);
        }
    };

    const handleRemovePromo = async () => {
        setCouponError("");
        setCouponSuccess("");

        try {
            const res = await API.delete("/api/cart/coupon");

            if (res.data?.success && res.data.cart) {
                applyCartData(res.data.cart);
                setCouponSuccess("Coupon removed");
            }
        } catch (err) {
            console.error("Error removing coupon:", err);
        }
    };

    const openCheckout = () => {
        if (!auth?.token) {
            navigate("/login?redirect=/cart");
            return;
        }

        if (cart.length === 0) return;

        setLocationMessage("");
        setCheckoutOpen(true);

        API.get("/api/users/addresses")
            .then(({ data }) => {
                setSavedAddresses(data.addresses || []);

                const selected =
                    (data.addresses || []).find((item) => item.isDefault) ||
                    data.addresses?.[0];

                if (selected) {
                    setShippingAddress((prev) => ({
                        ...prev,
                        ...selected,
                    }));
                }
            })
            .catch(() => setSavedAddresses([]));
    };

    const handleCheckout = async () => {
        if (!auth?.token || cart.length === 0) return;

        try {
            setLocationMessage("");
            setCheckoutLoading(true);

            const { data } = await API.post("/api/orders", {
                coupon: summary.coupon || undefined,
                payment: {
                    method: paymentMethod,
                },
                shippingAddress,
            });

            if (data?.success) {
                setCheckoutOpen(false);
                setCart([]);

                setSummary({
                    subtotal: 0,
                    discount: 0,
                    discountPercent: 0,
                    coupon: "",
                    deliveryFee: 0,
                    total: 0,
                });

                window.dispatchEvent(new Event("cartUpdated"));
                showToast("Checkout successful");
                navigate("/orders");
            }
        } catch (err) {
            setLocationMessage(
                err.response?.data?.message ||
                "Failed to place order. Please check your address and try again."
            );
        } finally {
            setCheckoutLoading(false);
        }
    };

    const handleCurrentLocation = () => {
        setCheckoutMode("current");
        setLocationMessage("");
        setLocationOpen(true);
    };

    const applyLocation = (location) => {
        setShippingAddress((prev) => ({
            ...prev,
            address: location.address || prev.address,
            locality: location.locality || prev.locality,
            city: location.city || prev.city,
            state: location.state || prev.state,
            pincode: location.pincode || prev.pincode,
            country: location.country || "India",
        }));

        setLocationOpen(false);
        showToast("Current location added");
    };

    const saveCheckoutAddress = async () => {
        try {
            setLocationMessage("");

            if (shippingAddress._id) {
                const { data } = await API.put(
                    `/api/users/addresses/${shippingAddress._id}`,
                    shippingAddress
                );

                setSavedAddresses((prev) =>
                    prev.map((item) =>
                        item._id === shippingAddress._id
                            ? data.address
                            : item
                    )
                );

                setShippingAddress((prev) => ({
                    ...prev,
                    ...data.address,
                }));

                showToast("Address updated successfully");
                return;
            }

            const { data } = await API.post(
                "/api/users/addresses",
                shippingAddress
            );

            setSavedAddresses((prev) => [...prev, data.address]);

            setShippingAddress((prev) => ({
                ...prev,
                ...data.address,
            }));

            showToast("Address saved successfully");
        } catch (err) {
            const message =
                err.response?.data?.message ||
                "Failed to save address";

            setLocationMessage(message);
            showToast(message, "error");
        }
    };

    const selectAddress = (item) => {
        setCheckoutMode("manual");
        setShippingAddress((prev) => ({
            ...prev,
            ...item,
        }));
        showToast("Address selected");
    };

    if (loading && cart.length === 0) {
        return (
            <div className="cart-page">
                <nav className="cart-page__breadcrumb">
                    <Link className="cart-page__breadcrumb-link" to="/">
                        Home
                    </Link>
                    <span className="cart-page__breadcrumb-separator">
                        &gt;
                    </span>
                    <span className="cart-page__breadcrumb-active">
                        Cart
                    </span>
                </nav>

                <h1 className="cart-page__heading">
                    YOUR CART
                </h1>

                <div className="cart-page__empty">
                    <p className="cart-page__loading-text">
                        Loading your cart...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <nav className="cart-page__breadcrumb">
                <Link className="cart-page__breadcrumb-link" to="/">
                    Home
                </Link>

                <span className="cart-page__breadcrumb-separator">
                    &gt;
                </span>

                <span className="cart-page__breadcrumb-active">
                    Cart
                </span>
            </nav>

            <h1 className="cart-page__heading">
                YOUR CART
            </h1>

            {cart.length === 0 ? (
                <div className="cart-page__empty">
                    <h2 className="cart-page__empty-title">
                        Your cart is empty
                    </h2>

                    <p className="cart-page__empty-text">
                        Looks like you haven't added anything to your cart yet.
                    </p>

                    <Link to="/products" className="btn-explore">
                        Explore Products
                    </Link>
                </div>
            ) : (
                <div className="cart-page__layout">
                    <div className="cart-page__items-container">
                        {cart.map((item, index) => {
                            const productObj = item.product || {};
                            const productId =
                                productObj._id || item.product;

                            const photoUrl =
                                item.selectedImage
                                    ? `${API.defaults.baseURL}${item.selectedImage}`
                                    : item.product?.images?.[0]
                                        ? `${API.defaults.baseURL}${item.product.images[0]}`
                                        : fallbackImg;

                            return (
                                <React.Fragment key={item._id || index}>
                                    <div className="cart-item">
                                        <div className="cart-item__image">
                                            <img
                                                className="cart-item__image-img"
                                                src={photoUrl}
                                                alt={productObj.name || "Product"}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = fallbackImg;
                                                }}
                                            />
                                        </div>

                                        <div className="cart-item__details">
                                            <div className="cart-item__info">
                                                <h3 className="cart-item__title">
                                                    <Link
                                                        className="cart-item__product-link"
                                                        to={`/products/${productId}`}
                                                    >
                                                        {productObj.name || "Product"}
                                                    </Link>
                                                </h3>

                                                <p className="cart-item__meta">
                                                    Size:{" "}
                                                    <span className="cart-item__meta-value">
                                                        {item.size || "Large"}
                                                    </span>
                                                </p>

                                                <p className="cart-item__meta">
                                                    Color:{" "}
                                                    <span className="cart-item__meta-value">
                                                        {item.color || "White"}
                                                    </span>
                                                </p>
                                            </div>

                                            <div className="cart-item__price-wrapper">
                                                <span className="cart-item__price">
                                                    ${item.price}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="cart-item__actions">
                                            <button
                                                type="button"
                                                className="cart-item__delete-btn"
                                                onClick={() =>
                                                    handleRemoveItem(
                                                        item._id || productId
                                                    )
                                                }
                                                aria-label="Delete item"
                                            >
                                                <img
                                                    className="cart-item__delete-icon"
                                                    src={trashIcon}
                                                    alt="Delete"
                                                />
                                            </button>

                                            <div className="cart-item__stepper">
                                                <button
                                                    className="cart-item__quantity-btn"
                                                    type="button"
                                                    onClick={() =>
                                                        handleUpdateQuantity(
                                                            item._id || productId,
                                                            item.quantity - 1
                                                        )
                                                    }
                                                    aria-label="Decrease quantity"
                                                >
                                                    -
                                                </button>

                                                <span className="qty-val">
                                                    {item.quantity}
                                                </span>

                                                <button
                                                    className="cart-item__quantity-btn"
                                                    type="button"
                                                    onClick={() =>
                                                        handleUpdateQuantity(
                                                            item._id || productId,
                                                            item.quantity + 1
                                                        )
                                                    }
                                                    aria-label="Increase quantity"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {index < cart.length - 1 && (
                                        <hr className="cart-item__divider element-hr" />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>

                    <aside className="cart-page__summary-card element-a">
                        <h2 className="summary-title">
                            Order Summary
                        </h2>

                        <div className="summary-rows">
                            <div className="summary-row">
                                <span className="label">Subtotal</span>
                                <span className="value">
                                    ${summary.subtotal}
                                </span>
                            </div>

                            <div className="summary-row">
                                <span className="label">
                                    Discount{" "}
                                    {summary.discountPercent > 0
                                        ? `(-${summary.discountPercent}%)`
                                        : "(-0%)"}
                                </span>

                                <span className="value discount">
                                    -${summary.discount}
                                </span>
                            </div>

                            <div className="summary-row">
                                <span className="label">
                                    Delivery Fee
                                </span>

                                <span className="value">
                                    ${summary.deliveryFee}
                                </span>
                            </div>

                            <hr className="summary-divider element-hr" />

                            <div className="summary-row total-row">
                                <span className="label">Total</span>

                                <span className="value total-price">
                                    ${summary.total}
                                </span>
                            </div>
                        </div>

                        <div className="summary-promo-section">
                            <form
                                noValidate
                                onSubmit={handleApplyPromo}
                                className="promo-form"
                            >
                                <div className="promo-input-wrapper">
                                    <svg
                                        className="promo-icon"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                                        <line
                                            x1="7"
                                            y1="7"
                                            x2="7.01"
                                            y2="7"
                                        ></line>
                                    </svg>

                                    <input
                                        type="text"
                                        placeholder="Add promo code"
                                        value={promoInput}
                                        onChange={(e) =>
                                            setPromoInput(e.target.value)
                                        }
                                        className="promo-input"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="promo-apply-btn"
                                    disabled={
                                        promoLoading ||
                                        !promoInput.trim()
                                    }
                                >
                                    {promoLoading ? "..." : "Apply"}
                                </button>
                            </form>

                            {couponError && (
                                <p className="coupon-msg error">
                                    {couponError}
                                </p>
                            )}

                            {couponSuccess && (
                                <p className="coupon-msg success">
                                    {couponSuccess}
                                </p>
                            )}

                            {summary.coupon && (
                                <div className="applied-coupon-badge">
                                    <span className="applied-coupon-text">
                                        Applied:{" "}
                                        <strong className="applied-coupon-code element-strong">
                                            {summary.coupon}
                                        </strong>{" "}
                                        (-{summary.discountPercent}%)
                                    </span>

                                    <button
                                        type="button"
                                        onClick={handleRemovePromo}
                                        className="remove-coupon-btn"
                                        title="Remove coupon"
                                    >
                                        &times;
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            className="checkout-btn"
                            disabled={checkoutLoading}
                            onClick={openCheckout}
                        >
                            <span className="checkout-btn__text">
                                {checkoutLoading
                                    ? "Processing Order..."
                                    : "Go to Checkout"}
                            </span>

                            <span className="arrow-icon">
                                →
                            </span>
                        </button>
                    </aside>
                </div>
            )}

            {checkoutOpen && (
                <div
                    className="checkout-modal"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="checkout-modal__card">
                        <div className="checkout-modal__header">
                            <div className="checkout-modal__heading-content">
                                <h2 className="checkout-modal__title">
                                    Checkout
                                </h2>

                                <p className="checkout-modal__subtitle">
                                    Confirm delivery address and payment method.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="checkout-modal__close"
                                onClick={() =>
                                    setCheckoutOpen(false)
                                }
                                aria-label="Close checkout"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="checkout-modal__section">
                            <div className="checkout-modal__section-header">
                                <h3 className="checkout-modal__section-title">
                                    Delivery Address
                                </h3>

                                <div className="checkout-modal__location-actions">
                                    <button
                                        type="button"
                                        className={`checkout-location-btn ${checkoutMode === "manual"
                                            ? "active"
                                            : ""
                                            }`}
                                        onClick={() => {
                                            setCheckoutMode("manual");
                                            setLocationMessage("");
                                        }}
                                    >
                                        Manual Address
                                    </button>

                                    <button
                                        type="button"
                                        className={`checkout-location-btn ${checkoutMode === "current"
                                            ? "active"
                                            : ""
                                            }`}
                                        onClick={handleCurrentLocation}
                                    >
                                        Current Location
                                    </button>
                                </div>
                            </div>

                            {savedAddresses.length > 0 && (
                                <div className="checkout-saved-addresses">
                                    {savedAddresses.map((item) => (
                                        <button
                                            type="button"
                                            className={`checkout-saved-address ${shippingAddress._id === item._id
                                                ? "active"
                                                : ""
                                                }`}
                                            key={item._id}
                                            onClick={() =>
                                                selectAddress(item)
                                            }
                                        >
                                            <span className="checkout-saved-address__name">
                                                {item.name} · {item.type}
                                            </span>

                                            <span className="checkout-saved-address__text">
                                                {item.address}, {item.city},{" "}
                                                {item.state} - {item.pincode}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="checkout-address-grid">
                                <div className="checkout-field">
                                    <label className="checkout-field__label">
                                        Full Name
                                    </label>

                                    <input
                                        className="checkout-field__input"
                                        value={shippingAddress.name}
                                        onChange={(e) =>
                                            setShippingAddress({
                                                ...shippingAddress,
                                                name: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="checkout-field">
                                    <label className="checkout-field__label">
                                        Phone
                                    </label>

                                    <input
                                        className="checkout-field__input"
                                        value={shippingAddress.phone}
                                        onChange={(e) =>
                                            setShippingAddress({
                                                ...shippingAddress,
                                                phone: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="checkout-field checkout-field--full">
                                    <label className="checkout-field__label">
                                        Address
                                    </label>

                                    <textarea
                                        className="checkout-field__input checkout-field__input--textarea"
                                        value={shippingAddress.address}
                                        onChange={(e) =>
                                            setShippingAddress({
                                                ...shippingAddress,
                                                address: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="checkout-field">
                                    <label className="checkout-field__label">
                                        City
                                    </label>

                                    <input
                                        className="checkout-field__input"
                                        value={shippingAddress.city}
                                        onChange={(e) =>
                                            setShippingAddress({
                                                ...shippingAddress,
                                                city: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="checkout-field">
                                    <label className="checkout-field__label">
                                        Pincode
                                    </label>

                                    <input
                                        className="checkout-field__input"
                                        value={shippingAddress.pincode}
                                        onChange={(e) =>
                                            setShippingAddress({
                                                ...shippingAddress,
                                                pincode: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="checkout-field">
                                    <label className="checkout-field__label">
                                        Locality
                                    </label>

                                    <input
                                        className="checkout-field__input"
                                        value={shippingAddress.locality}
                                        onChange={(e) =>
                                            setShippingAddress({
                                                ...shippingAddress,
                                                locality: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="checkout-field">
                                    <label className="checkout-field__label">
                                        State
                                    </label>

                                    <input
                                        className="checkout-field__input"
                                        value={shippingAddress.state}
                                        onChange={(e) =>
                                            setShippingAddress({
                                                ...shippingAddress,
                                                state: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="checkout-field">
                                    <label className="checkout-field__label">
                                        Address Type
                                    </label>

                                    <select
                                        className="checkout-field__input"
                                        value={shippingAddress.type}
                                        onChange={(e) =>
                                            setShippingAddress({
                                                ...shippingAddress,
                                                type: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="Home">
                                            Home
                                        </option>

                                        <option value="Work">
                                            Work
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div className="checkout-address-actions">
                                <button
                                    type="button"
                                    className="checkout-save-address"
                                    onClick={saveCheckoutAddress}
                                >
                                    Save Address
                                </button>
                            </div>

                            {locationMessage && (
                                <p className="checkout-modal__message">
                                    {locationMessage}
                                </p>
                            )}
                        </div>

                        <div className="checkout-modal__delivery">
                            Delivery by {deliveryText}
                        </div>

                        <div className="checkout-modal__section">
                            <h3 className="checkout-modal__section-title">
                                Payment Method
                            </h3>

                            <div className="payment-options">
                                <button
                                    type="button"
                                    className={`payment-option ${paymentMethod === "cod"
                                        ? "active"
                                        : ""
                                        }`}
                                    onClick={() =>
                                        setPaymentMethod("cod")
                                    }
                                >
                                    <span className="payment-option__title">
                                        Cash on Delivery
                                    </span>

                                    <span className="payment-option__desc">
                                        Pay when your order arrives
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    className={`payment-option ${paymentMethod === "card"
                                        ? "active"
                                        : ""
                                        }`}
                                    onClick={() =>
                                        setPaymentMethod("card")
                                    }
                                >
                                    <span className="payment-option__title">
                                        Card
                                    </span>

                                    <span className="payment-option__desc">
                                        Demo payment option — no real payment gateway
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    className={`payment-option ${paymentMethod === "upi"
                                        ? "active"
                                        : ""
                                        }`}
                                    onClick={() =>
                                        setPaymentMethod("upi")
                                    }
                                >
                                    <span className="payment-option__title">
                                        UPI
                                    </span>

                                    <span className="payment-option__desc">
                                        Demo payment option — no real payment gateway
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div className="checkout-modal__footer">
                            <div className="checkout-total">
                                <span className="checkout-total__label">
                                    Total
                                </span>

                                <strong className="checkout-total__value element-strong">
                                    ${summary.total.toFixed(2)}
                                </strong>
                            </div>

                            <button
                                type="button"
                                className="checkout-modal__submit"
                                disabled={checkoutLoading}
                                onClick={handleCheckout}
                            >
                                {checkoutLoading
                                    ? "Placing Order..."
                                    : "Place Order"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {locationOpen && (
                <LocationModal
                    onConfirm={applyLocation}
                    onClose={() => setLocationOpen(false)}
                />
            )}
        </div>
    );
};

export default Cart;
