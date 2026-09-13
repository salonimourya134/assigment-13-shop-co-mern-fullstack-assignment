import React, { useState } from "react";
import API from "../../services/api";
import { useProducts } from "../../context/product";
import "./AdminCommon.scss";

const DRESS_STYLES = ["Casual", "Formal", "Party", "Gym"];

const AdminProducts = () => {
    const { products, categories, loading, fetchAllProducts } = useProducts();
    const [searchQuery, setSearchQuery] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        oldPrice: "",
        category: "",
        dressStyle: "Casual",
        quantity: "",
        rating: "4.5",
        photo: null,
    });
    const [formLoading, setFormLoading] = useState(false);
    const [msg, setMsg] = useState({ type: "", text: "" });

    const baseURL = API.defaults.baseURL || "http://localhost:5000";

    const handleOpenCreate = () => {
        setEditingProduct(null);
        setFormData({
            name: "",
            description: "",
            price: "",
            oldPrice: "",
            category: categories.length > 0 ? categories[0]._id : "",
            dressStyle: "Casual",
            quantity: "50",
            rating: "4.5",
            photo: null,
        });
        setMsg({ type: "", text: "" });
        setModalOpen(true);
    };

    const handleOpenEdit = (p) => {
        setEditingProduct(p);
        setFormData({
            name: p.name || "",
            description: p.description || "",
            price: p.price || "",
            oldPrice: p.oldPrice || "",
            category: p.category?._id || p.category || "",
            dressStyle: p.dressStyle || "Casual",
            quantity: p.quantity || "",
            rating: p.rating || "4.5",
            photo: null,
        });
        setMsg({ type: "", text: "" });
        setModalOpen(true);
    };

    const handleDelete = async (productId) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            await API.delete(`/api/products/${productId}`);
            fetchAllProducts();
        } catch (err) {
            alert("Failed to delete product: " + (err.response?.data?.message || err.message));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setMsg({ type: "", text: "" });

        try {
            const productData = new FormData();
            productData.append("name", formData.name);
            productData.append("description", formData.description);
            productData.append("price", formData.price);
            if (formData.oldPrice) productData.append("oldPrice", formData.oldPrice);
            productData.append("category", formData.category);
            productData.append("dressStyle", formData.dressStyle);
            productData.append("quantity", formData.quantity);
            productData.append("rating", formData.rating);
            if (formData.photo) productData.append("images", formData.photo);
            productData.append("sizes", JSON.stringify({
                "XX-Small": 0, "X-Small": 0, Small: 0, Medium: Number(formData.quantity || 0), Large: 0, "X-Large": 0, "XX-Large": 0, "3X-Large": 0, "4X-Large": 0,
            }));

            if (editingProduct) {
                await API.put(`/api/products/${editingProduct._id}`, productData);
                setMsg({ type: "success", text: "Product updated successfully!" });
            } else {
                await API.post("/api/products", productData);
                setMsg({ type: "success", text: "Product created successfully!" });
            }

            setTimeout(() => {
                setModalOpen(false);
                fetchAllProducts();
            }, 800);
        } catch (err) {
            setMsg({
                type: "error",
                text: err.response?.data?.message || "Operation failed. Please check inputs.",
            });
        } finally {
            setFormLoading(false);
        }
    };

    const cleanSearch = searchQuery.trim().toLowerCase();
    const filteredProducts = products.filter((p) =>
        p.name?.toLowerCase().includes(cleanSearch) ||
        p.category?.name?.toLowerCase().includes(cleanSearch)
    );

    return (
        <div className="admin-page">

            <div className="admin-page__header">
                <div className="header-title">
                    <h1 className="element-h1">Products Management</h1>
                    <p className="element-p">Total {products.length} products available in store catalog</p>
                </div>
                <div className="header-actions">
                    <button className="btn-admin-primary" onClick={handleOpenCreate}>
                        + Add New Product
                    </button>
                </div>
            </div>

            <div className="admin-card">
                <div className="admin-card__header">
                    <input
                        type="text"
                        placeholder="Search products by title or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="admin-search-input"
                    />
                </div>

                {loading ? (
                    <p className="admin-state-loading">Loading product catalog...</p>
                ) : filteredProducts.length === 0 ? (
                    <p className="admin-state-empty">No products match your search.</p>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr className="element-tr">
                                    <th className="element-th">Product</th>
                                    <th className="element-th">Category</th>
                                    <th className="element-th">Price</th>
                                    <th className="element-th">Stock</th>
                                    <th className="element-th">Status</th>
                                    <th className="element-th">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((p) => (
                                    <tr key={p._id}>
                                        <td className="product-cell">
                                            <img className="product-image"
                                                src={p.images?.[0] ? `${baseURL}${p.images[0]}` : ""}
                                                alt={p.name}
                                                onError={(e) => { e.currentTarget.classList.add("image-hidden"); }}
                                            />
                                            <div>
                                                <div className="product-name">{p.name}</div>
                                                <small className="admin-small-id element-small">ID: #{p._id.substring(p._id.length - 6)}</small>
                                            </div>
                                        </td>
                                        <td className="element-td">{p.category?.name || "Apparel"}</td>
                                        <td className="element-td">
                                            <strong className="element-strong">${p.price}</strong>
                                            {p.oldPrice > p.price && <span className="admin-old-price">${p.oldPrice}</span>}
                                        </td>
                                        <td className="element-td">{p.quantity || 0}</td>
                                        <td className="element-td">
                                            <span className={`badge ${p.status === "Out of Stock" ? "badge--cancelled" : "badge--stock-ok"}`}>
                                                {p.status || "In Stock"}
                                            </span>
                                        </td>
                                        <td className="actions-cell">
                                            <button className="edit-btn" onClick={() => handleOpenEdit(p)}>
                                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>  Edit
                                            </button>
                                            <button className="delete-btn" onClick={() => handleDelete(p._id)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {modalOpen && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <div className="admin-modal__header">
                            <h3 className="element-h3">{editingProduct ? "Edit Product" : "Add New Product"}</h3>
                            <button className="close-btn" onClick={() => setModalOpen(false)}>
                                &times;
                            </button>
                        </div>

                        <form noValidate onSubmit={handleSubmit} className="admin-form">
                            <div className="form-group">
                                <label className="element-label">Product Title </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Graphic T-Shirt"
                                />
                            </div>

                            <div className="form-group">
                                <label className="element-label">Description *</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe product details, fit, and materials..."
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="element-label">Price ($) *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="120"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="element-label">Old Price ($)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.oldPrice}
                                        onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })}
                                        placeholder="Optional for discount"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="element-label">Category *</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((c) => (
                                            <option key={c._id} value={c._id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="element-label">Dress Style *</label>
                                    <select
                                        value={formData.dressStyle}
                                        onChange={(e) => setFormData({ ...formData, dressStyle: e.target.value })}
                                    >
                                        {DRESS_STYLES.map((st) => (
                                            <option key={st} value={st}>{st}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="element-label">Stock Quantity *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="element-label">Rating (0 - 5)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="5"
                                        value={formData.rating}
                                        onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="element-label">Upload Product Photo {editingProduct && "(Leave blank to keep existing)"}</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFormData({ ...formData, photo: e.target.files[0] })}
                                />
                            </div>

                            {msg.text && (
                                <p className={msg.type === "success" ? "admin-msg-success" : "admin-msg-error"}>
                                    {msg.text}
                                </p>
                            )}

                            <div className="form-actions">
                                <button type="button" className="btn-cancel" onClick={() => setModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-submit" disabled={formLoading}>
                                    {formLoading ? "Saving..." : editingProduct ? "Save Changes" : "Create Product"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
