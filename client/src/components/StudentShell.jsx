import React, { useEffect, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

function StudentShell({ user, onLogout, children, currentRoute }) {
  const { language, t } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const isBangla = language === "bn";
  const copy = {
    closeNavigationMenu: isBangla ? "নেভিগেশন মেনু বন্ধ করুন" : "Close navigation menu",
    openNavigationMenu: isBangla ? "নেভিগেশন মেনু খুলুন" : "Open navigation menu",
    expandSidebar: isBangla ? "সাইডবার বড় করুন" : "Expand sidebar",
    collapseSidebar: isBangla ? "সাইডবার ছোট করুন" : "Collapse sidebar",
    studentNameFallback: isBangla ? "স্টুডেন্টের নাম" : "Student Name",
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentRoute]);

  useEffect(() => {
    if (!user?.email) return;
    const profileKey = `educonnect-profile:${user.email}`;
    const readProfile = () => {
      const stored = localStorage.getItem(profileKey);
      if (stored) {
        try {
          const profile = JSON.parse(stored);
          setAvatarUrl(profile.avatarUrl || "");
        } catch {
          setAvatarUrl("");
        }
      } else {
        setAvatarUrl("");
      }
    };
    readProfile();
    window.addEventListener("storage", readProfile);
    return () => window.removeEventListener("storage", readProfile);
  }, [user?.email]);

  return (
    <div
      className={`teacher-dashboard ${isCollapsed ? "teacher-dashboard-collapsed" : ""} ${isMobileMenuOpen ? "teacher-dashboard-mobile-menu-open" : ""}`}
    >
      <button
        className={`teacher-mobile-backdrop ${isMobileMenuOpen ? "teacher-mobile-backdrop-visible" : ""}`}
        type="button"
        aria-label={copy.closeNavigationMenu}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      <aside className="teacher-sidebar">
        <div className="sidebar-profile">
          <div className="sidebar-avatar">
            {avatarUrl ? (
              <img src={avatarUrl} alt={user?.name} className="avatar-img" />
            ) : (
              user?.name?.charAt(0).toUpperCase() || "S"
            )}
          </div>
          <div>
            <p className="sidebar-name">{user?.name || copy.studentNameFallback}</p>
            <p className="sidebar-meta">ID: 429325</p>
          </div>
        </div>
        <a className="sidebar-edit" href="#profile" onClick={() => setIsMobileMenuOpen(false)}>
          {t("dashboard.editProfile")}
        </a>
        <div className="sidebar-toggle-row">
          <button
            className="sidebar-toggle"
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            aria-label={isCollapsed ? copy.expandSidebar : copy.collapseSidebar}
          >
            {isCollapsed ? ">>" : "<<"}
          </button>
        </div>
        <nav className="sidebar-nav">
          <a
            className={`sidebar-link ${currentRoute?.startsWith("#home") ? "sidebar-link-active" : ""}`}
            href="#home"
            aria-label={t("dashboard.home")}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="sidebar-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 11l9-8 9 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 10v10h5v-6h4v6h5V10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="sidebar-text">{t("dashboard.home")}</span>
          </a>
          <a
            className={`sidebar-link ${currentRoute?.startsWith("#jobs") ? "sidebar-link-active" : ""}`}
            href="#jobs"
            aria-label={t("dashboard.jobs")}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="sidebar-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 7h18v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 11h18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="sidebar-text">{t("dashboard.jobs")}</span>
          </a>
          <a
            className={`sidebar-link ${currentRoute?.startsWith("#status") ? "sidebar-link-active" : ""}`}
            href="#status"
            aria-label={t("dashboard.status")}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="sidebar-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 3v18h18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 15l4-4 3 3 5-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="sidebar-text">{t("dashboard.status")}</span>
          </a>
          <a
            className={`sidebar-link ${currentRoute?.startsWith("#messages") ? "sidebar-link-active" : ""}`}
            href="#messages"
            aria-label={t("dashboard.messages")}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="sidebar-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="sidebar-text">{t("dashboard.messages")}</span>
          </a>
          <a
            className={`sidebar-link ${currentRoute?.startsWith("#blog") ? "sidebar-link-active" : ""}`}
            href="#blog"
            aria-label="Blog"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="sidebar-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 4h16v4H4z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 10h16v10H4z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 14h8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 18h8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="sidebar-text">Blog</span>
          </a>
          <a
            className={`sidebar-link ${currentRoute?.startsWith("#reviews") ? "sidebar-link-active" : ""}`}
            href="#reviews"
            aria-label={t("dashboard.reviews")}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="sidebar-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3l2.8 5.67 6.26.91-4.53 4.42 1.07 6.25L12 17.27 6.4 20.25l1.07-6.25L2.94 9.58l6.26-.91L12 3z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="sidebar-text">{t("dashboard.reviews")}</span>
          </a>
          <a
            className={`sidebar-link ${currentRoute?.startsWith("#help") ? "sidebar-link-active" : ""}`}
            href="#help"
            aria-label={t("navbar.help")}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="sidebar-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M9.1 9a3 3 0 1 1 5.2 2c-.7.8-1.6 1.3-2.1 2.1-.3.4-.4.8-.4 1.4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 17h.01" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="sidebar-text">{t("navbar.help")}</span>
          </a>
          <a
            className={`sidebar-link ${currentRoute?.startsWith("#settings") ? "sidebar-link-active" : ""}`}
            href="#settings"
            aria-label={t("dashboard.settings")}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="sidebar-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 21v-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 10V3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 21v-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 8V3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20 21v-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20 12V3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="sidebar-text">{t("dashboard.settings")}</span>
          </a>
          <button
            className="sidebar-link sidebar-link-logout"
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              onLogout();
            }}
            aria-label={t("dashboard.logout")}
          >
            <span className="sidebar-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 17l5-5-5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 12H9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="sidebar-text">{t("dashboard.logout")}</span>
          </button>
        </nav>
      </aside>
      <main className="teacher-main">
        <header className="teacher-topbar">
          <button
            className="teacher-mobile-menu-button"
            type="button"
            aria-label={isMobileMenuOpen ? copy.closeNavigationMenu : copy.openNavigationMenu}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>
          <div className="teacher-topbar-title">
            <h1>{t("dashboard.studentDashboard")}</h1>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

export default StudentShell;
