import React, { useState } from "react";

function AuthModal({ mode, onClose, onAuthSuccess }) {
  const isLogin = mode === "login";
  const title = isLogin ? "Login" : "Register";
  const subtitle = isLogin
    ? "Access your guardian or tutor dashboard."
    : "Create your EduConnect account in minutes.";

  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

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
            {!isLogin && (
              <label className="form-group checkbox-group">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  required
                />
                <span>I agree to the Terms & Conditions</span>
              </label>
            )}

          </label>
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
    </div>
  );
}

export default AuthModal;
