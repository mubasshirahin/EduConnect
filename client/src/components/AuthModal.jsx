import React, { useState } from "react";
import TermsModal from "./TermsModal";
import { useLanguage } from "../i18n/LanguageContext.jsx";

function AuthModal({ mode, onClose, onAuthSuccess }) {
  const { t } = useLanguage();
  const isLogin = mode === "login";
  const title = isLogin ? t("auth.loginTitle") : t("auth.registerTitle");
  const subtitle = isLogin ? t("auth.loginSubtitle") : t("auth.registerSubtitle");

  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const roleLabel = isLogin ? t("auth.loginAs") : t("auth.registerAs");

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
            <input type="password" name="password" placeholder={t("auth.passwordPlaceholder")} required />
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
        </form>
      </div>
      <button className="auth-backdrop" type="button" onClick={onClose} aria-label={t("common.close")} />
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
    </div>
  );
}

export default AuthModal;
