import React from "react";
import eduConnectLogo from "../assets/educonnect-logo.png";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import MessageNotifications from "./MessageNotifications.jsx";

function Navbar({ onLoginClick, onRegisterClick, authUser, theme, onToggleTheme, currentRoute }) {
  const { language, setLanguage, t } = useLanguage();
  const isDark = theme === "dark";
  const themeLabel = isDark ? t("common.lightMode") : t("common.nightMode");
  const themeButtonLabel = isDark ? t("common.lightModeShort") : t("common.nightModeShort");
  const mobileThemeButtonLabel = isDark ? "Light" : "Dark";
  const nextLanguage = language === "en" ? "bn" : "en";
  const languageCode = language === "en" ? "EN" : "BN";
  const activeSection = currentRoute === "#home" || !currentRoute
    ? "#home"
    : currentRoute?.startsWith("#about")
      ? "#about"
      : currentRoute?.startsWith("#jobs")
        ? "#jobs"
        : currentRoute?.startsWith("#reviews")
          ? "#reviews"
          : currentRoute?.startsWith("#blog")
            ? "#blog"
            : currentRoute?.startsWith("#help")
              ? "#help"
              : null;

  const renderThemeButton = (className = "") => (
    <button
      className={`btn-theme ${isDark ? "btn-theme-light" : "btn-theme-dark"} ${language === "bn" ? "btn-theme-lang-bn" : "btn-theme-lang-en"} ${className}`.trim()}
      type="button"
      onClick={onToggleTheme}
      aria-label={`Switch to ${themeLabel}`}
    >
      <span className="btn-theme-track">
        <span className="btn-theme-thumb" aria-hidden="true">
          {isDark ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4.2" />
              <path d="M12 2.5v2.3M12 19.2v2.3M21.5 12h-2.3M4.8 12H2.5M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6M18.7 18.7l-1.6-1.6M6.9 6.9L5.3 5.3" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 3.2a8.9 8.9 0 1 0 6.3 15.1A9.8 9.8 0 0 1 14.5 3.2Z" />
              <path d="M16.8 6.4v1.2M16.8 10v1.2M14.4 8.8h1.2M18 8.8h1.2" />
            </svg>
          )}
        </span>
        <span className="btn-theme-text">{themeButtonLabel}</span>
        <span className="btn-theme-text-compact">{mobileThemeButtonLabel}</span>
      </span>
    </button>
  );

  const renderLanguageButton = (className = "") => (
    <button
      className={`language-icon-button ${className}`.trim()}
      type="button"
      onClick={() => setLanguage(nextLanguage)}
      aria-label={`${t("navbar.languageLabel")}: ${languageCode}`}
      title={`${t("navbar.languageLabel")}: ${languageCode}`}
    >
      <span className="language-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3a14.5 14.5 0 0 1 0 18" />
          <path d="M12 3a14.5 14.5 0 0 0 0 18" />
        </svg>
      </span>
      <span className="language-icon-code">{languageCode}</span>
    </button>
  );

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <div className="brand">
          <span className="brand-logo" aria-hidden="true">
            <img className="brand-logo-image" src={eduConnectLogo} alt="" />
          </span>
          <span className="brand-text">EduConnect</span>
        </div>

        {!authUser && (
          <div className="nav-links">
            <a className={`nav-link ${activeSection === "#home" ? "nav-link-active" : ""}`} href="#home">
              {t("navbar.home")}
            </a>
            <a className={`nav-link ${activeSection === "#about" ? "nav-link-active" : ""}`} href="#about">
              {t("navbar.about")}
            </a>
            <a className={`nav-link ${activeSection === "#jobs" ? "nav-link-active" : ""}`} href="#jobs">
              {t("navbar.jobs")}
            </a>
            <a className={`nav-link ${activeSection === "#reviews" ? "nav-link-active" : ""}`} href="#reviews">
              {t("navbar.reviews")}
            </a>
            <a className={`nav-link ${activeSection === "#blog" ? "nav-link-active" : ""}`} href="#blog">
              {t("navbar.blog")}
            </a>
            <a className={`nav-link ${activeSection === "#help" ? "nav-link-active" : ""}`} href="#help">
              {t("navbar.help")}
            </a>
          </div>
        )}

        {authUser ? (
          <div className="nav-top-shortcuts">
            {renderThemeButton("nav-theme-inline-auth")}
            <MessageNotifications authUser={authUser} />
            {renderLanguageButton("nav-language-inline-auth")}
          </div>
        ) : null}

        {!authUser ? (
          <div className="nav-actions">
            {renderThemeButton()}
            <button className="btn btn-ghost" type="button" onClick={onLoginClick}>
              {t("navbar.login")}
            </button>
            <button className="btn btn-primary" type="button" onClick={onRegisterClick}>
              {t("navbar.register")}
            </button>
            {renderLanguageButton()}
          </div>
        ) : null}
      </div>
    </nav>
  );
}

export default Navbar;
