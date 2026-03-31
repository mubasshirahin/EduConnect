import React, { useEffect, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

function TeacherShell({ user, onLogout, children, currentRoute }) {
  const { t } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const hideTopbar = currentRoute?.startsWith("#reviews");

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentRoute]);

  return (
    <div
      className={`teacher-dashboard ${isCollapsed ? "teacher-dashboard-collapsed" : ""} ${isMobileMenuOpen ? "teacher-dashboard-mobile-menu-open" : ""}`}
    >
      <button
        className={`teacher-mobile-backdrop ${isMobileMenuOpen ? "teacher-mobile-backdrop-visible" : ""}`}
        type="button"
        aria-label="Close navigation menu"
        onClick={() => setIsMobileMenuOpen(false)}
      />
      <aside className="teacher-sidebar">
        <div className="sidebar-profile">
          <div className="sidebar-avatar">T</div>
          <div>
            <p className="sidebar-name">{user?.name || "Teacher Name"}</p>
            <p className="sidebar-meta">ID: {user?.tutorId || "-"}</p>
          </div>
        </div>
        <a className="sidebar-edit" href="#profile">
          {t("dashboard.editProfile")}
        </a>
        <button
          className="sidebar-toggle"
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? ">>" : "<<"}
        </button>
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
            className={`sidebar-link ${currentRoute?.startsWith("#settings") ? "sidebar-link-active" : ""}`}
            href="#settings"
            aria-label={t("dashboard.settings")}
            title={t("dashboard.settings")}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="sidebar-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.08V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-.4-1.08 1.7 1.7 0 0 0-1-.6 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.08-.4H2.9a2 2 0 1 1 0-4H3a1.7 1.7 0 0 0 1.08-.4 1.7 1.7 0 0 0 .6-1A1.7 1.7 0 0 0 4.34 6.33l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6A1.7 1.7 0 0 0 10.4 2.9V2.8a2 2 0 1 1 4 0V3a1.7 1.7 0 0 0 .4 1.08 1.7 1.7 0 0 0 1 .6 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 .6 1 1.7 1.7 0 0 0 1.08.4h.09a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.08.4 1.7 1.7 0 0 0-.6 1Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
        {!hideTopbar ? (
          <header className="teacher-topbar">
            <div>
              <p className="eyebrow">{t("dashboard.dashboardLabel")}</p>
              <h1>{t("dashboard.teacherDashboard")}</h1>
            </div>
            <button
              className="teacher-mobile-menu-button"
              type="button"
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            >
              <span />
              <span />
              <span />
            </button>
          </header>
        ) : null}
        {children}
      </main>
    </div>
  );
}

export default TeacherShell;
