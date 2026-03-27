import React from "react";

function Navbar({ onLoginClick, onRegisterClick, onLogout, authUser, theme, onToggleTheme }) {
  const isDark = theme === "dark";
  const themeLabel = isDark ? "Light Mode" : "Night Mode";

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <div className="brand">
          <span className="brand-logo" aria-hidden="true">
            <svg className="brand-logo-image" viewBox="0 0 76 32" fill="none">
              <path
                d="M38 6H17C10.373 6 5 11.373 5 18C5 24.627 10.373 30 17 30H34"
                stroke="currentColor"
                strokeWidth="4.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7 18H27"
                stroke="currentColor"
                strokeWidth="4.2"
                strokeLinecap="round"
              />
              <path
                d="M46 6H61C67.627 6 73 11.373 73 18C73 24.627 67.627 30 61 30H43C36.373 30 31 24.627 31 18"
                stroke="currentColor"
                strokeWidth="4.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="brand-text">EduConnect</span>
        </div>
        {!authUser && (
          <div className="nav-links">
            <a className="nav-link" href="#home">
              Home
            </a>
            <a className="nav-link" href="#jobs">
              Job Board
            </a>
            <a className="nav-link" href="#reviews">
              Reviews
            </a>
          </div>
        )}
        <div className="nav-actions">
          <button
            className={`btn-theme ${isDark ? "btn-theme-light" : "btn-theme-dark"}`}
            type="button"
            onClick={onToggleTheme}
            aria-label={`Switch to ${isDark ? "Light Mode" : "Night Mode"}`}
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
              <span className="btn-theme-text">{themeLabel}</span>
            </span>
          </button>
          {authUser ? (
            <div className="nav-user-block">
              <span className="nav-user-name">{authUser.name || "User"}</span>
              <span className="nav-user-role">{authUser.role}</span>
            </div>
          ) : (
            <>
              <button className="btn btn-ghost" type="button" onClick={onLoginClick}>
                Login
              </button>
              <button className="btn btn-primary" type="button" onClick={onRegisterClick}>
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
