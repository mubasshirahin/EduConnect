import React, { useEffect, useState } from "react";
import eduConnectLogo from "../assets/educonnect-logo.png";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import MessageNotifications from "./MessageNotifications.jsx";

function Navbar({ onLoginClick, onRegisterClick, authUser, theme, onToggleTheme, currentRoute }) {
  const { language, setLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isDark = theme === "dark";
  const themeLabel = isDark ? t("common.lightMode") : t("common.nightMode");
  const themeButtonLabel = isDark ? t("common.lightModeShort") : t("common.nightModeShort");
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

  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [currentRoute, authUser]);

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <div className="brand">
          <span className="brand-logo" aria-hidden="true">
            <img className="brand-logo-image" src={eduConnectLogo} alt="" />
          </span>
        </div>

        {!authUser ? (
          <div className="nav-auth-shortcuts">
            <button className="btn btn-ghost" type="button" onClick={onLoginClick}>
              {t("navbar.login")}
            </button>
            <button className="btn btn-primary" type="button" onClick={onRegisterClick}>
              {t("navbar.register")}
            </button>
          </div>
        ) : null}

        <button
          className={`nav-menu-toggle ${isMenuOpen ? "nav-menu-toggle-open" : ""}`}
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMenuOpen}
          aria-controls="primary-navigation"
        >
          <span />
          <span />
          <span />
        </button>

        <div
          id="primary-navigation"
          className={`nav-mobile-panel ${isMenuOpen ? "nav-mobile-panel-open" : ""}`}
        >
          {!authUser && (
            <div className="nav-links">
              <a className={`nav-link ${activeSection === "#home" ? "nav-link-active" : ""}`} href="#home" onClick={closeMenu}>
                {t("navbar.home")}
              </a>
              <a className={`nav-link ${activeSection === "#about" ? "nav-link-active" : ""}`} href="#about" onClick={closeMenu}>
                {t("navbar.about")}
              </a>
              <a className={`nav-link ${activeSection === "#jobs" ? "nav-link-active" : ""}`} href="#jobs" onClick={closeMenu}>
                {t("navbar.jobs")}
              </a>
              <a className={`nav-link ${activeSection === "#reviews" ? "nav-link-active" : ""}`} href="#reviews" onClick={closeMenu}>
                {t("navbar.reviews")}
              </a>
              <a className={`nav-link ${activeSection === "#blog" ? "nav-link-active" : ""}`} href="#blog" onClick={closeMenu}>
                {t("navbar.blog")}
              </a>
              <a className={`nav-link ${activeSection === "#help" ? "nav-link-active" : ""}`} href="#help" onClick={closeMenu}>
                {t("navbar.help")}
              </a>
            </div>
          )}

          <div className="nav-actions">
            <div className="nav-utility-row">
              <button
                className={`btn-theme ${isDark ? "btn-theme-light" : "btn-theme-dark"} ${language === "bn" ? "btn-theme-lang-bn" : "btn-theme-lang-en"}`}
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
                </span>
              </button>

              {!authUser ? (
                <button
                  className="language-icon-button"
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
              ) : (
                <button
                  className="language-icon-button"
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
              )}
            </div>

            {!authUser ? null : (
              <>
                <a
                  className={`nav-link nav-link-help ${activeSection === "#help" ? "nav-link-active" : ""}`}
                  href="#help"
                  onClick={closeMenu}
                >
                  {t("navbar.help")}
                </a>
                <MessageNotifications authUser={authUser} />
                <div className="nav-user-block">
                  <span className="nav-user-name">{authUser.name || t("common.userFallback")}</span>
                  <span className="nav-user-role">{authUser.role}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
