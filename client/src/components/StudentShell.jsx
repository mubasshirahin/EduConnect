import React, { useState } from "react";

function StudentShell({ user, onLogout, children, currentRoute }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`teacher-dashboard ${isCollapsed ? "teacher-dashboard-collapsed" : ""}`}>
      <aside className="teacher-sidebar">
        <div className="sidebar-profile">
          <div className="sidebar-avatar">S</div>
          <div>
            <p className="sidebar-name">{user?.name || "Student Name"}</p>
            <p className="sidebar-meta">ID: 429325</p>
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
          <a className={`sidebar-link ${currentRoute?.startsWith("#home") ? "sidebar-link-active" : ""}`} href="#home">
            Home
          </a>
          <a className={`sidebar-link ${currentRoute?.startsWith("#jobs") ? "sidebar-link-active" : ""}`} href="#jobs">
            Job Board
          </a>
          <a className={`sidebar-link ${currentRoute?.startsWith("#status") ? "sidebar-link-active" : ""}`} href="#status">
            Status
          </a>
          <a className={`sidebar-link ${currentRoute?.startsWith("#messages") ? "sidebar-link-active" : ""}`} href="#messages">
            Messages
          </a>
          <a className={`sidebar-link ${currentRoute?.startsWith("#settings") ? "sidebar-link-active" : ""}`} href="#settings">
            Settings
          </a>
          <button className="sidebar-link sidebar-link-logout" type="button" onClick={onLogout}>
            Logout
          </button>
        </nav>
      </aside>
      <main className="teacher-main">{children}</main>
    </div>
  );
}

export default StudentShell;
