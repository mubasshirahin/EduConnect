import React, { useEffect, useState } from "react";

function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadComplaints = async () => {
      const token = localStorage.getItem("educonnect-auth-token");
      if (!token) {
        setError("Admin session not found.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const response = await fetch("/api/complaints", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message || "Unable to load complaints.");
        }
        setComplaints(Array.isArray(data) ? data : []);
      } catch (loadError) {
        setComplaints([]);
        setError(loadError.message || "Unable to load complaints.");
      } finally {
        setLoading(false);
      }
    };

    loadComplaints();
  }, []);

  return (
    <section className="status-page">
      <div className="status-header">
        <h2>Complaints Inbox</h2>
        <p>Teachers and students can submit complaints here. Admins can review them from this panel only.</p>
      </div>

      {loading ? (
        <div className="job-empty">
          <h3>Loading complaints...</h3>
          <p>Please wait a moment.</p>
        </div>
      ) : error ? (
        <div className="job-empty">
          <h3>{error}</h3>
          <p>Please try again later.</p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="job-empty">
          <h3>No complaints yet</h3>
          <p>New teacher and student complaints will appear here.</p>
        </div>
      ) : (
        <div className="complaints-list">
          {complaints.map((complaint) => (
            <article key={complaint._id} className="complaint-card">
              <div className="status-card-head">
                <h3>{complaint.subject}</h3>
                <span className="messages-request-status messages-request-status-pending">
                  {complaint.authorRole}
                </span>
              </div>
              <p className="job-meta">
                {complaint.authorName} ({complaint.authorEmail})
              </p>
              <p className="complaint-body">{complaint.details}</p>
              <p className="status-inline-note">
                Submitted {complaint.createdAt ? new Date(complaint.createdAt).toLocaleString() : ""}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default AdminComplaints;
