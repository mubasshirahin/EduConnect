import React from "react";

function Navbar({ onLoginClick, onRegisterClick, onLogout, authUser, theme, onToggleTheme }) {
  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <h2 className="brand">EduConnect</h2>
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
          <button className="btn btn-ghost btn-theme" type="button" onClick={onToggleTheme}>
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
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