import React, { useEffect, useState } from "react";
import eduConnectLogo from "../assets/educonnect-logo.png";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import MessageNotifications from "./MessageNotifications.jsx";

function Navbar({ onLoginClick, onRegisterClick, authUser, theme, onToggleTheme, currentRoute }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const isDark = theme === "dark";
  const themeLabel = isDark ? t("common.lightMode") : t("common.nightMode");
  const themeButtonLabel = isDark ? t("common.lightModeShort") : t("common.nightModeShort");
  const mobileThemeButtonLabel = isDark ? "Light" : "Dark";
  const nextLanguage = language === "en" ? "bn" : "en";
  const nextLanguageLabel = nextLanguage.toUpperCase();
  const shellToggleLabel = language === "bn" ? "নেভিগেশন মেনু খুলুন" : "Open navigation menu";
  const userRoleLabel = authUser?.role === "teacher"
    ? t("auth.teacher")
    : authUser?.role === "student"
      ? t("auth.student")
      : authUser?.role === "admin"
        ? "Admin"
        : "";
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
  const navItems = [
    { href: "#home", label: t("navbar.home"), isActive: activeSection === "#home" },
    { href: "#about", label: t("navbar.about"), isActive: activeSection === "#about" },
    { href: "#jobs", label: t("navbar.jobs"), isActive: activeSection === "#jobs" },
    { href: "#reviews", label: t("navbar.reviews"), isActive: activeSection === "#reviews" },
    { href: "#blog", label: t("navbar.blog"), isActive: activeSection === "#blog" },
    { href: "#help", label: t("navbar.help"), isActive: activeSection === "#help" },
  ];

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [authUser, currentRoute]);

  const toggleShellNavigation = () => {
    window.dispatchEvent(new CustomEvent("educonnect:toggle-shell-nav"));
  };

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
      aria-label={t("navbar.languageLabel")}
      title={t("navbar.languageLabel")}
    >
      <span className="language-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3a14.5 14.5 0 0 1 0 18" />
          <path d="M12 3a14.5 14.5 0 0 0 0 18" />
        </svg>
      </span>
      <span className="language-icon-code" aria-hidden="true">
        {nextLanguageLabel}
      </span>
    </button>
  );

  return (
    <nav className="navbar">
      <div className={`container navbar-inner ${authUser ? "navbar-inner-auth" : "navbar-inner-guest"}`}>
        <div className={`brand ${authUser ? "brand-auth" : "brand-guest"}`}>
          <span className="brand-logo" aria-hidden="true">
            <img className="brand-logo-image" src={eduConnectLogo} alt="" />
          </span>
          <span className="brand-text">EduConnect</span>
        </div>

        {!authUser && (
          <button
            className={`nav-menu-toggle ${isMobileMenuOpen ? "nav-menu-toggle-open" : ""}`}
            type="button"
            aria-expanded={isMobileMenuOpen}
            aria-controls="navbar-mobile-panel"
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
          >
            <span />
            <span />
            <span />
          </button>
        )}

        {authUser ? (
          <button
            className="nav-menu-toggle nav-shell-toggle"
            type="button"
            aria-label={shellToggleLabel}
            onClick={toggleShellNavigation}
          >
            <span />
            <span />
            <span />
          </button>
        ) : null}

        {authUser ? (
          <div className="nav-top-shortcuts">
            {renderThemeButton("nav-theme-inline-auth")}
            <MessageNotifications authUser={authUser} />
            {renderLanguageButton("nav-language-inline-auth")}
            <div className="nav-user-block">
              <span className="nav-user-name">{authUser?.name || t("common.userFallback")}</span>
              <span className="nav-user-role">{userRoleLabel}</span>
            </div>
          </div>
        ) : null}

        {!authUser ? (
          <div
            id="navbar-mobile-panel"
            className={`nav-mobile-panel ${isMobileMenuOpen ? "nav-mobile-panel-open" : ""}`}
          >
            <div className="nav-links">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  className={`nav-link ${item.isActive ? "nav-link-active" : ""}`}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </div>
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
          </div>
        ) : null}
      </div>
    </nav>
  );
}

export default Navbar;
