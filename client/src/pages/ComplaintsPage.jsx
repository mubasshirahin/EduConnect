import React, { useState } from "react";

function ComplaintsPage({ authUser }) {
  const [form, setForm] = useState({ subject: "", details: "" });
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("educonnect-auth-token");
    if (!token) {
      setStatus({ type: "error", message: "Please sign in again before sending a complaint." });
      return;
    }

    try {
      setStatus({ type: "", message: "" });
      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: form.subject.trim(),
          details: form.details.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Unable to submit complaint.");
      }

      setForm({ subject: "", details: "" });
      setStatus({ type: "success", message: "Your complaint has been sent to the admin team." });
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Unable to submit complaint." });
    }
  };

  return (
    <section className="status-page">
      <div className="status-header">
        <h2>Complaint Box</h2>
        <p>Share any problem, concern, or platform issue with the admin team. Only admins will be able to view your complaint.</p>
      </div>

      <div className="complaints-page-grid">
        <section className="complaint-card complaint-card-copy">
          <p className="complaint-eyebrow">Private Support</p>
          <h3>Need help with something?</h3>
          <p>If you face any issue with tuition requests, messaging, job applications, or user behavior, write it here and the admin team will review it.</p>
          <div className="complaint-meta">
            <span><strong>Name:</strong> {authUser?.name || "User"}</span>
            <span><strong>Role:</strong> {authUser?.role || "Member"}</span>
            <span><strong>Email:</strong> {authUser?.email || "N/A"}</span>
          </div>
          <div className="complaint-tips">
            <span>Be specific about what happened</span>
            <span>Include names, date, or page if needed</span>
            <span>Only admins can view this message</span>
          </div>
        </section>

        <form className="complaint-card complaint-form" onSubmit={handleSubmit}>
          <div className="complaint-form-header">
            <div>
              <p className="complaint-eyebrow">Complaint Form</p>
              <h3>Tell the admin team what went wrong</h3>
            </div>
          </div>

          <div className="complaint-form-fields">
            <div className="form-group complaint-field">
              <label htmlFor="complaint-subject">Subject</label>
              <input
                id="complaint-subject"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Short complaint title"
                required
              />
            </div>

            <div className="form-group complaint-field">
              <label htmlFor="complaint-details">Details</label>
              <textarea
                id="complaint-details"
                name="details"
                value={form.details}
                onChange={handleChange}
                placeholder="Explain your issue clearly so the admin team can review it."
                rows="8"
                required
              />
            </div>
          </div>

          {status.message ? (
            <p className={`auth-status ${status.type === "error" ? "auth-status-error" : "auth-status-success"}`}>
              {status.message}
            </p>
          ) : null}

          <div className="status-card-actions">
            <button className="btn btn-primary" type="submit">Send Complaint</button>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => {
                setForm({ subject: "", details: "" });
                setStatus({ type: "", message: "" });
              }}
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default ComplaintsPage;
