import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useProducts } from "../context/product";
import ProductCard from "../components/ProductCard/ProductCard";
import StarRating from "../components/StarRating/StarRating";
import "./Home.scss";

import starSmall from "../assets/icons/hero-section icons/star--small.svg";
import starBig from "../assets/icons/hero-section icons/star-big.svg";
import heroImg from "../assets/images/hero-section.jpg";

import versaceLogo from "../assets/icons/hero-section icons/versace.svg";
import zaraLogo from "../assets/icons/hero-section icons/zara-logo-1 1.svg";
import gucciLogo from "../assets/icons/hero-section icons/gucci-logo-1 1.svg";
import pradaLogo from "../assets/icons/hero-section icons/prada-logo-1 1.svg";
import calvinLogo from "../assets/icons/hero-section icons/calvin-klien.svg";

import casualImg from "../assets/images/dress-style/image 11.png";
import partyImg from "../assets/images/dress-style/image 12.png";
import formalImg from "../assets/images/dress-style/image 13.png";
import gymImg from "../assets/images/dress-style/image 14.png";

import prevArrow from "../assets/icons/testimonials icons/arrow-down-bold 2.svg";
import nextArrow from "../assets/icons/testimonials icons/arrow-down-bold 1.svg";

const Home = () => {
    const { products, loading: productsLoading } = useProducts();
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const testimonialTrackRef = useRef(null);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                setLoading(true);
                const testRes = await API.get("/api/reviews/testimonials");
                if (testRes.data?.success) {
                    setTestimonials(testRes.data.testimonials || []);
                }
            } catch (err) {
                console.error("Error fetching testimonials:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTestimonials();
    }, []);

    const newArrivals = products.slice(0, 4);
    const topSelling = products.slice(4, 8).length > 0 ? products.slice(4, 8) : products.slice(0, 4);

    const handleScrollPrev = () => {
        if (testimonialTrackRef.current) {
            testimonialTrackRef.current.scrollBy({ left: -320, behavior: "smooth" });
        }
    };

    const handleScrollNext = () => {
        if (testimonialTrackRef.current) {
            testimonialTrackRef.current.scrollBy({ left: 320, behavior: "smooth" });
        }
    };

    return (
        <div className="home-container">

            <section className="hero-section">
                <div className="hero-section__content">
                    <h1 className="hero-section__heading">
                        FIND CLOTHES THAT MATCHES YOUR STYLE
                    </h1>
                    <p className="element-p">
                        Browse through our diverse range of meticulously crafted
                        garments, designed to bring out your individuality and
                        cater to your sense of style.
                    </p>
                    <button
                        className="btn"
                        onClick={() => navigate("/products")}
                    >
                        Shop Now
                    </button>
                    <div className="hero-section__div">
                        <div className="hero-section__items">
                            <h2 className="element-h2">200+</h2>
                            <p className="element-p">International Brands</p>
                        </div>
                        <div className="hero-section__items">
                            <h2 className="element-h2">2,000+</h2>
                            <p className="element-p">High-Quality Products</p>
                        </div>
                        <div className="hero-section__items">
                            <h2 className="element-h2">30,000+</h2>
                            <p className="element-p">Happy Customers</p>
                        </div>
                    </div>
                </div>

                <div className="hero-section__image">
                    <img
                        src={starSmall}
                        alt="star"
                        className="star-img"
                    />
                    <img
                        src={starBig}
                        alt="big star"
                        className="big-star-img"
                    />
                    <img
                        src={heroImg}
                        alt="hero fashion"
                        className="hero-image"
                    />
                </div>
            </section>

            <div className="hero-section__banner">
                <img src={versaceLogo} alt="versace-logo" />
                <img src={zaraLogo} alt="zara-logo" />
                <img src={gucciLogo} alt="gucci-logo" />
                <img src={pradaLogo} alt="prada-logo" />
                <img src={calvinLogo} alt="calvin-klien-logo" />
            </div>

            <section className="product-card-section">
                <h2 className="product-card-section__heading">NEW ARRIVALS</h2>

                {productsLoading ? (
                    <div className="product-card-loading">Loading products...</div>
                ) : error ? (
                    <div className="product-card-empty">
                        <p className="element-p">{error}</p>
                    </div>
                ) : newArrivals.length === 0 ? (
                    <div className="product-card-empty">
                        <p className="element-p">No products available right now.</p>
                        <Link to="/products" className="btn-secondary">
                            Browse Catalog
                        </Link>
                    </div>
                ) : (
                    <div className="product-card__grid">
                        {newArrivals.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}

                <button
                    className="product-card-section__viewAllButton1 btn-secondary"
                    onClick={() => navigate("/products")}
                >
                    View All
                </button>
                <hr className="element-hr" />
            </section>

            <section className="product-card-section product-card-section2">
                <h2 className="product-card-section__heading">TOP SELLING</h2>

                {productsLoading ? (
                    <div className="product-card-loading">Loading products...</div>
                ) : error ? (
                    <div className="product-card-empty">
                        <p className="element-p">{error}</p>
                    </div>
                ) : topSelling.length === 0 ? (
                    <div className="product-card-empty">
                        <p className="element-p">No products available right now.</p>
                        <Link to="/products" className="btn-secondary">
                            Browse Catalog
                        </Link>
                    </div>
                ) : (
                    <div className="product-card__grid">
                        {topSelling.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}

                <button
                    className="product-card-section__viewAllButton2 btn-secondary"
                    onClick={() => navigate("/products")}
                >
                    View All
                </button>
            </section>

            <section className="dress-style">
                <h2 className="dress-style__heading">BROWSE BY DRESS STYLE</h2>

                <div className="dress-style__grid">
                    <Link
                        to="/products?category=Casual"
                        className="dress-style__card dress-style__card--casual"
                    >
                        <h3 className="element-h3">Casual</h3>
                        <img
                            src={casualImg}
                            alt="Casual clothing style"
                        />
                    </Link>

                    <Link
                        to="/products?category=Formal"
                        className="dress-style__card dress-style__card--formal"
                    >
                        <h3 className="element-h3">Formal</h3>
                        <img
                            src={formalImg}
                            alt="Formal clothing style"
                        />
                    </Link>

                    <Link
                        to="/products?category=Party"
                        className="dress-style__card dress-style__card--party"
                    >
                        <h3 className="element-h3">Party</h3>
                        <img
                            src={partyImg}
                            alt="Party clothing style"
                        />
                    </Link>

                    <Link
                        to="/products?category=Gym"
                        className="dress-style__card dress-style__card--gym"
                    >
                        <h3 className="element-h3">Gym</h3>
                        <img
                            src={gymImg}
                            alt="Gym clothing style"
                        />
                    </Link>
                </div>
            </section>

            <section className="testimonials">
                <div className="testimonials__header">
                    <h2 className="testimonials__heading">OUR HAPPY CUSTOMERS</h2>

                    <div className="testimonials__controls">
                        <button
                            className="testimonials__button testimonials__button--prev"
                            onClick={handleScrollPrev}
                            aria-label="Previous testimonials"
                        >
                            <img
                                src={prevArrow}
                                alt="previous button"
                            />
                        </button>

                        <button
                            className="testimonials__button testimonials__button--next"
                            onClick={handleScrollNext}
                            aria-label="Next testimonials"
                        >
                            <img
                                src={nextArrow}
                                alt="next button"
                            />
                        </button>
                    </div>
                </div>

                <div className="testimonials__track" ref={testimonialTrackRef}>
                    {testimonials.length === 0 ? (
                        <p className="testimonials__empty">No customer reviews yet.</p>
                    ) : (
                        testimonials.map((item, idx) => (
                            <article key={item._id || idx} className="testimonial-card">
                                <div className="testimonial-card__rating">
                                    <StarRating rating={item.rating || 5} size={18} />
                                </div>
                                <h3 className="testimonial-card__name">
                                    {item.name} <span className="element-span">✓</span>
                                </h3>
                                <p className="testimonial-card__text">
                                    "{item.comment}"
                                </p>
                            </article>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
};

export default Home;
