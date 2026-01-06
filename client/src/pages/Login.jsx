import { Link, useNavigate } from "react-router-dom";
import oliveTrees from "../assets/olive-trees.jpg";
import { useState } from "react";
import { login } from "../api/auth";
import Toast from "../components/Toast";
import "../App.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login({ email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setToast({ message: "Login successful! Redirecting...", type: "success" });
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Login failed. Please check your credentials.",
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

      <div className="glass-panel auth-container">
        {/* Left Side - Form */}
        <div className="auth-left">
          <div className="auth-header">
            <h1>Welcome Back</h1>
            <p>Enter your credentials to access your account</p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-actions">
              <div className="remember-me">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Remember me</label>
              </div>
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <p style={{ marginTop: "1.5rem", textAlign: "center", color: "var(--text-muted)" }}>
              Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
          </form>
        </div>

        {/* Right Side - Visual */}
        <div className="auth-right">
          <img
            src={oliveTrees}
            alt="The Olive Trees by Van Gogh"
            className="auth-image"
          />
        </div>
      </div>
    </div>
  );
}

export default Login;
