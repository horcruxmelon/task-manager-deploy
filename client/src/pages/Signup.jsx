import { Link, useNavigate } from "react-router-dom";
import oliveTrees from "../assets/olive-trees.jpg";
import { useState } from "react";
import { signup } from "../api/auth";
import Toast from "../components/Toast";
import "../App.css";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signup({ username, email, password });

      setToast({ message: "Account created successfully! Redirecting to login...", type: "success" });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error(err);
      setToast({
        message: err.response?.data?.message || "Signup failed. Please try again.",
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
            <h1>Create Account</h1>
            <p>Start your journey with us today</p>
          </div>

          <form className="signup-form" onSubmit={handleSignup}>
            <div className="input-group">
              <label>Username</label>
              <input
                type="text"
                placeholder="johndoe"
                value={username}
                required
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "1rem" }}>
              {loading ? "Creating account..." : "Create Account"}
            </button>

            <p style={{ marginTop: "1.5rem", textAlign: "center", color: "var(--text-muted)" }}>
              Already have an account? <Link to="/login">Log in</Link>
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

export default Signup;
