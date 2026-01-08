import { useEffect, useState } from "react";
import { getDashboard } from "../api/auth";
import { getAllTasks } from "../api/tasks";
import { getAllUsers } from "../api/users";
import { getRecentActivity } from "../api/activity";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../App.css";

function Dashboard() {
  const [stats, setStats] = useState({
    totalTasks: 0,
    pending: 0,
    completed: 0,
    usersCount: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "{}"));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Parallel data fetching
        const [tasksRes, activityRes] = await Promise.all([
          getAllTasks().catch(e => ({ data: [] })),
          getRecentActivity(5).catch(e => ({ data: [] }))
        ]);

        const tasks = tasksRes.data || [];

        let usersCount = 0;
        if (user.role === 'admin') {
          try {
            const usersRes = await getAllUsers();
            usersCount = usersRes.data.length;
          } catch (e) { console.error("Failed to fetch users count"); }
        }

        setStats({
          totalTasks: tasks.length,
          pending: tasks.filter(t => t.status === 'pending').length,
          completed: tasks.filter(t => t.status === 'completed').length,
          usersCount
        });

        setRecentActivity(activityRes.data || []);

      } catch (error) {
        console.error("Dashboard data load error:", error);
        if (error.response?.status === 401) {
          navigate("/login");
        }
      }
    };

    fetchData();
  }, [navigate, user.role]);

  const getRoleLabel = () => {
    switch (user.role) {
      case 'admin': return 'Administrator';
      case 'manager': return 'Team Manager';
      default: return 'Field Agent';
    }
  };

  return (
    <div style={{ minHeight: "100vh", position: "relative", paddingLeft: "340px", paddingRight: "2rem" }}>
      <Sidebar />

      {/* Top Bar */}
      <div style={{
        padding: "2rem 0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <h1 className="animate-fade-in" style={{ fontSize: "2rem", fontWeight: "700" }}>
            Command Center
          </h1>
          <p className="animate-fade-in" style={{ color: "var(--text-muted)", animationDelay: "0.1s" }}>
            Welcome back, {getRoleLabel()} {user.username}
          </p>
        </div>

        <div className="glass-panel animate-fade-in" style={{
          padding: "0.5rem 1rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          borderRadius: "100px"
        }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontWeight: "600", fontSize: "0.9rem" }}>{user.username}</p>
            <div style={{ fontSize: "0.75rem", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.25rem" }}>
              <span className="pulse-dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981" }}></span>
              Online
            </div>
          </div>
          <div className="glow-box" style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #ec4899)" }}></div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(12, 1fr)",
        gap: "2rem",
        paddingBottom: "2rem"
      }}>

        {/* Stats Section */}
        {user.role === 'admin' && (
          <div className="glass-panel animate-slide-up" style={{
            gridColumn: "span 3",
            padding: "2rem",
            display: "flex", flexDirection: "column", justifyContent: "space-between", height: "180px"
          }}>
            <div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontWeight: "600", letterSpacing: "1px" }}>TOTAL USERS</p>
              <h3 style={{ fontSize: "2.5rem", fontWeight: "700", marginTop: "0.5rem" }}>{stats.usersCount}</h3>
            </div>
            <span style={{ padding: "10px", background: "rgba(236, 72, 153, 0.1)", borderRadius: "12px", width: "fit-content", fontSize: "1.5rem" }}>👥</span>
          </div>
        )}

        <div className="glass-panel animate-slide-up" style={{
          gridColumn: user.role === 'admin' ? "span 3" : "span 4",
          padding: "2rem",
          animationDelay: "0.1s",
          display: "flex", flexDirection: "column", justifyContent: "space-between", height: "180px"
        }}>
          <div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontWeight: "600", letterSpacing: "1px" }}>{user.role === 'member' ? 'MY TASKS' : 'ACTIVE TASKS'}</p>
            <h3 style={{ fontSize: "2.5rem", fontWeight: "700", marginTop: "0.5rem" }}>{stats.totalTasks}</h3>
          </div>
          <span style={{ padding: "10px", background: "rgba(99, 102, 241, 0.1)", borderRadius: "12px", width: "fit-content", fontSize: "1.5rem" }}>📊</span>
        </div>

        <div className="glass-panel animate-slide-up" style={{
          gridColumn: user.role === 'admin' ? "span 3" : "span 4",
          padding: "2rem",
          animationDelay: "0.2s",
          display: "flex", flexDirection: "column", justifyContent: "space-between", height: "180px"
        }}>
          <div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontWeight: "600", letterSpacing: "1px" }}>PENDING</p>
            <h3 style={{ fontSize: "2.5rem", fontWeight: "700", marginTop: "0.5rem" }}>{stats.pending}</h3>
          </div>
          <span style={{ padding: "10px", background: "rgba(245, 158, 11, 0.1)", borderRadius: "12px", width: "fit-content", fontSize: "1.5rem" }}>⏳</span>
        </div>

        <div className="glass-panel animate-slide-up" style={{
          gridColumn: user.role === 'admin' ? "span 3" : "span 4",
          padding: "2rem",
          animationDelay: "0.3s",
          display: "flex", flexDirection: "column", justifyContent: "space-between", height: "180px"
        }}>
          <div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontWeight: "600", letterSpacing: "1px" }}>COMPLETED</p>
            <h3 style={{ fontSize: "2.5rem", fontWeight: "700", marginTop: "0.5rem" }}>{stats.completed}</h3>
          </div>
          <span style={{ padding: "10px", background: "rgba(16, 185, 129, 0.1)", borderRadius: "12px", width: "fit-content", fontSize: "1.5rem" }}>✅</span>
        </div>

        {/* Recent Activity */}
        <div className="glass-panel animate-slide-up" style={{
          gridColumn: "span 8",
          padding: "2rem",
          animationDelay: "0.4s",
          minHeight: "300px"
        }}>
          <h3 style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ color: "var(--accent)" }}>⚡</span> Live Activity Feed
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {recentActivity.length > 0 ? recentActivity.map((log) => (
              <div key={log._id} style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "1rem",
                background: "rgba(255,255,255,0.02)",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.05)"
              }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#6366f1" }}></div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: "500" }}>
                    <span style={{ color: "var(--primary)" }}>{log.username}</span> {log.action}
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )) : (
              <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No recent activity to report.</p>
            )}

            {['admin', 'manager'].includes(user.role) && (
              <button
                onClick={() => navigate('/activity')}
                style={{ background: "transparent", border: "none", color: "var(--primary)", marginTop: "1rem", cursor: "pointer", textAlign: "left" }}
              >
                View Full Audit Log &rarr;
              </button>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-panel animate-slide-up" style={{
          gridColumn: "span 4",
          padding: "2rem",
          animationDelay: "0.5s",
          background: "linear-gradient(180deg, rgba(99, 102, 241, 0.05), transparent)"
        }}>
          <h3 style={{ marginBottom: "1.5rem" }}>Quick Actions</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

            {(user.role === 'admin' || user.role === 'manager') && (
              <button className="btn-primary" onClick={() => navigate("/tasks")}>
                + Create New Task
              </button>
            )}

            {user.role === 'admin' && (
              <button style={{
                width: "100%",
                padding: "1rem",
                background: "rgba(236, 72, 153, 0.1)",
                border: "1px solid rgba(236, 72, 153, 0.3)",
                borderRadius: "16px",
                color: "#ec4899",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s"
              }}
                onClick={() => navigate("/users")}
              >
                Manage Users
              </button>
            )}

            <button style={{
              width: "100%",
              padding: "1rem",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid var(--border-glass)",
              borderRadius: "16px",
              color: "white",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s"
            }}
              onClick={() => navigate("/settings")}
            >
              System Settings
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
