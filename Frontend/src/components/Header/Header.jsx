import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/auth";
import API from "../../services/api";
import "./Header.scss";

import closeIcon from "../../assets/icons/navbar icons/close.svg";
import dropDownArrow from "../../assets/icons/navbar icons/drop-down-arrow.svg";
import searchIcon from "../../assets/icons/navbar icons/search-icon.svg";
import cartIcon from "../../assets/icons/navbar icons/card-icon.svg";
import accountIcon from "../../assets/icons/navbar icons/account-icon.svg";

const Header = () => {
    const [showBanner, setShowBanner] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [totalCartItems, setTotalCartItems] = useState(0);

    const { auth, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = params.get("search") || params.get("keyword") || "";
        setSearchQuery(q);
    }, [location.search]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const currentParam = params.get("search") || params.get("keyword") || "";
        if (searchQuery.trim() === currentParam.trim()) return;
        const timer = setTimeout(() => {
            if (searchQuery.trim()) {
                navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
            } else if (location.pathname === "/products" && currentParam) {
                navigate("/products");
            }
        }, 350);

        return () => clearTimeout(timer);
    }, [searchQuery, location.pathname, location.search, navigate]);

    useEffect(() => {
        const fetchCartCount = async () => {
            if (!auth?.token) {
                setTotalCartItems(0);
                return;
            }
            try {
                const res = await API.get("/api/cart");
              if (res.data?.success && res.data.cart?.items) {
    const count = res.data.cart.items.length;
    setTotalCartItems(count);
}
            } catch (err) {
                console.error("Failed to load cart count:", err);
            }
        };

        fetchCartCount();
        window.addEventListener("cartUpdated", fetchCartCount);
        return () => window.removeEventListener("cartUpdated", fetchCartCount);
    }, [auth?.token]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
        } else if (location.pathname === "/products") {
            navigate("/products");
        }
        setShowMobileSearch(false);
    };

    const handleLogout = () => {
        logout();
        setAccountDropdownOpen(false);
        navigate("/login");
    };

    return (
        <header className="header">
            {showBanner && (
                <nav className="header__nav-primary">
                    <div className="header__nav-container">
                        <span className="header__nav-text">
                            Sign up and get 20% off to your first order.
                            <Link to="/register" className="header__nav-content">
                                Sign Up Now
                            </Link>
                        </span>
                        <img
                            src={closeIcon}
                            alt="close-icon"
                            className="header__nav-icon"
                            onClick={() => setShowBanner(false)}
                        />
                    </div>
                </nav>
            )}
            <nav className="header__nav-secondary">
                <div className="header__nav-secondary-container">
                    <button
                        className="header__nav-mobile-icon"
                        onClick={() => setMobileMenuOpen(true)}
                        aria-label="Open mobile menu"
                    >
                        ☰
                    </button>

                    <Link to="/" className="logo">
                        SHOP.CO
                    </Link>

                    <ul className="header__nav-links">
                        <li className="drop-down-icon">
                            <Link to="/products" className="header__nav-link">
                                <span className="element-span">Shop</span>
                            </Link>
                            <img src={dropDownArrow} alt="drop-down-icon" />
                        </li>
                        <li className="element-li">
                            <Link to="/products?sort=low-high" className="header__nav-link">On Sale</Link>
                        </li>
                        <li className="element-li">
                            <Link to="/products?sort=newest" className="header__nav-link">New Arrivals</Link>
                        </li>
                        <li className="element-li">
                            <Link to="/products" className="header__nav-link">Brands</Link>
                        </li>
                    </ul>

                    <div className="search">
                        <form noValidate onSubmit={handleSearchSubmit} className="search__form">
                            <button type="submit" className="search__button" aria-label="Search">
                                <img src={searchIcon} alt="search-icon" className="search__icon" />
                            </button>
                            <input
                                type="text"
                                className="search__input"
                                placeholder="Search for products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </form>
                    </div>
                    <div className="header__nav-secondary-icons">
                        <img
                            src={searchIcon}
                            alt="search-icon"
                            className="search-icon"
                            onClick={() => setShowMobileSearch(!showMobileSearch)}
                        />

                        <Link to="/cart" className="header__cart-link">
                            <img
                                src={cartIcon}
                                alt="cart-icon"
                                className="header__cart-icon"
                            />
                            {totalCartItems > 0 && (
                                <span className="header__cart-badge">{totalCartItems}</span>
                            )}
                        </Link>

                        <div className="header__account-wrapper">
                            <button
                                className="header__account-btn"
                                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                                aria-label="Account options"
                            >
                                <img src={accountIcon} alt="account icon" className="search__icon"/>
                            </button>

                            {accountDropdownOpen && (
                                <>
                                    <div
                                        className="header__dropdown-backdrop"
                                        onClick={() => setAccountDropdownOpen(false)}
                                    />
                                    <div className="header__account-dropdown">
                                        {auth?.user ? (
                                            <>
                                                <div className="dropdown-user-info">
                                                    <strong className="dropdown-user-info__name element-strong">{auth.user.name}</strong>
                                                    <span className="dropdown-user-info__email">{auth.user.email}</span>
                                                </div>
                                                <Link
                                                    to="/profile" className="header__dropdown-link"
                                                    onClick={() => setAccountDropdownOpen(false)}
                                                >
                                                    My Profile
                                                </Link>
                                                <Link
                                                    to="/orders"  className="header__dropdown-link"
                                                    onClick={() => setAccountDropdownOpen(false)}
                                                >
                                                    My Orders
                                                </Link>
                                                {auth?.user?.role === "admin" && (
                                                    <Link
                                                        to="/admin/dashboard"  className="header__dropdown-link"
                                                        onClick={() => setAccountDropdownOpen(false)}
                                                    >
                                                        Admin Dashboard
                                                    </Link>
                                                )}
                                                <button onClick={handleLogout} className="header__dropdown-logout">Logout</button>
                                            </>
                                        ) : (
                                            <>
                                                <Link
                                                    to="/login"  className="header__dropdown-link"
                                                    onClick={() => setAccountDropdownOpen(false)}
                                                >
                                                    Login
                                                </Link>
                                                <Link
                                                    to="/register"  className="header__dropdown-link"
                                                    onClick={() => setAccountDropdownOpen(false)}
                                                >
                                                    Register
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                    </div>
                </div>
            </nav>

            {showMobileSearch && (
                <div className="header__mobile-search">
                    <div className="search">
                        <form noValidate onSubmit={handleSearchSubmit} className="search__form">
                            <button type="submit" className="search__button" aria-label="Search">
                                <img src={searchIcon} alt="search-icon" />
                            </button>
                            <input
                                type="text"
                                className="search__input"
                                placeholder="Search for products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                        </form>
                    </div>
                </div>
            )}

            <div
                className={`header__mobile-drawer ${
                    mobileMenuOpen ? "header__mobile-drawer--open" : ""
                }`}
            >
                <div className="header__mobile-drawer-header">
                    <span className="logo">SHOP.CO</span>
                    <button  className="header__mobile-close"
                        onClick={() => setMobileMenuOpen(false)}
                        aria-label="Close menu"
                    >
                        ✕
                    </button>
                </div>
                <ul className="header__mobile-drawer-links">
                    <li className="element-li">
                        <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                            Home
                        </Link>
                    </li>
                    <li className="element-li">
                        <Link to="/products" className="header__mobile-link" onClick={() => setMobileMenuOpen(false)}>
                            Shop
                        </Link>
                    </li>
                    <li className="element-li">
                        <Link to="/products?sort=low-high" className="header__mobile-link" onClick={() => setMobileMenuOpen(false)}>
                            On Sale
                        </Link>
                    </li>
                    <li className="element-li">
                        <Link to="/products?sort=newest" className="header__mobile-link" onClick={() => setMobileMenuOpen(false)}>
                            New Arrivals
                        </Link>
                    </li>
                    <li className="element-li">
                        <Link to="/products" className="header__mobile-link" onClick={() => setMobileMenuOpen(false)}>
                            Brands
                        </Link>
                    </li>
                    {auth?.user ? (
                        <>
                            <li className="element-li">
                                <Link to="/profile"  className="header__mobile-link"onClick={() => setMobileMenuOpen(false)}>
                                    My Profile
                                </Link>
                            </li>
                            <li className="element-li">
                                <Link to="/orders"  className="header__mobile-link" onClick={() => setMobileMenuOpen(false)}>
                                    My Orders
                                </Link>
                            </li>
                            {auth?.user?.role === "admin" && (
                                <li className="element-li">
                                    <Link to="/admin/dashboard" className="header__mobile-link" onClick={() => setMobileMenuOpen(false)}>
                                        Admin Panel
                                    </Link>
                                </li>
                            )}
                            <li className="element-li">
                                <button className="logout" onClick={handleLogout}>
                                    Logout
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li className="element-li">
                                <Link to="/login" className="header__mobile-link" onClick={() => setMobileMenuOpen(false)}>
                                    Login
                                </Link>
                            </li>
                            <li className="element-li">
                                <Link to="/register" className="header__mobile-link" onClick={() => setMobileMenuOpen(false)}>
                                    Register
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>

            {mobileMenuOpen && (
                <div
                    className="header__mobile-overlay"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}
        </header>
    );
};

export default Header;
