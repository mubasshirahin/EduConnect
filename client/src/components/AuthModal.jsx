import React, { useState } from "react";
import TermsModal from "./TermsModal";

function AuthModal({ mode, onClose, onAuthSuccess }) {
  const isLogin = mode === "login";
  const title = isLogin ? "Login" : "Register";
  const subtitle = isLogin
    ? "Access your guardian or tutor dashboard."
    : "Create your EduConnect account in minutes.";

  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus({ type: "", message: "" });
    setIsLoading(true);

    const formData = new FormData(form);
    const payload = {
      email: formData.get("email"),
      password: formData.get("password"),
      role: formData.get("role"),
    };

    if (!isLogin) {
      payload.name = formData.get("registerName");
    }

    try {
      const response = await fetch(`/api/auth/${isLogin ? "login" : "register"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get("content-type") || "";
      const raw = await response.text();
      const data =
        contentType.includes("application/json") && raw
          ? JSON.parse(raw)
          : raw
            ? { message: raw }
            : {};
      if (!response.ok) {
        throw new Error(data.message || "Request failed.");
      }

      setStatus({ type: "success", message: data.message || `${title} successful.` });
      if (form) {
        form.reset();
      }
      if (data.user) {
        onAuthSuccess?.(data.user, data.token);
      }
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Something went wrong." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed.");
      }

      setStatus({ type: "success", message: "Password reset link sent to your email!" });
      setResetEmail("");
      
      setTimeout(() => {
        setIsForgotPassword(false);
      }, 3000);
      
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Something went wrong." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setIsForgotPassword(false);
    setStatus({ type: "", message: "" });
  };

  // Forgot Password View
  if (isForgotPassword) {
    return (
      <div className="auth-overlay" role="dialog" aria-modal="true">
        <div className="auth-modal">
          <div className="auth-modal-header">
            <div>
              <h3>Reset Password</h3>
              <p>Enter your email to receive a reset link</p>
            </div>
            <button className="auth-close" type="button" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
          <form className="auth-form" onSubmit={handleForgotPassword}>
            <label className="form-group">
              <span>Email Address</span>
              <input 
                type="email" 
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="you@example.com" 
                required 
              />
            </label>
            {status.message && (
              <p className={`auth-status ${status.type === "error" ? "auth-status-error" : "auth-status-success"}`}>
                {status.message}
              </p>
            )}
            <button className="btn btn-primary" type="submit" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>
            <button 
              type="button" 
              className="btn btn-ghost" 
              onClick={handleBackToLogin}
              style={{ marginTop: '0.5rem' }}
            >
              Back to Login
            </button>
          </form>
        </div>
        <button className="auth-backdrop" type="button" onClick={onClose} aria-label="Close" />
      </div>
    );
  }

  // Main Login/Register View
  return (
    <div className="auth-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className="auth-modal">
        <div className="auth-modal-header">
          <div>
            <h3>{title}</h3>
            <p>{subtitle}</p>
          </div>
          <button className="auth-close" type="button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <label className="form-group">
              <span>Full Name</span>
              <input type="text" name="registerName" placeholder="Jane Doe" required />
            </label>
          )}
          <label className="form-group">
            <span>{isLogin ? "Login As" : "Register As"}</span>
            <div className="role-group">
              <label className="role-option">
                <input type="radio" name="role" value="teacher" required />
                <span>Teacher</span>
              </label>
              <label className="role-option">
                <input type="radio" name="role" value="student" required />
                <span>Student</span>
              </label>
              {isLogin && (
                <label className="role-option">
                  <input type="radio" name="role" value="admin" required />
                  <span>Admin</span>
                </label>
              )}
            </div>
          </label>
          <label className="form-group">
            <span>Email</span>
            <input type="email" name="email" placeholder="you@example.com" required />
          </label>
          <label className="form-group">
            <span>Password</span>
            <input type="password" name="password" placeholder="Enter your password" required />
            {isLogin && (
              <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                <span 
                  onClick={() => setIsForgotPassword(true)} 
                  style={{ color: 'var(--accent)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  Forgot Password?
                </span>
              </div>
            )}
          </label>
          {!isLogin && (
            <label className="form-group checkbox-group">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                required
              />
              <span>
                I agree to the 
                <span 
                  onClick={() => setShowTerms(true)} 
                  style={{ color: 'var(--accent)', textDecoration: 'underline', cursor: 'pointer', marginLeft: '4px' }}
                >
                  Terms & Conditions
                </span>
              </span>
            </label>
          )}
          {status.message && (
            <p className={`auth-status ${status.type === "error" ? "auth-status-error" : "auth-status-success"}`}>
              {status.message}
            </p>
          )}
          <button className="btn btn-primary" type="submit" disabled={isLoading}>
            {isLoading ? "Please wait..." : title}
          </button>
        </form>
      </div>
      <button className="auth-backdrop" type="button" onClick={onClose} aria-label="Close" />
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
    </div>
  );
}

export default AuthModal;