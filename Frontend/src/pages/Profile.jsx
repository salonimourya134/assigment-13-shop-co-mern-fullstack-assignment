import { useCallback,useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API, { getImageUrl } from "../services/api";
import { useAuth } from "../context/auth";
import { useToast } from "../context/toast";
import AddressForm from "../components/AddressForm";
import ProductCard from "../components/ProductCard/ProductCard";
import "./Profile.scss";

const emptyAddress = {
    name: "",
    phone: "",
    pincode: "",
    locality: "",
    address: "",
    city: "",
    state: "",
    landmark: "",
    alternatePhone: "",
    type: "Home",
};

const Profile = () => {
    const { auth, updateUser, logout } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [user, setUser] = useState(auth?.user || null);
    const [orders, setOrders] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [section, setSection] = useState("profile");
    const [edit, setEdit] = useState(false);
    const [profileForm, setProfileForm] = useState({ name: "", phone: "", address: "" });
    const [addressForm, setAddressForm] = useState(null);
    const [loading, setLoading] = useState(true);

const loadData = useCallback(async () => {
    try {
        setLoading(true);

        if (auth?.user) {
            setUser(auth.user);

            setProfileForm({
                name: auth.user.name || "",
                phone: auth.user.phone || "",
                address: auth.user.address || "",
            });
        }

        const results = await Promise.allSettled([
            API.get("/api/users/me"),
            API.get("/api/orders/myorders"),
            API.get("/api/users/addresses"),
            API.get("/api/users/wishlist"),
        ]);

        const [
            profileResult,
            ordersResult,
            addressResult,
            wishlistResult,
        ] = results;

        if (profileResult.status === "fulfilled") {
            const nextUser = profileResult.value.data?.user;

            if (nextUser) {
                setUser(nextUser);

                setProfileForm({
                    name: nextUser.name || "",
                    phone: nextUser.phone || "",
                    address: nextUser.address || "",
                });
            }
        }

        if (ordersResult.status === "fulfilled") {
            setOrders(ordersResult.value.data?.orders || []);
        }

        if (addressResult.status === "fulfilled") {
            setAddresses(addressResult.value.data?.addresses || []);
        }

        if (wishlistResult.status === "fulfilled") {
            setWishlist(wishlistResult.value.data?.wishlist || []);
        }

        if (results.every((result) => result.status === "rejected")) {
            showToast("Unable to load account data", "error");
        }
    } catch (error) {
        showToast(
            error.response?.data?.message || "Failed to load profile",
            "error"
        );
    } finally {
        setLoading(false);
    }
}, [auth, showToast]);
    useEffect(() => {
        if (!auth?.token) {
            navigate("/login?redirect=/profile");
            return;
        }
        loadData();
    }, [auth?.token, loadData, navigate]);

    const saveProfile = async (event) => {
        event.preventDefault();
        try {
            const { data } = await API.put("/api/users/me", profileForm);
            if (data?.success) {
                setUser(data.user);
                updateUser(data.user);
                setEdit(false);
                await loadData();
                showToast("Profile updated successfully");
            }
        } catch (error) {
            showToast(error.response?.data?.message || "Failed to update profile", "error");
        }
    };

    const saveAddress = async (value) => {
        try {
            if (addressForm?._id) {
                const { data } = await API.put(`/api/users/addresses/${addressForm._id}`, value);
                setAddresses((prev) => prev.map((item) => item._id === addressForm._id ? data.address : item));
                showToast("Address updated successfully");
            } else {
                const { data } = await API.post("/api/users/addresses", value);
                setAddresses((prev) => [...prev, data.address]);
                showToast("Address saved successfully");
            }
            setAddressForm(null);
            await loadData();
        } catch (error) {
            showToast(error.response?.data?.message || "Failed to save address", "error");
            throw error;
        }
    };

    const removeAddress = async (id) => {
        try {
            const { data } = await API.delete(`/api/users/addresses/${id}`);
            setAddresses(data.addresses || []);
            showToast("Address removed successfully");
            await loadData();
        } catch (error) {
            showToast(error.response?.data?.message || "Failed to remove address", "error");
        }
    };

    const makeDefault = async (id) => {
        try {
            const { data } = await API.put(`/api/users/addresses/${id}/default`);
            setAddresses((prev) => prev.map((item) => ({ ...item, isDefault: item._id === data.address._id })));
            showToast("Default address updated");
            await loadData();
        } catch (error) {
            showToast(error.response?.data?.message || "Failed to update default address", "error");
        }
    };

    const removeWishlist = async (id) => {
        try {
            await API.post(`/api/users/wishlist/${id}`);
            setWishlist((prev) => prev.filter((item) => item._id !== id));
            showToast("Removed from wishlist");
        } catch (error) {
            showToast(error.response?.data?.message || "Failed to update wishlist", "error");
        }
    };

    const handleLogout = async () => {
        await logout();
        showToast("Logged out successfully");
        navigate("/login");
    };

    if (loading) {
        return <div className="profile-page profile-page--state"><p className="profile-page__state-text">Loading profile...</p></div>;
    }

    const profileUser = user || auth?.user || null;
    const defaultAddress = addresses.find((item) => item.isDefault) || addresses[0];
    const displayAddress = defaultAddress
        ? [defaultAddress.address, defaultAddress.locality, defaultAddress.city, defaultAddress.state, defaultAddress.pincode].filter(Boolean).join(", ")
        : profileUser?.address || "No saved address";

    return (
        <div className="profile-page">
            <nav className="profile-page__breadcrumb">
                <Link to="/">Home</Link>
                <span className="element-span">&gt;</span>
                <span className="profile-page__breadcrumb-active">My Account</span>
            </nav>

            <div className="profile-page__heading-row">
                <div>
                    <h1 className="profile-page__heading">MY ACCOUNT</h1>
                    <p className="profile-page__heading-text">Manage your profile, orders and saved addresses.</p>
                </div>
            </div>

            <div className="profile-page__layout">
                <aside className="profile-page__sidebar element-a">
                    <div className="profile-card profile-user-card">
                        <div className="profile-user-card__avatar">{profileUser?.name?.charAt(0).toUpperCase() || "U"}</div>
                        <h2 className="profile-user-card__name">{profileUser?.name || "Customer"}</h2>
                        <p className="profile-user-card__email">{profileUser?.email || ""}</p>
                    </div>

                    <div className="profile-card profile-menu">
                        <button type="button" className={`profile-menu__item ${section === "profile" ? "active" : ""}`} onClick={() => setSection("profile")}>Profile</button>
                        <button type="button" className={`profile-menu__item ${section === "orders" ? "active" : ""}`} onClick={() => setSection("orders")}>My Orders <span className="element-span">{orders.length}</span></button>
                        <button type="button" className={`profile-menu__item ${section === "address" ? "active" : ""}`} onClick={() => setSection("address")}>Saved Address <span className="element-span">{addresses.length}</span></button>
                        <button type="button" className={`profile-menu__item ${section === "wishlist" ? "active" : ""}`} onClick={() => setSection("wishlist")}>Wishlist <span className="element-span">{wishlist.length}</span></button>
                        <button type="button" className={`profile-menu__item ${section === "settings" ? "active" : ""}`} onClick={() => setSection("settings")}>Settings</button>
                        <button type="button" className="profile-menu__item profile-menu__item--logout" onClick={handleLogout}>Logout</button>
                    </div>
                </aside>

                <section className="profile-page__content">
                    {section === "profile" && (
                        <div className="profile-card profile-form-card">
                            <div className="profile-card__top">
                                <div>
                                    <h2 className="profile-section-title">Personal Information</h2>
                                    <p className="profile-section-desc">Your saved account information.</p>
                                </div>
                                <button type="button" className="profile-edit-button" onClick={() => setEdit((prev) => !prev)}>{edit ? "Cancel" : "Edit"}</button>
                            </div>

                            {!edit ? (
                                <div className="profile-info">
                                    <div className="profile-info__row"><span className="profile-info__label">Name</span><strong className="profile-info__value element-strong">{profileUser?.name || "-"}</strong></div>
                                    <div className="profile-info__row"><span className="profile-info__label">Email</span><strong className="profile-info__value element-strong">{profileUser?.email || "-"}</strong></div>
                                    <div className="profile-info__row"><span className="profile-info__label">Phone</span><strong className="profile-info__value element-strong">{profileUser?.phone || "Not added"}</strong></div>
                                    <div className="profile-info__row profile-info__row--address"><span className="profile-info__label">Address</span><strong className="profile-info__value element-strong">{displayAddress}</strong></div>
                                </div>
                            ) : (
                                <form className="profile-form" noValidate onSubmit={saveProfile}>
                                    <div className="profile-form__grid">
                                        <label className="profile-form__group"><span className="profile-form__label">Name</span><input className="profile-form__input" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} /></label>
                                        <label className="profile-form__group"><span className="profile-form__label">Email</span><input className="profile-form__input profile-form__input--disabled" value={profileUser?.email || ""} disabled /></label>
                                        <label className="profile-form__group"><span className="profile-form__label">Phone</span><input className="profile-form__input" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} /></label>
                                        <label className="profile-form__group profile-form__group--full"><span className="profile-form__label">Address</span><textarea className="profile-form__input profile-form__input--textarea" value={profileForm.address} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} /></label>
                                    </div>
                                    <button type="submit" className="profile-save-button">Save Changes</button>
                                </form>
                            )}
                        </div>
                    )}

                    {section === "address" && (
                        <div className="profile-card">
                            <div className="profile-card__top">
                                <div><h2 className="profile-section-title">Saved Address</h2><p className="profile-section-desc">Add, edit or remove your delivery addresses.</p></div>
                                <button type="button" className="profile-edit-button" onClick={() => setAddressForm(emptyAddress)}>+ Add New Address</button>
                            </div>
                            {addressForm && <AddressForm value={addressForm} onSave={saveAddress} onCancel={() => setAddressForm(null)} />}
                            {!addressForm && <div className="address-list">{addresses.length ? addresses.map((item) => (
                                <div className="address-card" key={item._id}>
                                    <div className="address-card__top"><strong className="address-card__name element-strong">{item.name}</strong><span className="address-card__type">{item.type}</span></div>
                                    <p className="address-card__text">{item.address}{item.locality ? `, ${item.locality}` : ""}<br />{item.city}, {item.state} - {item.pincode}</p>
                                    <p className="address-card__phone">Mobile: {item.phone}</p>
                                    <div className="address-card__actions">
                                        <button className="address-card__action" type="button" onClick={() => setAddressForm(item)}>EDIT</button>
                                        <button className="address-card__action" type="button" onClick={() => removeAddress(item._id)}>REMOVE</button>
                                        {!item.isDefault && <button className="address-card__action" type="button" onClick={() => makeDefault(item._id)}>MAKE DEFAULT</button>}
                                        {item.isDefault && <span className="address-card__default">DEFAULT</span>}
                                    </div>
                                </div>
                            )) : <p className="profile-empty">No saved address yet.</p>}</div>}
                        </div>
                    )}

                    {section === "orders" && (
                        <div className="profile-card">
                            <div className="profile-card__top"><div><h2 className="profile-section-title">My Orders</h2><p className="profile-section-desc">Your recent orders and delivery status.</p></div></div>
                            <div className="profile-orders">{orders.length ? orders.map((order) => (
                                <div className="profile-order" key={order._id}>
                                    <div className="profile-order__head"><strong className="element-strong">Order #{order._id.slice(-8).toUpperCase()}</strong><span className="profile-order__status">{order.status}</span></div>
                                    <div className="profile-order__items">{order.items?.map((item, index) => (
                                        <div className="profile-order__item" key={`${order._id}-${index}`}>
                                            <img className="profile-order__image" src={getImageUrl(item.selectedImage || item.image || item.product?.images?.[0])} alt={item.name} />
                                            <div><strong className="element-strong">{item.name}</strong><p className="profile-order__meta">Qty: {item.quantity} · ${item.price}</p></div>
                                        </div>
                                    ))}</div>
                                    <div className="profile-order__foot"><span className="element-span">Delivery by {order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-"}</span><strong className="element-strong">${order.total}</strong></div>
                                </div>
                            )) : <p className="profile-empty">No orders yet.</p>}</div>
                        </div>
                    )}

                    {section === "wishlist" && (
                        <div className="profile-card"><h2 className="profile-section-title">Wishlist</h2><p className="profile-section-desc">Products you saved for later.</p>{wishlist.length ? <div className="profile-wishlist">{wishlist.map((item) => <div className="profile-wishlist__item" key={item._id}><ProductCard product={item} /><button type="button" className="profile-wishlist__remove" onClick={() => removeWishlist(item._id)}>Remove</button></div>)}</div> : <p className="profile-empty">Your wishlist is empty.</p>}</div>
                    )}

                    {section === "settings" && (
                        <div className="profile-card"><h2 className="profile-section-title">Settings</h2><p className="profile-section-desc">Your account settings.</p><div className="profile-setting-row"><div className="profile-setting-row__content"><strong className="profile-setting-row__title element-strong">Account Status</strong><span className="profile-setting-row__value">{profileUser?.status || "active"}</span></div><span className="profile-setting-badge">Active</span></div><div className="profile-setting-row"><div className="profile-setting-row__content"><strong className="profile-setting-row__title element-strong">Account Role</strong><span className="profile-setting-row__value">{profileUser?.role || "customer"}</span></div><span className="profile-setting-badge">Protected</span></div></div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default Profile;
