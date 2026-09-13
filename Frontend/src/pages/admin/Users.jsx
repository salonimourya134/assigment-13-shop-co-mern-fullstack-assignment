import React, { useEffect, useState } from "react";
import API from "../../services/api";
import "./AdminCommon.scss";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ name: "", phone: "", address: "", role: "customer", status: "active" });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data } = await API.get("/api/admin/users");
            setUsers(data?.users || []);
        } catch (err) {
            console.error("Error loading users:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const openEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name || "",
            phone: user.phone || "",
            address: user.address || "",
            role: user.role || "customer",
            status: user.status || "active",
        });
        setModalOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await API.put(`/api/admin/users/${editingUser._id}`, formData);
            setModalOpen(false);
            await fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update user");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await API.delete(`/api/admin/users/${id}`);
            await fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete user");
        }
    };

    const filteredUsers = users.filter((user) =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <div className="header-title">
                    <h1 className="element-h1">Users Directory</h1>
                    <p className="element-p">Total {users.length} registered user account(s)</p>
                </div>
            </div>

            <div className="admin-card">
                <div className="admin-card__header">
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="admin-search-input"
                    />
                </div>

                {loading ? (
                    <p className="admin-state-loading">Loading users list...</p>
                ) : filteredUsers.length === 0 ? (
                    <p className="admin-state-empty">No users found.</p>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr className="element-tr">
                                    <th className="element-th">User</th>
                                    <th className="element-th">Email</th>
                                    <th className="element-th">Role</th>
                                    <th className="element-th">Status</th>
                                    <th className="element-th">Joined Date</th>
                                    <th className="element-th">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user._id}>
                                        <td className="element-td">
                                            <div className="admin-user-cell">
                                                <div className={`admin-user-avatar ${user.role === "admin" ? "admin" : ""}`}>
                                                    {user.name?.charAt(0).toUpperCase() || "U"}
                                                </div>
                                                <strong className="element-strong">{user.name}</strong>
                                            </div>
                                        </td>
                                        <td className="element-td">{user.email}</td>
                                        <td className="element-td">
                                            <span className={`badge ${user.role === "admin" ? "badge--admin" : "badge--customer"}`}>
                                                {user.role === "admin" ? "Admin" : "Customer"}
                                            </span>
                                        </td>
                                        <td className="element-td">
                                            <span className={`badge ${user.status === "inactive" ? "badge--cancelled" : "badge--stock-ok"}`}>
                                                {user.status === "inactive" ? "Inactive" : "Active"}
                                            </span>
                                        </td>
                                        <td className="element-td">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</td>
                                        <td className="actions-cell">
                                            <button className="edit-btn" onClick={() => openEdit(user)}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg> Edit</button>
                                            <button className="delete-btn" onClick={() => handleDelete(user._id)}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete</button>
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
                    <div className="admin-modal admin-modal--sm">
                        <div className="admin-modal__header">
                            <h3 className="element-h3">Edit User</h3>
                            <button className="close-btn" onClick={() => setModalOpen(false)}>&times;</button>
                        </div>
                        <form noValidate className="admin-form" onSubmit={handleUpdate}>
                            <div className="form-group">
                                <label className="element-label">Name</label>
                                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="element-label">Phone</label>
                                <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="element-label">Address</label>
                                <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="element-label">Role</label>
                                    <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                                        <option value="customer">Customer</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="element-label">Status</label>
                                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-cancel" onClick={() => setModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-submit">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
