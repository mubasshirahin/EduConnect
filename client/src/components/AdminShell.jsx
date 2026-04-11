import React, { useEffect, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

function AdminShell({ user, onLogout, children, currentRoute }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language } = useLanguage();
  const isBangla = language === "bn";
  const copy = {
    closeNavigationMenu: isBangla ? "নেভিগেশন মেনু বন্ধ করুন" : "Close navigation menu",
    openNavigationMenu: isBangla ? "নেভিগেশন মেনু খুলুন" : "Open navigation menu",
    expandSidebar: isBangla ? "সাইডবার বড় করুন" : "Expand sidebar",
    collapseSidebar: isBangla ? "সাইডবার ছোট করুন" : "Collapse sidebar",
    dashboardTitle: isBangla ? "অ্যাডমিন ড্যাশবোর্ড" : "Admin Dashboard",
  };

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
        aria-label={copy.closeNavigationMenu}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      <aside className="teacher-sidebar">
        <div className="sidebar-profile">
          <div className="sidebar-avatar">A</div>
          <div>
            <p className="sidebar-name">{user?.name || "Admin"}</p>
            <p className="sidebar-meta">Admin Panel</p>
          </div>
        </div>
        <button
          className="sidebar-toggle"
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          aria-label={isCollapsed ? copy.expandSidebar : copy.collapseSidebar}
        >
          {isCollapsed ? ">>" : "<<"}
        </button>
        <nav className="sidebar-nav">
          <a
            className={`sidebar-link ${currentRoute?.startsWith("#home") ? "sidebar-link-active" : ""}`}
            href="#home"
            aria-label="Home"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="sidebar-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 11l9-8 9 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 10v10h5v-6h4v6h5V10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="sidebar-text">Home</span>
          </a>
          <a
            className={`sidebar-link ${currentRoute?.startsWith("#jobs") ? "sidebar-link-active" : ""}`}
            href="#jobs"
            aria-label="Job Board"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="sidebar-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 7h18v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 11h18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="sidebar-text">Job Board</span>
          </a>
          <a
            className={`sidebar-link ${currentRoute?.startsWith("#status") ? "sidebar-link-active" : ""}`}
            href="#status"
            aria-label="Status"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="sidebar-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 3v18h18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 15l4-4 3 3 5-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="sidebar-text">Status</span>
          </a>
          <a
            className={`sidebar-link ${currentRoute?.startsWith("#reports") ? "sidebar-link-active" : ""}`}
            href="#reports"
            aria-label="Reports"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="sidebar-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 2v6h6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 13h8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 17h8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 9h2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="sidebar-text">Reports</span>
          </a>
          <a
            className={`sidebar-link ${currentRoute?.startsWith("#complains") ? "sidebar-link-active" : ""}`}
            href="#complains"
            aria-label="Complains"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="sidebar-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M10.29 3.86l-8 14A2 2 0 0 0 4 20h16a2 2 0 0 0 1.71-3.14l-8-14a2 2 0 0 0-3.42 0z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 9v4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 17h.01" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="sidebar-text">Complains</span>
          </a>
          <a
            className={`sidebar-link ${currentRoute?.startsWith("#notices") ? "sidebar-link-active" : ""}`}
            href="#notices"
            aria-label="Notices"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="sidebar-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 4h16v12H7l-3 4z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 8h8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 12h6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="sidebar-text">Notices</span>
          </a>
          <a
            className={`sidebar-link ${currentRoute?.startsWith("#messages") ? "sidebar-link-active" : ""}`}
            href="#messages"
            aria-label="Messages"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="sidebar-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="sidebar-text">Messages</span>
          </a>
          <a
            className={`sidebar-link ${currentRoute?.startsWith("#help") ? "sidebar-link-active" : ""}`}
            href="#help"
            aria-label="Help Hub"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="sidebar-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M9.1 9a3 3 0 1 1 5.2 2c-.7.8-1.6 1.3-2.1 2.1-.3.4-.4.8-.4 1.4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 17h.01" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="sidebar-text">Help Hub</span>
          </a>
          <a
            className={`sidebar-link ${
              currentRoute === "#admin-users" || currentRoute?.startsWith("#admin-user/")
                ? "sidebar-link-active"
                : ""
            }`}
            href="#admin-users"
            aria-label="Users"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="sidebar-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="9" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="sidebar-text">Users</span>
          </a>
          <a
            className={`sidebar-link ${currentRoute?.startsWith("#admin-teachers") ? "sidebar-link-active" : ""}`}
            href="#admin-teachers"
            aria-label="Teachers"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="sidebar-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3 2 8l10 5 8-4v6h2V8L12 3Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 10.8V15c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="sidebar-text">Teachers</span>
          </a>
          <a
            className={`sidebar-link ${currentRoute?.startsWith("#settings") ? "sidebar-link-active" : ""}`}
            href="#settings"
            aria-label="Settings"
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
            <span className="sidebar-text">Settings</span>
          </a>
          <button
            className="sidebar-link sidebar-link-logout"
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              onLogout();
            }}
            aria-label="Logout"
          >
            <span className="sidebar-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 17l5-5-5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 12H9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="sidebar-text">Logout</span>
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
          <div className="teacher-topbar-title" />
        </header>
        {children}
      </main>
    </div>
  );
}

export default AdminShell;
