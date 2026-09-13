import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import API, { getImageUrl } from "../services/api";
import { useAuth } from "../context/auth";
import { useProducts } from "../context/product";
import ProductCard from "../components/ProductCard/ProductCard";
import StarRating from "../components/StarRating/StarRating";
import "./ProductDetails.scss";

import filterIcon from "../assets/icons/review-filter/Frame.svg";
import fallbackImg from "../assets/images/products/image-1.png";
import { formatDeliveryDate } from "../utils/delivery";

const ProductDetails = () => {
    const { id } = useParams();
    const { auth } = useAuth();
    const { products: allProducts } = useProducts();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [selectedImgIndex, setSelectedImgIndex] = useState(0);
    const [selectedColor, setSelectedColor] = useState("brown");
    const [selectedSize, setSelectedSize] = useState("Large");
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState("reviews");
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [sortBy, setSortBy] = useState("latest");
    const [toastMessage, setToastMessage] = useState("");

    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewForm, setReviewForm] = useState({
        name: auth?.user?.name || "",
        rating: 5,
        comment: "",
    });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [deliveryPincode, setDeliveryPincode] = useState("");

    const fetchProductReviews = useCallback(async (productId) => {
        try {
            setReviewsLoading(true);
            const res = await API.get(`/api/reviews/${productId || id}`);
            if (res.data?.success) {
                setReviews(res.data.reviews || []);
            }
        } catch (err) {
            console.error("Error loading reviews:", err);
        } finally {
            setReviewsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await API.get(`/api/products/${id}`);
                const productData = res.data?.product || null;

                if (productData) {
                    setProduct(productData);
                    fetchProductReviews(productData._id);
                } else {
                    setError("Product not found");
                }
            } catch (err) {
                console.error("Error fetching product:", err);
                setError("Failed to load product details.");
            } finally {
                setLoading(false);
            }
        };

        fetchProductData();
        window.scrollTo(0, 0);
    }, [fetchProductReviews, id]);

    useEffect(() => {
        if (!auth?.token) {
            setDeliveryPincode("");
            return;
        }

        API.get("/api/users/addresses")
            .then(({ data }) => {
                const addresses = data?.addresses || [];
                const selected = addresses.find((item) => item.isDefault) || addresses[0];
                setDeliveryPincode(selected?.pincode || "");
            })
            .catch(() => setDeliveryPincode(""));
    }, [auth?.token]);

    const relatedProducts = (allProducts || [])
        .filter((p) => p._id !== product?._id && p.slug !== id)
        .slice(0, 4);
