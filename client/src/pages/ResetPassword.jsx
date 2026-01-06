import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../api/auth";
import Toast from "../components/Toast";
import "../App.css";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await resetPassword(token, password);

      setToast({ message: "Password reset successful! Redirecting...", type: "success" });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Reset failed",
        type: "error"
      });
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
          <h1>Reset Password</h1>
          <p>Enter your new password below.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Resetting..." : "Set New Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
