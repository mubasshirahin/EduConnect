import React, { useEffect, useState } from "react";

function TeacherDashboard({ authUser }) {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authUser?.email) return;
    fetchAppliedJobs();
  }, [authUser]);

  const fetchAppliedJobs = async () => {
    try {
      const response = await fetch(`/api/jobs?applicantEmail=${authUser.email}`);
      const data = await response.json();
      
      // Filter jobs where teacher has applied
      const jobs = data.filter(job => 
        job.applicants.some(app => app.email === authUser.email)
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
          <span className="stat-icon">AJ</span>
          <div>
            <h3>{appliedJobs.length}</h3>
            <p>Jobs Applied</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">SJ</span>
          <div>
            <h3>{appliedJobs.filter(job => {
              const app = job.applicants.find(a => a.email === authUser.email);
              return app?.status === "shortlisted";
            }).length}</h3>
            <p>Shortlisted</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">HJ</span>
          <div>
            <h3>{appliedJobs.filter(job => {
              const app = job.applicants.find(a => a.email === authUser.email);
              return app?.status === "hired";
            }).length}</h3>
            <p>Hired</p>
          </div>
        </div>
      </section>

      <section className="dashboard-card" style={{ marginTop: "1.5rem" }}>
        <h3>My Applications</h3>
        
        {appliedJobs.length === 0 ? (
          <p style={{ color: "var(--text-soft)", padding: "1rem 0" }}>
            You haven't applied to any tuition jobs yet. Go to the Job Board to apply!
          </p>
        ) : (
          <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
            {appliedJobs.map((job) => {
              const application = job.applicants.find(app => app.email === authUser.email);
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
                      <p style={{ color: "var(--text-soft)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                        Posted by: {job.postedBy}
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

export default TeacherDashboard;