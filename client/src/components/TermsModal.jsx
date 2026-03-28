import React from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

function TermsModal({ onClose }) {
  const { t } = useLanguage();
  const sections = t("terms.sections");

  return (
    <div className="auth-overlay" role="dialog" aria-modal="true">
      <div className="auth-modal" style={{ maxWidth: "600px" }}>
        <div className="auth-modal-header">
          <div>
            <h3>{t("terms.title")}</h3>
            <p>{t("terms.subtitle")}</p>
          </div>
          <button className="auth-close" type="button" onClick={onClose} aria-label={t("common.close")}>
            ×
          </button>
        </div>
        <div style={{ maxHeight: "400px", overflowY: "auto", padding: "0.5rem 0" }}>
          <div style={{ display: "grid", gap: "1rem", color: "var(--text-soft)" }}>
            {sections.map((section) => (
              <div key={section.title}>
                <h4>{section.title}</h4>
                <p>{section.body}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <button className="btn btn-primary" onClick={onClose}>
            {t("terms.understand")}
          </button>
        </div>
      </div>
      <button className="auth-backdrop" type="button" onClick={onClose} aria-label={t("common.close")} />
    </div>
  );
}

export default TermsModal;
