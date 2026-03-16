import React from "react";

function AdminDashboard() {
  return (
    <section>
      <div className="status-header">
        <h2>Admin Dashboard</h2>
        <p>Manage users, jobs, and platform activity.</p>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">U</span>
          <div>
            <h3>0</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">J</span>
          <div>
            <h3>0</h3>
            <p>Total Jobs</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">A</span>
          <div>
            <h3>0</h3>
            <p>Active Posts</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">R</span>
          <div>
            <h3>0</h3>
            <p>Reports</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">C</span>
          <div>
            <h3>0</h3>
            <p>Complaints</p>
          </div>
        </div>
      </div>
      <div className="update-soon-card">
        <h2>Admin tools coming soon</h2>
        <p>We will add user management, approvals, and analytics here.</p>
      </div>
    </section>
  );
}

export default AdminDashboard;
