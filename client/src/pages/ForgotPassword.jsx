import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/auth";
import Toast from "../components/Toast";
import "../App.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState(null); // { message, type }
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await forgotPassword(email);
      setToast({ message: res.data.message || "Reset link sent!", type: "success" });
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Failed to send link",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {toast && (
        <div className="toast-container">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      <div className="glass-panel animate-slide-up" style={{ padding: "3rem", width: "100%", maxWidth: "450px" }}>
        <div className="auth-header" style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "2rem" }}>Forgot Password?</h1>
          <p>Don't worry, it happens to the best of us.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
            <Link to="/login" style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
              ← Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
