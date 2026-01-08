import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Toast from "../components/Toast";
import { getActivityLogs } from "../api/activity";
import "../App.css";

function ActivityLog() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchLogs();
    }, [page]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const res = await getActivityLogs({ limit: 20, skip: page * 20 });

            // If page 0, replace. If next page, append? No, let's just do simple pagination for now (replace)
            setLogs(res.data.logs);
            setHasMore(res.data.hasMore);
        } catch (error) {
            console.error("Error fetching logs:", error);
            setToast({ message: "Failed to load activity logs", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString("en-US", {
            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
        });
    };

    const getActionColor = (action, type) => {
        if (type === 'user') return '#ec4899'; // Pink for user actions
        if (action.includes('Delete')) return '#ef4444'; // Red for deletes
        if (action.includes('Create')) return '#10b981'; // Green for creates
        return '#6366f1'; // Default Indigo
    };

    return (
        <div style={{ minHeight: "100vh", position: "relative", paddingLeft: "340px", paddingRight: "2rem" }}>
            <Sidebar />

            {toast && (
                <div className="toast-container">
                    <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
                </div>
            )}

            <div style={{ paddingBottom: "2rem", maxWidth: "1600px", margin: "0 auto", paddingTop: "2rem" }}>
                <div className="glass-panel animate-slide-up" style={{
                    padding: "2rem",
                    marginBottom: "2rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "linear-gradient(90deg, rgba(99, 102, 241, 0.1), transparent)"
                }}>
                    <div>
                        <h1 className="neon-text" style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>System Audit Log</h1>
                        <p style={{ color: "var(--text-muted)" }}>Track all system events and user actions.</p>
                    </div>
                </div>

                <div className="glass-panel animate-slide-up" style={{ padding: "0", overflow: "hidden" }}>
                    <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <h3 style={{ fontSize: "1.2rem" }}>Event Stream</h3>
                    </div>

                    <div style={{ maxHeight: "calc(100vh - 300px)", overflowY: "auto" }}>
                        {loading && logs.length === 0 ? (
                            <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>Loading stream...</div>
                        ) : (
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead style={{ position: "sticky", top: 0, background: "rgba(10, 10, 20, 0.95)", backdropFilter: "blur(10px)", zIndex: 10 }}>
                                    <tr style={{ textAlign: "left" }}>
                                        <th style={{ padding: "1rem 1.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>TIMESTAMP</th>
                                        <th style={{ padding: "1rem 1.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>ACTOR</th>
                                        <th style={{ padding: "1rem 1.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>ACTION</th>
                                        <th style={{ padding: "1rem 1.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>TARGET</th>
                                        <th style={{ padding: "1rem 1.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>DETAILS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => (
                                        <tr key={log._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                            <td style={{ padding: "1rem 1.5rem", fontFamily: "monospace", color: "var(--text-muted)" }}>
                                                {formatDate(log.createdAt)}
                                            </td>
                                            <td style={{ padding: "1rem 1.5rem" }}>
                                                <div style={{ display: "flex", flexDirection: "column" }}>
                                                    <span style={{ fontWeight: "600" }}>{log.username}</span>
                                                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>{log.userRole}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: "1rem 1.5rem" }}>
                                                <span style={{
                                                    color: getActionColor(log.action, log.targetType),
                                                    fontWeight: "500"
                                                }}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td style={{ padding: "1rem 1.5rem" }}>
                                                <span style={{
                                                    background: "rgba(255,255,255,0.05)",
                                                    padding: "2px 8px",
                                                    borderRadius: "4px",
                                                    fontSize: "0.8rem",
                                                    fontFamily: "monospace"
                                                }}>
                                                    {log.targetType}:{log.targetId?.substring(0, 8)}...
                                                </span>
                                            </td>
                                            <td style={{ padding: "1rem 1.5rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                                                {JSON.stringify(log.details)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Pagination */}
                    <div style={{ padding: "1rem", display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)" }}>
                        <button
                            disabled={page === 0}
                            onClick={() => setPage(p => p - 1)}
                            className="btn-secondary"
                            style={{ opacity: page === 0 ? 0.3 : 1, cursor: page === 0 ? "not-allowed" : "pointer" }}
                        >
                            &larr; Newer
                        </button>
                        <span style={{ display: "flex", alignItems: "center", color: "var(--text-muted)" }}>Page {page + 1}</span>
                        <button
                            disabled={!hasMore}
                            onClick={() => setPage(p => p + 1)}
                            className="btn-secondary"
                            style={{ opacity: !hasMore ? 0.3 : 1, cursor: !hasMore ? "not-allowed" : "pointer" }}
                        >
                            Older &rarr;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ActivityLog;
