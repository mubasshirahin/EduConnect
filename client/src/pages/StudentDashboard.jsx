import React from "react";

function StudentDashboard({ user, onLogout }) {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Student Dashboard</h1>
      </header>
      <section className="dashboard-card">
        <h2>Welcome</h2>
        <p>Here you will manage tutor requests and chat with admins.</p>
      </section>
    </div>
  );
}

export default StudentDashboard;
