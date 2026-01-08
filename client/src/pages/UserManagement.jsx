import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Toast from "../components/Toast";
import { getAllUsers, createUser, updateUserRole, deleteUser } from "../api/users";
import "../App.css";

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [toast, setToast] = useState(null);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        role: "member"
    });
    const [currentUser] = useState(JSON.parse(localStorage.getItem("user") || "{}"));

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await getAllUsers();
            setUsers(res.data);
        } catch (error) {
            console.error("Error fetching users:", error);
            setToast({ message: "Failed to load users", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createUser(formData);
            setToast({ message: "User created successfully!", type: "success" });
            setShowModal(false);
            setFormData({ username: "", email: "", password: "", role: "member" });
            fetchUsers();
        } catch (error) {
            setToast({
                message: error.response?.data?.message || "Failed to create user",
                type: "error"
            });
        }
    };

    const handleRoleUpdate = async (userId, newRole) => {
        try {
            await updateUserRole(userId, newRole);
            setToast({ message: "Role updated successfully!", type: "success" });
            fetchUsers();
        } catch (error) {
            setToast({ message: "Failed to update role", type: "error" });
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm("Are you sure you want to delete this user? This cannot be undone.")) {
            try {
                await deleteUser(userId);
                setToast({ message: "User deleted successfully!", type: "success" });
                fetchUsers();
            } catch (error) {
                setToast({
                    message: error.response?.data?.message || "Failed to delete user",
                    type: "error"
                });
            }
        }
    };

    // Styling helpers
    const getRoleBadge = (role) => {
        const styles = {
            admin: { bg: "rgba(236, 72, 153, 0.2)", color: "#ec4899", border: "#ec4899" },
            manager: { bg: "rgba(99, 102, 241, 0.2)", color: "#6366f1", border: "#6366f1" },
            member: { bg: "rgba(16, 185, 129, 0.2)", color: "#10b981", border: "#10b981" }
        };
        const style = styles[role] || styles.member;

        return (
            <span style={{
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "0.8rem",
                fontWeight: "600",
                background: style.bg,
                color: style.color,
                border: `1px solid ${style.border}`,
                textTransform: "capitalize"
            }}>
                {role}
            </span>
        );
    };

    return (
        <div style={{ minHeight: "100vh", position: "relative", paddingLeft: "340px", paddingRight: "2rem" }}>
            <Sidebar />

            {toast && (
                <div className="toast-container">
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                </div>
            )}

            <div style={{ paddingBottom: "2rem", maxWidth: "1600px", margin: "0 auto", paddingTop: "2rem" }}>
                {/* Header */}
                <div className="glass-panel animate-slide-up" style={{
                    padding: "2rem",
                    marginBottom: "2rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "linear-gradient(90deg, rgba(236, 72, 153, 0.1), transparent)"
                }}>
                    <div>
                        <h1 className="neon-text" style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>Personnel Database</h1>
                        <p style={{ color: "var(--text-muted)" }}>Manage system access and roles.</p>
                    </div>
                    <button onClick={() => setShowModal(true)} className="btn-primary">
                        + Add New Agent
                    </button>
                </div>

                {/* Users List */}
                <div className="glass-panel animate-slide-up" style={{ padding: "0", overflow: "hidden" }}>
                    <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <h3 style={{ fontSize: "1.2rem" }}>Registered Users ({users.length})</h3>
                    </div>

                    {loading ? (
                        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>Loading personnel records...</div>
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "rgba(255,255,255,0.02)", textAlign: "left" }}>
                                    <th style={{ padding: "1rem 1.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>AGENT</th>
                                    <th style={{ padding: "1rem 1.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>CONTACT</th>
                                    <th style={{ padding: "1rem 1.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>CLEARANCE LEVEL</th>
                                    <th style={{ padding: "1rem 1.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                        <td style={{ padding: "1rem 1.5rem", fontWeight: "600" }}>{user.username}</td>
                                        <td style={{ padding: "1rem 1.5rem", color: "var(--text-muted)" }}>{user.email}</td>
                                        <td style={{ padding: "1rem 1.5rem" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                                {getRoleBadge(user.role)}
                                                {currentUser.id !== user._id && (
                                                    <select
                                                        value={user.role}
                                                        onChange={(e) => handleRoleUpdate(user._id, e.target.value)}
                                                        style={{
                                                            background: "rgba(0,0,0,0.3)",
                                                            border: "1px solid var(--border-glass)",
                                                            color: "var(--text-light)",
                                                            borderRadius: "6px",
                                                            padding: "4px 8px",
                                                            fontSize: "0.85rem",
                                                            outline: "none"
                                                        }}
                                                    >
                                                        <option value="member">Member</option>
                                                        <option value="manager">Manager</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: "1rem 1.5rem" }}>
                                            {currentUser.id !== user._id && (
                                                <button
                                                    onClick={() => handleDelete(user._id)}
                                                    style={{
                                                        background: "transparent",
                                                        border: "none",
                                                        color: "#ef4444",
                                                        cursor: "pointer",
                                                        padding: "4px 8px",
                                                        opacity: 0.7,
                                                        transition: "opacity 0.2s"
                                                    }}
                                                    onMouseOver={(e) => e.target.style.opacity = 1}
                                                    onMouseOut={(e) => e.target.style.opacity = 0.7}
                                                    title="Delete User"
                                                >
                                                    ❌ Remove
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Create Modal */}
                {showModal && (
                    <div style={{
                        position: "fixed", inset: 0, background: "rgba(3, 7, 18, 0.8)",
                        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
                        backdropFilter: "blur(8px)"
                    }}>
                        <div className="glass-panel animate-slide-up" style={{ padding: "2.5rem", width: "100%", maxWidth: "500px" }}>
                            <h2 className="neon-text" style={{ marginBottom: "2rem" }}>Recruit New Agent</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        placeholder=" "
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        required
                                    />
                                    <label>Agent Codename (Username)</label>
                                </div>
                                <div className="input-group">
                                    <input
                                        type="email"
                                        placeholder=" "
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                    <label>Comms Channel (Email)</label>
                                </div>
                                <div className="input-group">
                                    <input
                                        type="password"
                                        placeholder=" "
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                    <label>Access Key (Password)</label>
                                </div>
                                <div className="input-group">
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="member">Member</option>
                                        <option value="manager">Manager</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <label style={{ top: "-10px", fontSize: "0.8rem", color: "var(--primary)" }}>Clearance Level</label>
                                </div>

                                <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        style={{
                                            flex: 1, padding: "1rem", borderRadius: "12px",
                                            background: "rgba(255,255,255,0.05)", border: "none", color: "var(--text-muted)", cursor: "pointer"
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                                        Confirm Recruitment
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserManagement;
