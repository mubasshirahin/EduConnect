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
          <a className={`sidebar-link ${currentRoute === "#home" ? "sidebar-link-active" : ""}`} href="#home">
            Home
          </a>
          <a className={`sidebar-link ${currentRoute === "#jobs" ? "sidebar-link-active" : ""}`} href="#jobs">
            Job Board
          </a>
          <a className={`sidebar-link ${currentRoute === "#status" ? "sidebar-link-active" : ""}`} href="#status">
            Status
          </a>
          <a className={`sidebar-link ${currentRoute === "#messages" ? "sidebar-link-active" : ""}`} href="#messages">
            Messages
          </a>
          <a className={`sidebar-link ${currentRoute === "#settings" ? "sidebar-link-active" : ""}`} href="#settings">
            Settings
          </a>
          <button className="sidebar-link sidebar-link-logout" type="button" onClick={onLogout}>
            Logout
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
