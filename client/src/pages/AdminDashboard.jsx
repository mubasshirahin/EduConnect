import React, { useEffect, useState } from "react";

function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalJobs: 0, totalAdmins: 0, totalBlocked: 0 });
  const [loading, setLoading] = useState(true);
  const [jobsCount, setJobsCount] = useState(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats({
          totalUsers: data.totalUsers ?? 0,
          totalJobs: data.totalJobs ?? 0,
          totalAdmins: data.totalAdmins ?? 0,
          totalBlocked: data.totalBlocked ?? 0,
        });
      })
      .catch(() => {
        setStats({ totalUsers: 0, totalJobs: 0, totalAdmins: 0, totalBlocked: 0 });
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/jobs")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setJobsCount(data.length);
        }
      })
      .catch(() => {
        setJobsCount(null);
      });
  }, []);

  const displayTotalJobs = loading && jobsCount === null ? "..." : jobsCount ?? stats.totalJobs;

  return (
    <section>
      <div className="status-header">
        <h2>Admin Dashboard</h2>
        <p>Manage users, jobs, and platform activity.</p>
      </div>
      <div className="stats-grid">
        <button className="stat-card stat-card-link" type="button" onClick={() => (window.location.hash = "#admin-users")}>
          <span className="stat-icon">U</span>
          <div>
            <h3>{loading ? "..." : stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </button>
        <button className="stat-card stat-card-link" type="button" onClick={() => (window.location.hash = "#admin-admins")}>
          <span className="stat-icon">A</span>
          <div>
            <h3>{loading ? "..." : stats.totalAdmins}</h3>
            <p>Total Admins</p>
          </div>
        </button>
        <button className="stat-card stat-card-link" type="button" onClick={() => (window.location.hash = "#jobs")}>
          <span className="stat-icon">J</span>
          <div>
            <h3>{displayTotalJobs}</h3>
            <p>Total Jobs</p>
          </div>
        </button>
        <button className="stat-card stat-card-link" type="button" onClick={() => (window.location.hash = "#admin-blocked")}>
          <span className="stat-icon">B</span>
          <div>
            <h3>{loading ? "..." : stats.totalBlocked}</h3>
            <p>Blocked Users</p>
          </div>
        </button>
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
