import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import API from "../services/api";
import { useProducts } from "../context/product";
import ProductCard from "../components/ProductCard/ProductCard";
import "./Products.scss";

import filterIcon from "../assets/icons/review-filter/Frame.svg";

const COLORS = [
    "Green",
    "Red",
    "Yellow",
    "Orange",
    "Cyan",
    "Blue",
    "Purple",
    "Pink",
    "White",
    "Black",
];

const SIZES = [
    "XX-Small",
    "X-Small",
    "Small",
    "Medium",
    "Large",
    "X-Large",
    "XX-Large",
    "3X-Large",
    "4X-Large",
];

const DRESS_STYLES = ["Casual", "Formal", "Party", "Gym"];

const MIN_PRICE_LIMIT = 50;
const MAX_PRICE_LIMIT = 300;

const Products = () => {
    const { slug } = useParams();
    const [searchParams] = useSearchParams();
    const keywordQuery = searchParams.get("keyword") || searchParams.get("search") || "";
    const categoryQuery = searchParams.get("category") || "";
    const sortQuery = searchParams.get("sort") || "";

    const { categories } = useProducts();
    const [products, setProducts] = useState([]);
    const [totalProducts, setTotalProducts] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [minPrice, setMinPrice] = useState(50);
    const [maxPrice, setMaxPrice] = useState(300);
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedStyle, setSelectedStyle] = useState(slug || categoryQuery || "");
 
    const [sortBy, setSortBy] = useState(sortQuery === "newest" ? "newest" : sortQuery === "low-high" ? "low-high" : sortQuery === "high-low" ? "high-low" : "popular");
    const [debouncedKeyword, setDebouncedKeyword] = useState(keywordQuery);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [priceOpen, setPriceOpen] = useState(true);
    const [colorsOpen, setColorsOpen] = useState(true);
    const [sizesOpen, setSizesOpen] = useState(true);
    const [stylesOpen, setStylesOpen] = useState(true);

    const fetchFilteredProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                page: currentPage,
                limit: 9,
                ...(debouncedKeyword ? { search: debouncedKeyword } : {}),
                ...(selectedCategory ? { category: selectedCategory } : {}),
                ...(selectedSize ? { size: selectedSize } : {}),
                ...(selectedStyle ? { dressStyle: selectedStyle } : {}),
               
                ...(minPrice > MIN_PRICE_LIMIT ? { minPrice } : {}),
                ...(maxPrice < MAX_PRICE_LIMIT ? { maxPrice } : {}),
                ...(sortBy === "popular"
                    ? { sort: "name" }
                    : { sort: sortBy === "newest" ? "new" : sortBy === "low-high" ? "low" : "high" }),
            };

            const res = await API.get("/api/products", { params });

            if (res.data?.success) {
                setProducts(res.data.products || []);
                setTotalProducts(res.data.total || 0);
                setTotalPages(Math.max(1, Math.ceil((res.data.total || 0) / 9)));
            } else {
                setProducts([]);
                setTotalProducts(0);
            }
        } catch (err) {
            console.error("Error fetching products:", err);
            setError("Failed to load products. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [selectedCategory, selectedSize, selectedStyle, minPrice, maxPrice, sortBy, currentPage, debouncedKeyword]);

    useEffect(() => {
        fetchFilteredProducts();
    }, [fetchFilteredProducts]);

    useEffect(() => {
        const targetSlug = slug || categoryQuery;
        if (targetSlug) {
            const formatted = targetSlug.charAt(0).toUpperCase() + targetSlug.slice(1);
            if (DRESS_STYLES.includes(formatted)) {
                setSelectedStyle(formatted);
            }
            if (categories.length > 0) {
                const matched = categories.find(
                    (c) =>
                        c.slug?.toLowerCase() === targetSlug.toLowerCase() ||
                        c.name?.toLowerCase() === targetSlug.toLowerCase()
                );
                if (matched) {
                    setSelectedCategory(matched._id);
                }
            }
        }
    }, [slug, categoryQuery, categories]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedKeyword(keywordQuery.trim());
            setCurrentPage(1);
        }, 400);

        return () => clearTimeout(timer);
    }, [keywordQuery]);

    const handleCategoryClick = (categoryId) => {
        setSelectedCategory((prev) => (prev === categoryId ? null : categoryId));
        setCurrentPage(1);
    };

    const handleStyleClick = (style) => {
        setSelectedStyle((prev) => (prev === style ? "" : style));
        setCurrentPage(1);
    };

    const handleResetFilters = () => {
        setSelectedCategory(null);
        setMinPrice(50);
        setMaxPrice(300);
        setSelectedColor(null);
        setSelectedSize(null);
        setSelectedStyle("");
        
        setSortBy("popular");
        setCurrentPage(1);
        if (mobileDrawerOpen) setMobileDrawerOpen(false);
    };

    const handleApplyFilter = () => {
        setCurrentPage(1);
        if (mobileDrawerOpen) setMobileDrawerOpen(false);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const activeCategoryObj = useMemo(
        () => categories.find((c) => c._id === selectedCategory),
        [categories, selectedCategory]
    );
    const pageTitle = activeCategoryObj ? activeCategoryObj.name : selectedStyle || "All Products";

    return (
        <div className="products-page">

            <nav className="products-page__breadcrumb">
                <Link to="/">Home</Link>
                <span className="element-span">&gt;</span>
                <span className="active">{pageTitle}</span>
            </nav>

            <div className="products-page__layout">

                <aside className={`products-page__sidebar ${mobileDrawerOpen ? "open" : ""} element-a`}>
                    <div className="products-page__sidebar-header">
                        <h3 className="element-h3">Filters</h3>
                        <button
                            type="button"
                            className="filter-icon-btn"
                            aria-label="Filter"
                            onClick={() => setMobileDrawerOpen(false)}
                        >
                            <img src={filterIcon} alt="filter icon" />
                        </button>
                        <button
                            type="button"
                            className="close-mobile-btn"
                            onClick={() => setMobileDrawerOpen(false)}
                            aria-label="Close filters"
                        >
                            &times;
                        </button>
                    </div>

                    <div className="products-page__sidebar-section">
                        <ul className="products-page__sidebar-categories">
                            {categories.map((cat) => (
                                <li key={cat._id}>
                                    <button
                                        type="button"
                                        className={selectedCategory === cat._id ? "active" : ""}
                                        onClick={() => handleCategoryClick(cat._id)}
                                    >
                                        <span className="element-span">{cat.name}</span>
                                        <span className="arrow">&gt;</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="products-page__sidebar-section">
                        <div
                            className="section-title"
                            onClick={() => setPriceOpen(!priceOpen)}
                        >
                            <span className="element-span">Price</span>
                            <span className={`arrow ${priceOpen ? "open" : ""}`}>⌄</span>
                        </div>
                        {priceOpen && (
                            <div className="products-page__sidebar-price">
                                <div className="dual-slider-container">
                                    <div className="slider-track"></div>
                                    <input
                                        type="range"
                                        min={MIN_PRICE_LIMIT}
                                        max={MAX_PRICE_LIMIT}
                                        step="5"
                                        value={minPrice}
                                        onChange={(e) => {
                                            const value = Math.min(Number(e.target.value), maxPrice - 5);
                                            setMinPrice(value);
                                        }}
                                        className="thumb thumb--left"
                                        aria-label="Minimum Price"
                                    />
                                    <input
                                        type="range"
                                        min={MIN_PRICE_LIMIT}
                                        max={MAX_PRICE_LIMIT}
                                        step="5"
                                        value={maxPrice}
                                        onChange={(e) => {
                                            const value = Math.max(Number(e.target.value), minPrice + 5);
                                            setMaxPrice(value);
                                        }}
                                        className="thumb thumb--right"
                                        aria-label="Maximum Price"
                                    />
                                </div>
                                <div className="price-values">
                                    <span className="element-span">${minPrice}</span>
                                    <span className="element-span">${maxPrice}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="products-page__sidebar-section">
                        <div
                            className="section-title"
                            onClick={() => setColorsOpen(!colorsOpen)}
                        >
                            <span className="element-span">Colors</span>
                            <span className={`arrow ${colorsOpen ? "open" : ""}`}>⌄</span>
                        </div>
                        {colorsOpen && (
                            <div className="products-page__sidebar-colors">
                                {COLORS.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        className={`color-swatch color-swatch--${color.toLowerCase()} ${selectedColor === color ? "active" : ""}`}
                                        onClick={() =>
                                            setSelectedColor(selectedColor === color ? null : color)
                                        }
                                        aria-label={color}
                                    >
                                        {selectedColor === color && (
                                            <span className="check-mark">✓</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="products-page__sidebar-section">
                        <div
                            className="section-title"
                            onClick={() => setSizesOpen(!sizesOpen)}
                        >
                            <span className="element-span">Size</span>
                            <span className={`arrow ${sizesOpen ? "open" : ""}`}>⌄</span>
                        </div>
                        {sizesOpen && (
                            <div className="products-page__sidebar-sizes">
                                {SIZES.map((sz) => (
                                    <button
                                        key={sz}
                                        type="button"
                                        className={`size-btn ${selectedSize === sz ? "active" : ""}`}
                                        onClick={() =>
                                            setSelectedSize(selectedSize === sz ? null : sz)
                                        }
                                    >
                                        {sz}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="products-page__sidebar-section">
                        <div
                            className="section-title"
                            onClick={() => setStylesOpen(!stylesOpen)}
                        >
                            <span className="element-span">Dress Style</span>
                            <span className={`arrow ${stylesOpen ? "open" : ""}`}>⌄</span>
                        </div>
                        {stylesOpen && (
                            <ul className="products-page__sidebar-styles">
                                {DRESS_STYLES.map((style) => (
                                    <li key={style}>
                                        <button
                                            type="button"
                                            className={selectedStyle === style ? "active" : ""}
                                            onClick={() => handleStyleClick(style)}
                                        >
                                            <span className="element-span">{style}</span>
                                            <span className="arrow">&gt;</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="products-page__sidebar-actions">
                        <button
                            type="button"
                            className="apply-filter-btn"
                            onClick={handleApplyFilter}
                        >
                            Apply Filter
                        </button>
                        <button
                            type="button"
                            className="reset-filter-btn"
                            onClick={handleResetFilters}
                        >
                            Reset All Filters
                        </button>
                    </div>
                </aside>

                <main className="products-page__content">

                    <div className="products-page__header">
                        <div className="header-left">
                            <h1 className="element-h1">{pageTitle}</h1>
                            <span className="products-count">
                                Showing {products.length > 0 ? `1-${products.length}` : "0"} of {totalProducts} Products
                            </span>
                        </div>

                        <div className="header-right">
                            <div className="sort-wrapper">
                                <span className="element-span">Sort by:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => {
                                        setSortBy(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="popular">Most Popular</option>
                                    <option value="low-high">Price: Low to High</option>
                                    <option value="high-low">Price: High to Low</option>
                                    <option value="newest">Newest Arrivals</option>
                                </select>
                            </div>

                            <button
                                type="button"
                                className="mobile-filter-trigger"
                                onClick={() => setMobileDrawerOpen(true)}
                                aria-label="Open Filters"
                            >
                                <img src={filterIcon} alt="filters" />
                            </button>
                        </div>
                    </div>

                    <div className="products-page__grid">
                        {loading ? (
                            <div className="products-page__loading">
                                <p className="element-p">Loading products...</p>
                            </div>
                        ) : error ? (
                            <div className="products-page__empty">
                                <h3 className="element-h3">{error}</h3>
                                <button
                                    type="button"
                                    className="clear-btn"
                                    onClick={handleResetFilters}
                                >
                                    Retry
                                </button>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="products-page__empty">
                                <h3 className="element-h3">No Products Found</h3>
                                <p className="element-p">Try adjusting your category or price filters.</p>
                                <button
                                    type="button"
                                    className="clear-btn"
                                    onClick={handleResetFilters}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            products.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="products-page__pagination">
                            <button
                                type="button"
                                className="prev-btn"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage <= 1}
                            >
                                ← Previous
                            </button>

                            <div className="page-numbers">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                    <button
                                        key={pageNum}
                                        type="button"
                                        className={`page-btn ${currentPage === pageNum ? "active" : ""}`}
                                        onClick={() => handlePageChange(pageNum)}
                                    >
                                        {pageNum}
                                    </button>
                                ))}
                            </div>

                            <button
                                type="button"
                                className="next-btn"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages}
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Products;
