import React from "react";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <h2 className="brand">EduConnect</h2>
        <div className="nav-actions">
          <button className="btn btn-ghost">Login</button>
          <button className="btn btn-primary">Register</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