const handleQuantityChange = (delta) => {
    const maxStock = Number(product?.sizes?.[selectedSize] || 0);
    const newQty = quantity + delta;

    if (newQty >= 1 && newQty <= maxStock) {
        setQuantity(newQty);
    }
};
    const handleAddToCart = async () => {
        if (!product) return;

        if (!auth?.token) {
            navigate(`/login?redirect=${encodeURIComponent(`/products/${id}`)}`);
            return;
        }

        try {
            await API.post("/api/cart", {
                productId: product._id,
                quantity,
                size: selectedSize,
                color: selectedColor,
                selectedImage: product.images?.[selectedImgIndex] || product.images?.[0] || "",
            });

            window.dispatchEvent(new Event("cartUpdated"));

            setToastMessage(`Added ${quantity} item(s) to cart!`);
            setTimeout(() => setToastMessage(""), 3500);
        } catch (err) {
            console.error("Error adding to cart:", err);
            setToastMessage(err.response?.data?.message || "Failed to add to cart");
            setTimeout(() => setToastMessage(""), 3500);
        }
    };

    const handleAddReview = async (e) => {
        e.preventDefault();
        if (!reviewForm.name.trim() || !reviewForm.comment.trim()) {
            alert("Please provide your name and review message.");
            return;
        }

        try {
            setSubmittingReview(true);
            const res = await API.post(`/api/reviews/${product?._id || id}`, {
                name: reviewForm.name.trim(),
                rating: Number(reviewForm.rating),
                comment: reviewForm.comment.trim(),
                productId: product?._id || id,
                isTestimonial: false,
            });

            if (res.data?.success && res.data.review) {
                setReviews((prev) => [res.data.review, ...prev]);
                setShowReviewModal(false);
                setReviewForm({
                    name: auth?.user?.name || "",
                    rating: 5,
                    comment: "",
                });
                setToastMessage("Thank you! Your review has been added.");
                setTimeout(() => setToastMessage(""), 3500);
            }
        } catch (err) {
            alert("Failed to submit review. Please try again.");
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="product-details-container product-details-container--center">
                <p className="element-p">Loading product details...</p>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="product-details-container product-details-container--center">
                <h2 className="element-h2">{error || "Product Not Found"}</h2>
                <p className="element-p">
                    <Link to="/products" className="btn-secondary">Back to Products</Link>
                </p>
            </div>
        );
    }

    const galleryImages = (product.images || []).map(getImageUrl);
    const photoUrl = galleryImages[0] || getImageUrl("");
    const rating = product.rating !== undefined && product.rating !== null ? product.rating : 4.5;
    const oldPrice = product.oldPrice && product.oldPrice > product.price ? product.oldPrice : null;
    const discount = oldPrice ? Math.round(((oldPrice - product.price) / oldPrice) * 100) : null;
    const deliveryText = deliveryPincode ? formatDeliveryDate(deliveryPincode) : "Add address";

    const sortedReviews = [...reviews].sort((a, b) => {
        if (sortBy === "highest") return (b.rating || 5) - (a.rating || 5);
        if (sortBy === "lowest") return (a.rating || 5) - (b.rating || 5);

        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    const visibleReviews = showAllReviews ? sortedReviews : sortedReviews.slice(0, 6);

    return (
        <div className="product-details-container">

            <nav className="product-breadcrumb">
                <Link to="/">Home</Link>
                <span className="element-span">&gt;</span>
                <Link to="/products">Shop</Link>
                <span className="element-span">&gt;</span>
                <span className="element-span">{product.category?.name || "Clothing"}</span>
                <span className="element-span">&gt;</span>
                <span className="element-span">{product.name}</span>
            </nav>

            <main className="product-details">

                <div className="product-details__gallery">
                    <div className="product-details__thumbnails">
                        {galleryImages.map((imgSrc, idx) => (
                            <button
                                key={idx}
                                className={`product-details__thumbnail ${selectedImgIndex === idx ? "active" : ""}`}
                                onClick={() => setSelectedImgIndex(idx)}
                                type="button"
                                aria-label={`View image ${idx + 1}`}
                            >
                                <img
                                    className="product-details__thumbnail__img"
                                    src={imgSrc}
                                    alt={`${product.name} thumbnail ${idx + 1}`}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = fallbackImg;
                                    }}
                                />
                            </button>
                        ))}
                    </div>

                    <div className="product-details__main-image">
                        <img  className="img"
                            src={galleryImages[selectedImgIndex] || photoUrl}
                            alt={product.name}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = fallbackImg;
                            }}
                        />
                    </div>
                </div>

                <div className="product-details__info">
                    <h1 className="product-details__title">{product.name}</h1>

                    <div className="product-details__rating">
                        <StarRating rating={rating} size={20} />
                        <span className="product-details__rating-value">
                            {rating}/5
                        </span>
                    </div>

                    <div className="product-details__price">
                        <span className="product-details__current-price">${product.price}</span>
                        {oldPrice && (
                            <span className="product-details__old-price">${oldPrice}</span>
                        )}
                        {discount && discount > 0 && (
                            <span className="product-details__discount">-{discount}%</span>
                        )}
                        {product.quantity === 0 && (
                            <span className="product-details__out-of-stock-badge">
                                Out of Stock
                            </span>
                        )}
                    </div>

                    <p className="product-details__delivery">Delivery by {deliveryText}</p>

                    <p className="product-details__description">
                        {product.description ||
                            "This graphic t-shirt is perfect for any occasion. Crafted from a soft and breathable fabric, it offers superior comfort and style."}
                    </p>

                    <hr className="product-details__divider element-hr" />

                    <div className="product-details__option">
                        <p className="product-details__option-title">Select Colors</p>
                        <div className="product-details__colors">
                            <button
                                type="button"
                                className={`product-details__color product-details__color--brown ${selectedColor === "brown" ? "active" : ""}`}
                                onClick={() => setSelectedColor("brown")}
                                aria-label="Select Brown color"
                            >
                                {selectedColor === "brown" && <span className="element-span">✓</span>}
                            </button>

                            <button
                                type="button"
                                className={`product-details__color product-details__color--green ${selectedColor === "green" ? "active" : ""}`}
                                onClick={() => setSelectedColor("green")}
                                aria-label="Select Green color"
                            >
                                {selectedColor === "green" && <span className="element-span">✓</span>}
                            </button>

                            <button
                                type="button"
                                className={`product-details__color product-details__color--blue ${selectedColor === "blue" ? "active" : ""}`}
                                onClick={() => setSelectedColor("blue")}
                                aria-label="Select Blue color"
                            >
                                {selectedColor === "blue" && <span className="element-span">✓</span>}
                            </button>
                        </div>
                    </div>

                    <hr className="product-details__divider element-hr" />

                    <div className="product-details__option">
                        <p className="product-details__option-title">Choose Size</p>
                        <div className="product-details__sizes">
                         {["Small", "Medium", "Large", "X-Large"].map((size) => {
    const sizeStock = Number(product?.sizes?.[size] || 0);
    return (
        <button
            key={size}
            type="button"
            className={`product-details__size ${selectedSize === size ? "active" : ""}`}
      onClick={() => {
    setSelectedSize(size);
    setQuantity(1);
}}
            disabled={sizeStock === 0}
        >
            {size}
        </button>
    );
})}
                        </div>
                    </div>

                    <hr className="product-details__divider element-hr" />

                    <div className="product-details__actions">
                        <div className="product-details__quantity">
                            <button
                                type="button"
                                onClick={() => handleQuantityChange(-1)}
                              disabled={quantity <= 1 || Number(product?.sizes?.[selectedSize] || 0) === 0}
                                aria-label="Decrease quantity"
                            >
                                -
                            </button>
                          <span className="element-span">{Number(product?.sizes?.[selectedSize] || 0) === 0 ? 0 : quantity}</span>
                            <button
                                type="button"
                                onClick={() => handleQuantityChange(1)}
                                disabled={Number(product?.sizes?.[selectedSize] || 0) === 0 || quantity >= Number(product?.sizes?.[selectedSize] || 0)}
                                aria-label="Increase quantity"
                            >
                                +
                            </button>
                        </div>

                        <button
                            type="button"
                           className={`product-details__add-to-cart btn ${Number(product?.sizes?.[selectedSize] || 0) === 0 ? "product-details__add-to-cart--disabled" : ""}`}
