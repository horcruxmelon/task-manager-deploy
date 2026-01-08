import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Toast from "../components/Toast";
import { getAllTasks, createTask, updateTask, deleteTask, addComment } from "../api/tasks";
import { getAllUsers } from "../api/users";
import "../App.css";

function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]); // For assignment dropdown
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState({ username: "User", role: "member" });
    const [showModal, setShowModal] = useState(false);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [currentTaskForComments, setCurrentTaskForComments] = useState(null);
    const [newComment, setNewComment] = useState("");

    const [editingTask, setEditingTask] = useState(null);
    const [toast, setToast] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        status: "pending",
        dueDate: "",
        assignedTo: ""
    });
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            // Fetch users only if admin/manager
            if (['admin', 'manager'].includes(parsedUser.role)) {
                fetchUsers();
            }
        }
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await getAllTasks();
            setTasks(res.data);
        } catch (error) {
            console.error("Error fetching tasks:", error);
            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                navigate("/login");
            } else {
                setToast({ message: "Failed to load tasks", type: "error" });
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await getAllUsers();
            setUsers(res.data);
        } catch (error) {
            console.error("Error fetching users for assignment:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            if (payload.assignedTo === "") payload.assignedTo = null; // Handle unassignment

            if (editingTask) {
                await updateTask(editingTask._id, payload);
                setToast({ message: "Task updated successfully!", type: "success" });
            } else {
                await createTask(payload);
                setToast({ message: "Task created successfully!", type: "success" });
            }
            setShowModal(false);
            setEditingTask(null);
            setFormData({ title: "", description: "", status: "pending", dueDate: "", assignedTo: "" });
            fetchTasks();
        } catch (error) {
            console.error("Error saving task:", error);
            setToast({
                message: error.response?.data?.message || "Failed to save task",
                type: "error"
            });
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            await addComment(currentTaskForComments._id, newComment);
            setToast({ message: "Comment added", type: "success" });
            setNewComment("");
            fetchTasks(); // Refresh to see new comment
            // Optionally update local state to avoid full refresh, but this is safer
            setShowCommentModal(false);
        } catch (error) {
            setToast({ message: "Failed to add comment", type: "error" });
        }
    };

    const handleEdit = (task) => {
        setEditingTask(task);
        setFormData({
            title: task.title,
            description: task.description || "",
            status: task.status,
            dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
            assignedTo: task.assignedTo?._id || "" // Handle populated user object
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            try {
                await deleteTask(id);
                setToast({ message: "Task deleted successfully!", type: "success" });
                fetchTasks();
            } catch (error) {
                console.error("Error deleting task:", error);
                setToast({ message: "Failed to delete task", type: "error" });
            }
        }
    };

    const handleStatusChange = async (task, newStatus) => {
        try {
            await updateTask(task._id, { ...task, status: newStatus });
            fetchTasks(); // Refresh to ensure backend validation didn't reject it
        } catch (error) {
            console.error("Error updating status:", error);
            setToast({ message: "Failed to update status", type: "error" });
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case "completed": return { color: "#10b981", bg: "rgba(16, 185, 129, 0.1)", label: "Completed" };
            case "in-progress": return { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)", label: "In Progress" };
            default: return { color: "#6366f1", bg: "rgba(99, 102, 241, 0.1)", label: "Pending" };
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric"
        });
    };

    const canCreate = ['admin', 'manager'].includes(user.role);
    const canDelete = ['admin', 'manager'].includes(user.role);

    return (
        <div style={{ minHeight: "100vh", position: "relative", paddingLeft: "340px", paddingRight: "2rem" }}>
            <Sidebar />

            {toast && (
                <div className="toast-container">
                    <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
                </div>
            )}

            {/* Content Container */}
            <div style={{ paddingBottom: "2rem", maxWidth: "1600px", margin: "0 auto", paddingTop: "2rem" }}>

                {/* Header Section */}
                <div className="glass-panel animate-slide-up" style={{
                    padding: "2rem",
                    marginBottom: "2rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "linear-gradient(90deg, rgba(99, 102, 241, 0.1), transparent)"
                }}>
                    <div>
                        <h1 className="neon-text" style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>Task Board</h1>
                        <p style={{ color: "var(--text-muted)" }}>
                            Manage and track your assignments. {tasks.length} {user.role === 'member' ? 'assigned' : 'total'} tasks.
                        </p>
                    </div>
                    {canCreate && (
                        <button
                            onClick={() => {
                                setEditingTask(null);
                                setFormData({ title: "", description: "", status: "pending", dueDate: "", assignedTo: "" });
                                setShowModal(true);
                            }}
                            className="btn-primary"
                            style={{ width: "auto", padding: "0.85rem 2rem", fontSize: "1.1rem" }}
                        >
                            + Create New Task
                        </button>
                    )}
                </div>

                {/* Tasks Grid */}
                {loading ? (
                    <div className="glass-panel" style={{ padding: "4rem", textAlign: "center" }}>
                        <div style={{ fontSize: "3rem", animation: "spin 2s linear infinite", display: "inline-block" }}>💫</div>
                        <p style={{ marginTop: "1rem", color: "var(--text-muted)" }}>Initializing data streams...</p>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="glass-panel animate-slide-up" style={{ padding: "4rem", textAlign: "center" }}>
                        <p style={{ fontSize: "4rem", marginBottom: "1rem", filter: "drop-shadow(0 0 20px rgba(255,255,255,0.2))" }}>📝</p>
                        <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>No Tasks Found</h2>
                        <p style={{ color: "var(--text-muted)" }}>Your dashboard is clean.</p>
                    </div>
                ) : (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                        gap: "1.5rem"
                    }}>
                        {tasks.map((task, index) => {
                            const statusInfo = getStatusInfo(task.status);
                            return (
                                <div
                                    key={task._id}
                                    className="glass-panel animate-slide-up"
                                    style={{
                                        padding: "1.5rem",
                                        animationDelay: `${index * 0.05}s`,
                                        borderTop: `4px solid ${statusInfo.color}`,
                                        display: "flex", flexDirection: "column", height: "100%"
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                                        <div className="badge" style={{ background: statusInfo.bg, color: statusInfo.color }}>
                                            {statusInfo.label}
                                        </div>
                                        {task.dueDate && (
                                            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                                📅 {formatDate(task.dueDate)}
                                            </span>
                                        )}
                                    </div>

                                    <h3 style={{
                                        fontSize: "1.25rem", marginBottom: "0.75rem",
                                        textDecoration: task.status === "completed" ? "line-through" : "none",
                                        opacity: task.status === "completed" ? 0.6 : 1,
                                        fontWeight: "600", lineHeight: "1.4"
                                    }}>
                                        {task.title}
                                    </h3>

                                    {task.description && (
                                        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "1rem", lineHeight: "1.6" }}>
                                            {task.description}
                                        </p>
                                    )}

                                    {/* Assignment Info */}
                                    <div style={{ marginBottom: "1rem", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                                        {task.assignedTo ? (
                                            <div style={{ color: "var(--primary)" }}>
                                                👤 Assigned to: <strong>{task.assignedTo.username}</strong>
                                            </div>
                                        ) : (
                                            <div style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                                                👤 Unassigned
                                            </div>
                                        )}
                                        {task.assignedBy && (
                                            <div style={{ color: "var(--text-muted)" }}>
                                                ✍️ Assigned by: {task.assignedBy.username}
                                            </div>
                                        )}
                                    </div>

                                    {/* Comments Preview */}
                                    {task.comments && task.comments.length > 0 && (
                                        <div style={{
                                            background: "rgba(0,0,0,0.2)",
                                            padding: "0.5rem",
                                            borderRadius: "8px",
                                            marginBottom: "1rem",
                                            fontSize: "0.85rem"
                                        }}>
                                            <p style={{ color: "var(--text-muted)", marginBottom: "4px" }}>💬 Latest Comment:</p>
                                            <p><strong>{task.comments[task.comments.length - 1].username}:</strong> {task.comments[task.comments.length - 1].text}</p>
                                        </div>
                                    )}

                                    <div style={{ marginTop: "auto", borderTop: "1px solid var(--border-glass)", paddingTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div style={{ display: "flex", gap: "0.5rem" }}>
                                            {/* Status Toggles - Available to everyone assigned */}
                                            <button onClick={() => handleStatusChange(task, "pending")} title="Mark Pending" style={{ width: "24px", height: "24px", borderRadius: "50%", border: "2px solid #6366f1", background: "transparent", cursor: "pointer", opacity: 0.5 }} />
                                            <button onClick={() => handleStatusChange(task, "in-progress")} title="Mark In Progress" style={{ width: "24px", height: "24px", borderRadius: "50%", border: "2px solid #f59e0b", background: "transparent", cursor: "pointer", opacity: 0.5 }} />
                                            <button onClick={() => handleStatusChange(task, "completed")} title="Mark Completed" style={{ width: "24px", height: "24px", borderRadius: "50%", border: "2px solid #10b981", background: "transparent", cursor: "pointer", opacity: 0.5 }} />
                                        </div>

                                        <div style={{ display: "flex", gap: "0.5rem" }}>
                                            <button
                                                onClick={() => {
                                                    setCurrentTaskForComments(task);
                                                    setShowCommentModal(true);
                                                }}
                                                className="glass-panel"
                                                title="Add Comments"
                                                style={{ padding: "0.5rem", borderRadius: "10px", color: "var(--text-light)", cursor: "pointer", border: "1px solid var(--border-glass)", display: "flex", alignItems: "center", justifyContent: "center" }}
                                            >
                                                💬
                                            </button>

                                            {/* Edit Button - Manager/Admin can always edit. Members only if allowed (currently not allowed fully) */}
                                            {canCreate && (
                                                <button
                                                    onClick={() => handleEdit(task)}
                                                    className="glass-panel"
                                                    title="Edit Task"
                                                    style={{ padding: "0.5rem", borderRadius: "10px", color: "#6366f1", cursor: "pointer", border: "1px solid rgba(99, 102, 241, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}
                                                >
                                                    ✏️
                                                </button>
                                            )}

                                            {canDelete && (
                                                <button
                                                    onClick={() => handleDelete(task._id)}
                                                    className="glass-panel"
                                                    title="Delete Task"
                                                    style={{ padding: "0.5rem", borderRadius: "10px", color: "#ef4444", cursor: "pointer", border: "1px solid rgba(239, 68, 68, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}
                                                >
                                                    🗑️
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Task Create/Edit Modal */}
            {showModal && (
                <div style={{
                    position: "fixed", inset: 0, background: "rgba(3, 7, 18, 0.8)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
                    backdropFilter: "blur(8px)"
                }}>
                    <div className="glass-panel animate-slide-up" style={{ padding: "2.5rem", width: "100%", maxWidth: "550px" }}>
                        <h2 className="neon-text" style={{ marginBottom: "2rem", fontSize: "1.8rem" }}>
                            {editingTask ? "Edit Mission" : "New Mission Protocol"}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <input type="text" id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required placeholder=" " />
                                <label htmlFor="title">Task Title</label>
                            </div>
                            <div className="input-group">
                                <input type="text" id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder=" " />
                                <label htmlFor="description">Description</label>
                            </div>
                            <div className="input-group">
                                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                                    <option value="pending">Pending</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} style={{ colorScheme: "dark" }} />
                            </div>

                            {/* Assignment Dropdown - Only for Admin/Manager */}
                            {['admin', 'manager'].includes(user.role) && (
                                <div className="input-group">
                                    <select value={formData.assignedTo} onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}>
                                        <option value="">-- Unassigned --</option>
                                        {users.map(u => (
                                            <option key={u._id} value={u._id}>{u.username} ({u.role})</option>
                                        ))}
                                    </select>
                                    <label style={{ top: "-10px", fontSize: "0.8rem", color: "var(--primary)" }}>Assign Agent</label>
                                </div>
                            )}

                            <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "1rem", borderRadius: "16px", background: "transparent", border: "1px solid var(--border-glass)", color: "var(--text-muted)", cursor: "pointer" }}>Cancel</button>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>{editingTask ? "Update Data" : "Initiate"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Comment Modal */}
            {showCommentModal && currentTaskForComments && (
                <div style={{
                    position: "fixed", inset: 0, background: "rgba(3, 7, 18, 0.8)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
                    backdropFilter: "blur(8px)"
                }}>
                    <div className="glass-panel animate-slide-up" style={{ padding: "2rem", width: "100%", maxWidth: "500px", maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
                        <h3 style={{ marginBottom: "1rem" }}>Mission Logs: {currentTaskForComments.title}</h3>

                        <div style={{ flex: 1, overflowY: "auto", marginBottom: "1rem", paddingRight: "10px" }}>
                            {currentTaskForComments.comments && currentTaskForComments.comments.length > 0 ? (
                                currentTaskForComments.comments.map((comment, idx) => (
                                    <div key={idx} style={{ marginBottom: "1rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                                            <span style={{ color: "var(--primary)" }}>{comment.username}</span>
                                            <span>{new Date(comment.timestamp).toLocaleString()}</span>
                                        </div>
                                        <div>{comment.text}</div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No logs recorded yet.</p>
                            )}
                        </div>

                        <form onSubmit={handleCommentSubmit} style={{ marginTop: "auto" }}>
                            <div className="input-group">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Add a status update or note..."
                                    style={{
                                        width: "100%", background: "transparent", border: "1px solid var(--border-glass)",
                                        color: "white", padding: "1rem", borderRadius: "12px", minHeight: "80px", resize: "vertical"
                                    }}
                                ></textarea>
                            </div>
                            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                                <button type="button" onClick={() => setShowCommentModal(false)} style={{ flex: 1, padding: "0.8rem", borderRadius: "12px", background: "transparent", border: "1px solid var(--border-glass)", color: "var(--text-muted)", cursor: "pointer" }}>Close</button>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Add Log</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Tasks;
