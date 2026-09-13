import { useState } from "react";
import API from "../../services/api";
import { useProducts } from "../../context/product";
import "./AdminCommon.scss";

const Categories = () => {
    const { categories,  loading, fetchCategories } = useProducts();
    const [nameInput, setNameInput] = useState("");
    const [createLoading, setCreateLoading] = useState(false);

    const [editingCategory, setEditingCategory] = useState(null);
    const [editNameInput, setEditNameInput] = useState("");
    const [editModalOpen, setEditModalOpen] = useState(false);

    const [msg, setMsg] = useState({ type: "", text: "" });

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!nameInput.trim()) return;
        setCreateLoading(true);
        setMsg({ type: "", text: "" });

        try {
            const { data } = await API.post("/api/categories", {
                name: nameInput.trim(),
            });

            if (data?.success) {
                setMsg({ type: "success", text: "Category created successfully!" });
                setNameInput("");
                fetchCategories();
            }
        } catch (err) {
            setMsg({
                type: "error",
                text: err.response?.data?.message || "Failed to create category.",
            });
        } finally {
            setCreateLoading(false);
        }
    };

    const handleOpenEdit = (c) => {
        setEditingCategory(c);
        setEditNameInput(c.name);
        setEditModalOpen(true);
    };

    const handleUpdateCategory = async (e) => {
        e.preventDefault();
        if (!editingCategory) return;

        try {
            const { data } = await API.put(`/api/categories/${editingCategory._id}`, {
                name: editNameInput.trim(),
            });

            if (data?.success) {
                setEditModalOpen(false);
                fetchCategories();
            }
        } catch (err) {
            alert("Failed to update: " + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return;
        try {
            const { data } = await API.delete(`/api/categories/${id}`);
            if (data?.success) {
                fetchCategories();
            }
        } catch (err) {
            alert("Failed to delete category: " + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="admin-page">

            <div className="admin-page__header">
                <div className="header-title">
                    <h1 className="element-h1">Categories Management</h1>
                    <p className="element-p">Manage product classifications and catalog taxonomy</p>
                </div>
            </div>

            <div className="admin-card">
                <div className="admin-card__header">
                    <h3 className="element-h3">Create New Category</h3>
                </div>

                <form noValidate onSubmit={handleCreateCategory} className="admin-inline-form">
                    <input
                        type="text"
                        placeholder="Enter category name (e.g. Hoodies, Denim)"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="admin-search-input"
                    />
                    <button
                        type="submit"
                        className="btn-admin-primary"
                        disabled={createLoading || !nameInput.trim()}
                    >
                        {createLoading ? "Adding..." : "+ Add Category"}
                    </button>
                </form>

                {msg.text && (
                    <p className={msg.type === "success" ? "admin-msg-success" : "admin-msg-error"}>
                        {msg.text}
                    </p>
                )}
            </div>

            <div className="admin-card">
                <div className="admin-card__header">
                    <h3 className="element-h3">Existing Categories ({categories.length})</h3>
                </div>

                {loading ? (
                    <p className="admin-state-loading">Loading categories...</p>
                ) : categories.length === 0 ? (
                    <p className="admin-state-empty">No categories created yet.</p>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr className="element-tr">
                                    <th className="element-th">Category Name</th>
                                    <th className="element-th">ID</th>
                                    <th className="element-th">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((c) => (
                                    <tr key={c._id}>
                                        <td className="element-td"><strong className="element-strong">{c.name}</strong></td>
                                        <td className="element-td"><small className="admin-small-id element-small">#{c._id.substring(c._id.length - 6)}</small></td>
                                        <td className="actions-cell">
                                            <button className="edit-btn" onClick={() => handleOpenEdit(c)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg> Edit
                                            </button>
                                            <button className="delete-btn" onClick={() => handleDeleteCategory(c._id)}>
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

            {editModalOpen && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal admin-modal--sm">
                        <div className="admin-modal__header">
                            <h3 className="element-h3">Edit Category</h3>
                            <button className="close-btn" onClick={() => setEditModalOpen(false)}>
                                &times;
                            </button>
                        </div>

                        <form noValidate onSubmit={handleUpdateCategory} className="admin-form">
                            <div className="form-group">
                                <label className="element-label">Category Name</label>
                                <input
                                    type="text"
                                    value={editNameInput}
                                    onChange={(e) => setEditNameInput(e.target.value)}
                                />
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn-cancel" onClick={() => setEditModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-submit">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;