onClick={handleAddToCart}
disabled={Number(product?.sizes?.[selectedSize] || 0) === 0}
                        >
                            {Number(product?.sizes?.[selectedSize] || 0) === 0 ? "Out of Stock" : "Add to Cart"}
                        </button>
                    </div>

                    {toastMessage && (
                        <div className="product-details__toast">
                            <span className="element-span">✓ {toastMessage}</span>
                            <Link to="/cart">View Cart &rarr;</Link>
                        </div>
                    )}
                </div>
            </main>

            <section className="reviews">
                <div className="reviews__tabs">
                    <button
                        type="button"
                        className={`reviews__tab ${activeTab === "details" ? "reviews__tab--active" : ""}`}
                        onClick={() => setActiveTab("details")}
                    >
                        Product Details
                    </button>
                    <button
                        type="button"
                        className={`reviews__tab ${activeTab === "reviews" ? "reviews__tab--active" : ""}`}
                        onClick={() => setActiveTab("reviews")}
                    >
                        Rating &amp; Reviews
                    </button>
                    <button
                        type="button"
                        className={`reviews__tab ${activeTab === "faqs" ? "reviews__tab--active" : ""}`}
                        onClick={() => setActiveTab("faqs")}
                    >
                        FAQs
                    </button>
                </div>

                {activeTab === "details" && (
                    <div className="reviews__tab-content">
                        <h3 className="element-h3">Specifications &amp; Care</h3>
                        <p className="element-p">{product.description}</p>
                        <p className="element-p">
                            <strong className="element-strong">Stock:</strong> {product.quantity !== undefined ? `${product.quantity} items remaining` : "In Stock"}
                        </p>
                    </div>
                )}

                {activeTab === "faqs" && (
                    <div className="reviews__tab-content">
                        <h3 className="element-h3">Frequently Asked Questions</h3>
                        <p className="element-p"><strong className="element-strong">Q: What is the delivery timeframe?</strong><br />A: Standard delivery takes 3-5 business days.</p>
                        <p className="element-p"><strong className="element-strong">Q: Is there a return policy?</strong><br />A: We offer a 30-day hassle-free return guarantee.</p>
                    </div>
                )}

                {activeTab === "reviews" && (
                    <>
                        <div className="reviews__top">
                            <div className="reviews__heading">
                                <h2 className="element-h2">All Reviews</h2>
                                <span className="element-span">({reviews.length})</span>
                            </div>

                            <div className="reviews__actions">
                                <button type="button" className="reviews__filter" aria-label="Filter reviews">
                                    <img src={filterIcon} alt="filter" />
                                </button>

                                <select
                                    className="reviews__sort"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    aria-label="Sort reviews"
                                >
                                    <option value="latest">Latest</option>
                                    <option value="highest">Highest Rating</option>
                                    <option value="lowest">Lowest Rating</option>
                                </select>

                                <button
                                    type="button"
                                    className="reviews__write"
                                    onClick={() => setShowReviewModal(true)}
                                >
                                    Write a Review
                                </button>
                            </div>
                        </div>

                        {reviewsLoading ? (
                            <p className="reviews__status">Loading reviews...</p>
                        ) : visibleReviews.length === 0 ? (
                            <div className="reviews__empty">
                                <p className="element-p">No reviews for this product yet.</p>
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setShowReviewModal(true)}
                                >
                                    Be the first to review!
                                </button>
                            </div>
                        ) : (
                            <div className="reviews__list">
                                {visibleReviews.map((rev) => (
                                    <article key={rev._id || rev.id} className="review">
                                        <div className="review__top">
                                            <div className="review__stars">
                                                <StarRating rating={rev.rating || 5} size={16} />
                                            </div>
                                            <button className="review__more" aria-label="Options" type="button">•••</button>
                                        </div>

                                        <div className="review__name">
                                            {rev.name}
                                            {rev.verified !== false && <span className="element-span">✓</span>}
                                        </div>

                                        <p className="review__text">"{rev.comment || rev.text}"</p>

                                        <p className="review__date">{rev.date}</p>
                                    </article>
                                ))}
                            </div>
                        )}

                        {!showAllReviews && sortedReviews.length > 6 && (
                            <button
                                type="button"
                                className="reviews__load"
                                onClick={() => setShowAllReviews(true)}
                            >
                                Load More Reviews
                            </button>
                        )}
                    </>
                )}
            </section>

            {showReviewModal && (
                <div className="review-modal-backdrop">
                    <div className="review-modal-dialog">
                        <div className="review-modal-header">
                            <h3 className="review-modal-title">Write a Review</h3>
                            <button
                                type="button"
                                onClick={() => setShowReviewModal(false)}
                                className="review-modal-close"
                                aria-label="Close review modal"
                            >
                                &times;
                            </button>
                        </div>

                        <form noValidate onSubmit={handleAddReview} className="review-modal-form">
                            <div className="review-modal-group">
                                <label className="review-modal-label">
                                    Your Name
                                </label>
                                <input
                                    type="text"
                                    value={reviewForm.name}
                                    onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                                    placeholder="Enter your name"
                                    className="review-modal-input"
                                />
                            </div>

                            <div className="review-modal-group">
                                <label className="review-modal-label">
                                    Rating (Stars)
                                </label>
                                <select
                                    value={reviewForm.rating}
                                    onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                                    className="review-modal-select"
                                >
                                    <option value={5}>★★★★★ (5 Stars - Excellent)</option>
                                    <option value={4.5}>★★★★½ (4.5 Stars - Great)</option>
                                    <option value={4}>★★★★☆ (4 Stars - Good)</option>
                                    <option value={3.5}>★★★½☆ (3.5 Stars - Average)</option>
                                    <option value={3}>★★★☆☆ (3 Stars - Fair)</option>
                                </select>
                            </div>

                            <div className="review-modal-group">
                                <label className="review-modal-label">
                                    Your Review
                                </label>
                                <textarea
                                    rows="4"
                                    value={reviewForm.comment}
                                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                    placeholder="What did you like or dislike about this item?"
                                    className="review-modal-textarea"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submittingReview}
                                className="review-modal-submit"
                            >
                                {submittingReview ? "Submitting..." : "Submit Review"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {relatedProducts.length > 0 && (
                <section className="product-card-section product-card-section2">
                    <h2 className="product-card-section__heading">YOU MIGHT ALSO LIKE</h2>
                    <div className="product-card__grid">
                        {relatedProducts.map((relProduct) => (
                            <ProductCard key={relProduct._id} product={relProduct} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default ProductDetails;
