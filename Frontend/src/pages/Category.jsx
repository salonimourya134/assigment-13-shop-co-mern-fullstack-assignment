import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";


const Category = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data } = await API.get("/api/categories");
        setCategories(data?.categories || []);
      } catch {
        setError("Failed to load categories.");
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  return (
    <div className="category-page">
      <nav className="category-page__breadcrumb">
        <Link className="category-page__breadcrumb-link" to="/">
          Home
        </Link>
        <span className="category-page__breadcrumb-separator">›</span>
        <span className="category-page__breadcrumb-current">Categories</span>
      </nav>
      <div className="category-page__header">
        <h1 className="category-page__title">Categories</h1>
        <p className="category-page__description">
          Explore products by category.
        </p>
      </div>
      {loading && (
        <div className="category-page__state">Loading categories...</div>
      )}
      {!loading && error && <div className="category-page__state">{error}</div>}
      {!loading && !error && categories.length === 0 && (
        <div className="category-page__state">No categories found.</div>
      )}
      {!loading && !error && categories.length > 0 && (
        <div className="category-page__grid">
          {categories.map((category) => (
            <Link
              key={category._id}
              to={`/products?category=${category._id}`}
              className="category-page__card"
            >
              <div className="category-page__image">
                {category.image ? (
                  <img
                    className="category-page__image-img"
                    src={category.image}
                    alt={category.name}
                  />
                ) : (
                  <span className="category-page__image-letter">
                    {category.name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="category-page__content">
                <h2 className="category-page__card-title">{category.name}</h2>
                <p className="category-page__card-description">
                  {category.description || "View products"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Category;
