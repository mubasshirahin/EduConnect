import React, { useState } from "react";

function TeacherShell({ user, onLogout, children, currentRoute }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`teacher-dashboard ${isCollapsed ? "teacher-dashboard-collapsed" : ""}`}>
      <aside className="teacher-sidebar">
        <div className="sidebar-profile">
          <div className="sidebar-avatar">T</div>
          <div>
            <p className="sidebar-name">{user?.name || "Teacher Name"}</p>
            <p className="sidebar-meta">ID: 385346</p>
          </div>
        </div>
        <a className="sidebar-edit" href="#profile">
          Edit Profile
        </a>
        <button
          className="sidebar-toggle"
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? "»" : "«"}
        </button>
        <nav className="sidebar-nav">
          <a
            className={`sidebar-link ${currentRoute?.startsWith("#home") ? "sidebar-link-active" : ""}`}
            href="#home"
            aria-label="Home"
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
            className={`sidebar-link ${currentRoute?.startsWith("#messages") ? "sidebar-link-active" : ""}`}
            href="#messages"
            aria-label="Messages"
          >
            <span className="sidebar-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="sidebar-text">Messages</span>
          </a>
          <a
            className={`sidebar-link ${currentRoute?.startsWith("#settings") ? "sidebar-link-active" : ""}`}
            href="#settings"
            aria-label="Settings"
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
          <button className="sidebar-link sidebar-link-logout" type="button" onClick={onLogout} aria-label="Logout">
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
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1>Teacher Dashboard</h1>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

export default TeacherShell;
