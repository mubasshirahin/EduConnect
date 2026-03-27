import React, { useEffect, useState } from "react";

function TeacherDashboard({ authUser }) {
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    if (!authUser?.email) return;
    fetchMyJobs();
  }, [authUser]);

  const fetchMyJobs = async () => {
    try {
      const response = await fetch(`/api/jobs?postedByEmail=${authUser.email}`);
      const data = await response.json();
      setMyJobs(data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (jobId, applicantEmail, newStatus) => {
    setUpdatingStatus({ jobId, applicantEmail });
    try {
      const response = await fetch(`/api/jobs/${jobId}/applicants/${applicantEmail}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        // Update local state
        setMyJobs(prevJobs => 
          prevJobs.map(job => {
            if (job._id === jobId) {
              return {
                ...job,
                applicants: job.applicants.map(app => 
                  app.email === applicantEmail ? { ...app, status: newStatus } : app
                )
              };
            }
            return job;
          })
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "pending": return "#f59e0b";
      case "shortlisted": return "#3b82f6";
      case "rejected": return "#ef4444";
      case "hired": return "#10b981";
      default: return "#6b7280";
    }
  };

  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>;
  }

  return (
    <div>
      <section className="notice-board">
        <div className="notice-header">
          <span className="notice-icon">NB</span>
          <h2>Notice Board</h2>
        </div>
        <p>
          Our "Tutor of the Month, March 2026" is Shahria Rahman Rafi (Tutor
          ID: 385346) and our "Guardian of the Month, March 2026" is Md.
          Mubarak Hossain (Guardian ID: 429325). Heartiest congratulations to
          both of them; we're glad to work with them.
        </p>
        <span className="notice-date">Mar 04, 2026</span>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">JP</span>
          <div>
            <h3>{myJobs.length}</h3>
            <p>Jobs Posted</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">AP</span>
          <div>
            <h3>{myJobs.reduce((total, job) => total + job.applicants.length, 0)}</h3>
            <p>Total Applicants</p>
          </div>
        </div>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>My Jobs & Applicants</h3>
        
        {myJobs.length === 0 ? (
          <div className="dashboard-card" style={{ textAlign: "center" }}>
            <p>You haven't posted any jobs yet. Click "Post a Job" to get started!</p>
          </div>
        ) : (
          myJobs.map(job => (
            <div key={job._id} className="dashboard-card" style={{ marginBottom: "1.5rem" }}>
              <h4 style={{ marginBottom: "0.5rem" }}>{job.title}</h4>
              <p style={{ color: "var(--text-soft)", fontSize: "0.85rem", marginBottom: "1rem" }}>
                {job.location} • {job.schedule} • {job.rate}
              </p>
              
              {job.applicants.length === 0 ? (
                <p style={{ color: "var(--text-soft)" }}>No applicants yet.</p>
              ) : (
                <div style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
                  {job.applicants.map(applicant => (
                    <div key={applicant.email} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.75rem",
                      border: "1px solid var(--border-soft)",
                      borderRadius: "8px",
                      background: "var(--bg-muted)"
                    }}>
                      <div>
                        <p style={{ fontWeight: "bold" }}>{applicant.name}</p>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-soft)" }}>{applicant.email}</p>
                        <p style={{ fontSize: "0.7rem", color: "var(--text-soft)" }}>
                          Applied: {new Date(applicant.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <span style={{
                          background: getStatusColor(applicant.status),
                          color: "#fff",
                          padding: "0.25rem 0.6rem",
                          borderRadius: "20px",
                          fontSize: "0.7rem",
                          fontWeight: "bold"
                        }}>
                          {applicant.status}
                        </span>
                        <select
                          value={applicant.status}
                          onChange={(e) => updateStatus(job._id, applicant.email, e.target.value)}
                          disabled={updatingStatus?.jobId === job._id && updatingStatus?.applicantEmail === applicant.email}
                          style={{
                            padding: "0.3rem 0.5rem",
                            borderRadius: "6px",
                            background: "var(--bg-surface)",
                            color: "var(--text-main)",
                            border: "1px solid var(--border-soft)",
                            cursor: "pointer"
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="rejected">Rejected</option>
                          <option value="hired">Hired</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default TeacherDashboard;