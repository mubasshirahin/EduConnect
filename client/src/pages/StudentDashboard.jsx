import React, { useState, useEffect } from "react";

function StudentDashboard({ user, onLogout }) {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppliedJobs();
  }, []);

  const fetchAppliedJobs = async () => {
    try {
      const response = await fetch(`/api/jobs?applicantEmail=${user.email}`);
      const data = await response.json();
      
      // Filter jobs where student has applied
      const jobs = data.filter(job => 
        job.applicants.some(app => app.email === user.email)
      );
      
      setAppliedJobs(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch(status) {
      case "pending": return { background: "#f59e0b", color: "#fff" };
      case "shortlisted": return { background: "#3b82f6", color: "#fff" };
      case "rejected": return { background: "#ef4444", color: "#fff" };
      case "hired": return { background: "#10b981", color: "#fff" };
      default: return { background: "#6b7280", color: "#fff" };
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-card" style={{ textAlign: "center" }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Student Dashboard</h1>
      </header>

      <section className="dashboard-card">
        <h2>Welcome, {user?.name || "Student"}!</h2>
        <p>Track your job applications below.</p>
      </section>

      <section className="dashboard-card" style={{ marginTop: "1.5rem" }}>
        <h3>My Applications</h3>
        
        {appliedJobs.length === 0 ? (
          <p style={{ color: "var(--text-soft)", padding: "1rem 0" }}>
            You haven't applied to any jobs yet. Go to the Job Board to apply!
          </p>
        ) : (
          <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
            {appliedJobs.map((job) => {
              const application = job.applicants.find(app => app.email === user.email);
              const badgeStyle = getStatusBadgeColor(application?.status || "pending");
              
              return (
                <div key={job._id} style={{
                  border: "1px solid var(--border-soft)",
                  borderRadius: "12px",
                  padding: "1rem",
                  background: "var(--bg-surface)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div>
                      <h4 style={{ marginBottom: "0.5rem", color: "var(--text-main)" }}>{job.title}</h4>
                      <p style={{ color: "var(--text-soft)", fontSize: "0.9rem" }}>
                        {job.location} • {job.schedule} • {job.rate}
                      </p>
                    </div>
                    <span style={{
                      background: badgeStyle.background,
                      color: badgeStyle.color,
                      padding: "0.25rem 0.75rem",
                      borderRadius: "20px",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                      textTransform: "uppercase"
                    }}>
                      {application?.status || "pending"}
                    </span>
                  </div>
                  <p style={{ marginTop: "0.5rem", color: "var(--text-soft)", fontSize: "0.85rem" }}>
                    Applied on: {new Date(application?.appliedAt).toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default StudentDashboard;