import { useId } from "react";

const StarRating = ({ rating = 4.5, size = 16 }) => {
    const baseId = useId();
    const score = Math.max(0, Math.min(5, Number(rating) || 0));

    return (
        <span
            className="star-rating"
            aria-label={`Rating: ${score} out of 5 stars`}
        >
            {[1, 2, 3, 4, 5].map((starNum) => {
                const fillPercent = Math.max(0, Math.min(100, Math.round((score - (starNum - 1)) * 100)));
                const gradId = `${baseId}-star-${starNum}`;

                return (
                    <svg
                        key={starNum}
                        width={size}
                        height={size}
                        viewBox="0 0 24 24"
                        className="star-rating__star"
                    >
                        <defs>
                            <linearGradient id={gradId}>
                                <stop className="star-rating__fill" offset={`${fillPercent}%`} />
                                <stop className="star-rating__empty" offset={`${fillPercent}%`} />
                            </linearGradient>
                        </defs>
                        <path
                            fill={`url(#${gradId})`}
                            d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                        />
                    </svg>
                );
            })}
        </span>
    );
};

export default StarRating;
