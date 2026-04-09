import React, { useState } from "react";
import TermsModal from "./TermsModal";
import { useLanguage } from "../i18n/LanguageContext.jsx";

function AuthModal({ mode, onClose, onAuthSuccess, onSwitchMode }) {
  const { t } = useLanguage();
  const isLogin = mode === "login";
  const title = isLogin ? t("auth.loginTitle") : t("auth.registerTitle");
  const subtitle = isLogin ? t("auth.loginSubtitle") : t("auth.registerSubtitle");

  const switchMode = () => {
    if (typeof onSwitchMode === "function") {
      onSwitchMode(isLogin ? "register" : "login");
    }
  };

  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const roleLabel = isLogin ? t("auth.loginAs") : t("auth.registerAs");

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus({ type: "", message: "" });
    setIsLoading(true);

    const formData = new FormData(form);
    const payload = {
      email: formData.get("email")?.toString().trim().toLowerCase(),
      password: formData.get("password")?.toString(),
      role: formData.get("role")?.toString().trim().toLowerCase(),
    };

    if (!isLogin) {
      payload.name = formData.get("registerName")?.toString().trim();
    }

    try {
      const response = await fetch(`/api/auth/${isLogin ? "login" : "register"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get("content-type") || "";
      const raw = await response.text();
      const data = contentType.includes("application/json") && raw ? JSON.parse(raw) : raw ? { message: raw } : {};

      if (!response.ok) {
        throw new Error(data.message || t("auth.requestFailed"));
      }

      setStatus({
        type: "success",
        message: data.message || (isLogin ? t("auth.loginSuccess") : t("auth.registerSuccess")),
      });

      if (form) {
        form.reset();
      }
      if (data.user) {
        onAuthSuccess?.(data.user, data.token);
      }
    } catch (error) {
      setStatus({ type: "error", message: error.message || t("auth.somethingWentWrong") });
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
        body: JSON.stringify({ email: resetEmail.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t("auth.requestFailed"));
      }

      setStatus({ type: "success", message: t("auth.resetSent") });
      setResetEmail("");

      setTimeout(() => {
        setIsForgotPassword(false);
      }, 3000);
    } catch (error) {
      setStatus({ type: "error", message: error.message || t("auth.somethingWentWrong") });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setIsForgotPassword(false);
    setStatus({ type: "", message: "" });
  };

  if (isForgotPassword) {
    return (
      <div className="auth-overlay" role="dialog" aria-modal="true">
        <div className="auth-modal">
          <div className="auth-modal-header">
            <div>
              <h3>{t("auth.resetTitle")}</h3>
              <p>{t("auth.resetSubtitle")}</p>
            </div>
            <button className="auth-close" type="button" onClick={onClose} aria-label={t("common.close")}>
              ×
            </button>
          </div>
          <form className="auth-form" onSubmit={handleForgotPassword}>
            <label className="form-group">
              <span>{t("auth.emailAddress")}</span>
              <input type="email" value={resetEmail} onChange={(event) => setResetEmail(event.target.value)} placeholder="you@example.com" required />
            </label>
            {status.message && (
              <p className={`auth-status ${status.type === "error" ? "auth-status-error" : "auth-status-success"}`}>
                {status.message}
              </p>
            )}
            <button className="btn btn-primary" type="submit" disabled={isLoading}>
              {isLoading ? t("auth.sending") : t("auth.sendResetLink")}
            </button>
            <button type="button" className="btn btn-ghost" onClick={handleBackToLogin} style={{ marginTop: "0.5rem" }}>
              {t("auth.backToLogin")}
            </button>
          </form>
        </div>
        <button className="auth-backdrop" type="button" onClick={onClose} aria-label={t("common.close")} />
      </div>
    );
  }

  return (
    <div className="auth-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className="auth-modal">
        <div className="auth-modal-header">
          <div>
            <h3>{title}</h3>
            <p>{subtitle}</p>
          </div>
          <button className="auth-close" type="button" onClick={onClose} aria-label={t("common.close")}>
            ×
          </button>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <label className="form-group">
              <span>{t("auth.fullName")}</span>
              <input type="text" name="registerName" placeholder={t("auth.namePlaceholder")} required />
            </label>
          )}
          <label className="form-group">
            <span>{roleLabel}</span>
            <div className="role-group">
              {isLogin && (
                <label className="role-option">
                  <input type="radio" name="role" value="admin" required />
                  <span>{t("auth.admin")}</span>
                </label>
              )}
              <label className="role-option">
                <input type="radio" name="role" value="teacher" required />
                <span>{t("auth.teacher")}</span>
              </label>
              <label className="role-option">
                <input type="radio" name="role" value="student" required />
                <span>{t("auth.student")}</span>
              </label>
            </div>
          </label>
          <label className="form-group">
            <span>{t("auth.email")}</span>
            <input type="email" name="email" placeholder="you@example.com" required />
          </label>
          <label className="form-group">
            <span>{t("auth.password")}</span>
            <div className="password-input-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                placeholder={t("auth.passwordPlaceholder")} 
                required 
              />
              <button 
                type="button" 
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.06M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {isLogin && (
              <div style={{ textAlign: "right", marginTop: "0.5rem" }}>
                <span
                  onClick={() => setIsForgotPassword(true)}
                  style={{ color: "var(--accent)", textDecoration: "underline", cursor: "pointer", fontSize: "0.8rem" }}
                >
                  {t("auth.forgotPassword")}
                </span>
              </div>
            )}
          </label>
          {!isLogin && (
            <label className="form-group checkbox-group">
              <input type="checkbox" checked={agreeToTerms} onChange={(event) => setAgreeToTerms(event.target.checked)} required />
              <span>
                {t("auth.agreePrefix")}{" "}
                <span
                  onClick={() => setShowTerms(true)}
                  style={{ color: "var(--accent)", textDecoration: "underline", cursor: "pointer" }}
                >
                  {t("auth.termsAndConditions")}
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
            {isLoading ? t("auth.pleaseWait") : title}
          </button>
          <p style={{ marginTop: "1rem", fontSize: "0.9rem", textAlign: "center", color: "var(--text-soft)" }}>
            {isLogin ? (
              <>Don&apos;t have an account? <span onClick={switchMode} style={{ color: "var(--accent)", cursor: "pointer", textDecoration: "underline" }}>Sign up</span></>
            ) : (
              <>Already have an account? <span onClick={switchMode} style={{ color: "var(--accent)", cursor: "pointer", textDecoration: "underline" }}>Log in</span></>
            )}
          </p>
        </form>
      </div>
      <button className="auth-backdrop" type="button" onClick={onClose} aria-label={t("common.close")} />
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
    </div>
  );
}

export default AuthModal;
