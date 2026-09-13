import { memo } from "react";
import { Link } from "react-router-dom";
import { getImageUrl } from "../../services/api";
import "./ProductCard.scss";

import fallbackImg from "../../assets/images/products/image-1.png";
import StarRating from "../StarRating/StarRating";
const ProductCard = ({ product }) => {
    if (!product) return null;

    const photoUrl = getImageUrl(product.images?.[0]);
    const rating = product.rating !== undefined && product.rating !== null ? product.rating : 4.5;
    const oldPrice = product.oldPrice && product.oldPrice > product.price ? product.oldPrice : null;
    const discount = oldPrice ? Math.round(((oldPrice - product.price) / oldPrice) * 100) : null;
    const isOutOfStock = product.quantity === 0;

    return (
        <Link
            to={`/products/${product._id}`}
            className={`product-card ${isOutOfStock ? "product-card--out-of-stock" : ""}`}
        >
            <div className="product-card__image">
                {isOutOfStock && (
                    <span className="product-card__badge-out-of-stock">
                        Out of Stock
                    </span>
                )}
                <img  className="product-card__image-img"
                    src={photoUrl}
                    alt={product.name}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = fallbackImg;
                    }}
                />
            </div>

            <h4 className="product-card__title" title={product.name}>
                {product.name}
            </h4>

            <div className="product-card__rating">
                <StarRating rating={rating} size={16} />
                <span className="rating-val">{rating}/<span className="rating-max">5</span></span>
            </div>

            <div className="product-card__price">
                <span className="element-span">${product.price}</span>
                {oldPrice && oldPrice > product.price && (
                    <span className="product-card__old-price">${oldPrice}</span>
                )}
                {discount && discount > 0 && (
                    <span className="product-card__discount">-{discount}%</span>
                )}
            </div>
        </Link>
    );
};

export default memo(ProductCard);
