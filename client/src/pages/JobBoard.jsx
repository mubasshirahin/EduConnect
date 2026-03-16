import React, { useEffect, useState } from "react";

function JobBoard({ authUser, onRequireLogin }) {
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [appliedJobs, setAppliedJobs] = useState([]);
  useEffect(() => {
    if (!authUser?.email) {
      setAppliedJobs([]);
      return;
    }
    const key = `educonnect-applied-${authUser.email}`;
    const stored = localStorage.getItem(key);
    setAppliedJobs(stored ? JSON.parse(stored) : []);
  }, [authUser]);

  const handleApply = (job) => {
    if (!authUser) {
      onRequireLogin?.();
      return;
    }
    if (!authUser.email) {
      return;
    }
    const key = `educonnect-applied-${authUser.email}`;
    const alreadyApplied = appliedJobs.some((item) => item.id === job._id || item.id === job.id);
    if (alreadyApplied) {
      return;
    }
    const newEntry = {
      id: job._id || job.id,
      title: job.title,
      location: job.location,
      schedule: job.schedule,
      rate: job.rate,
      appliedAt: new Date().toLocaleDateString(),
    };
    if (job._id) {
      fetch(`/api/jobs/${job._id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authUser.email, name: authUser.name || "Teacher" }),
      })
        .then((res) => res.json())
        .then((updatedJob) => {
          setJobs((prev) => prev.map((item) => (item._id === updatedJob._id ? updatedJob : item)));
        })
        .catch(() => {});
    }
    const updated = [newEntry, ...appliedJobs];
    localStorage.setItem(key, JSON.stringify(updated));
    setAppliedJobs(updated);
  };

  const handleWithdraw = (job) => {
    if (!authUser?.email) {
      return;
    }
    const key = `educonnect-applied-${authUser.email}`;
    const jobId = job._id || job.id;
    const updated = appliedJobs.filter((item) => item.id !== jobId);
    localStorage.setItem(key, JSON.stringify(updated));
    setAppliedJobs(updated);
    if (job._id) {
      fetch(`/api/jobs/${job._id}/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authUser.email }),
      })
        .then((res) => res.json())
        .then((updatedJob) => {
          setJobs((prev) => prev.map((item) => (item._id === updatedJob._id ? updatedJob : item)));
        })
        .catch(() => {});
    }
  };

  const handleAddPost = () => {
    setIsPostOpen(true);
  };

  const isTeacher = authUser?.role === "teacher";
  const isGuardian = authUser?.role === "student";

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/jobs");
        if (!response.ok) {
          throw new Error("Failed to load jobs.");
        }
        const data = await response.json();
        setJobs(data);
      } catch (error) {
        setLoadError(error.message || "Failed to load jobs.");
      } finally {
        setIsLoading(false);
      }
    };
    loadJobs();
  }, []);

  const handlePostJob = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      title: formData.get("title"),
      location: formData.get("location"),
      schedule: formData.get("schedule"),
      rate: formData.get("rate"),
      postedBy: authUser?.name ? `Guardian: ${authUser.name}` : "Guardian",
      postedByEmail: authUser?.email || "",
    };
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("Failed to post job.");
      }
      const data = await response.json();
      setJobs((prev) => [data, ...prev]);
      event.currentTarget.reset();
      setIsPostOpen(false);
    } catch (error) {
      setLoadError(error.message || "Failed to post job.");
    }
  };

  return (
    <div className="job-board">
      <header className="job-board-header">
        <div>
          <p className="eyebrow">Teacher Job Timeline</p>
          <h1>Job Board</h1>
          <p className="job-board-subtitle">
            Latest tuition jobs posted by teachers, shown in order.
          </p>
        </div>
        <div className="job-board-actions">
          {isGuardian && (
            <button className="btn btn-primary btn-icon" type="button" onClick={handleAddPost}>
              +
            </button>
          )}
        </div>
      </header>

      <div className="job-timeline">
        {isLoading ? (
          <div className="job-empty">
            <h3>Loading jobs...</h3>
            <p>Please wait a moment.</p>
          </div>
        ) : loadError ? (
          <div className="job-empty">
            <h3>{loadError}</h3>
            <p>Make sure the server is running.</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="job-empty">
            <h3>No jobs posted yet</h3>
            <p>Guardians can add new tuition posts from the dashboard.</p>
          </div>
        ) : (
          jobs.map((job, index) => (
            <article key={job._id || job.id} className="job-card">
              <div className="job-index">{String(index + 1).padStart(2, "0")}</div>
              <div className="job-body">
                <h2>{job.title}</h2>
                <p className="job-meta">{job.postedBy}</p>
                <div className="job-details">
                  <span>
                    <strong>Location:</strong> {job.location}
                  </span>
                  <span>
                    <strong>Schedule:</strong> {job.schedule}
                  </span>
                  <span>
                    <strong>Salary:</strong> {job.rate}
                  </span>
                </div>
              {isTeacher || !authUser ? (
                <div className="job-actions">
                  {appliedJobs.some((item) => item.id === (job._id || job.id)) ? (
                    <>
                      <button className="btn btn-primary" type="button" disabled>
                        Applied
                      </button>
                      <button className="btn btn-ghost" type="button" onClick={() => handleWithdraw(job)}>
                        Withdraw Apply
                      </button>
                    </>
                  ) : (
                    <button className="btn btn-primary" type="button" onClick={() => handleApply(job)}>
                      Apply
                    </button>
                  )}
                </div>
              ) : null}
              </div>
            </article>
          ))
        )}
      </div>
      {isPostOpen && (
        <div className="auth-overlay" role="dialog" aria-modal="true" aria-label="Create Job Post">
          <div className="auth-modal">
            <div className="auth-modal-header">
              <div>
                <h3>Create Job Post</h3>
                <p>Publish a new tuition opportunity.</p>
              </div>
              <button className="auth-close" type="button" onClick={() => setIsPostOpen(false)}>
                ?
              </button>
            </div>
            <form className="auth-form" onSubmit={handlePostJob}>
              <label className="form-group">
                <span>Title</span>
                <input type="text" name="title" placeholder="Physics Tutor - Class 10" required />
              </label>
              <label className="form-group">
                <span>Location</span>
                <input type="text" name="location" placeholder="Dhaka" required />
              </label>
              <label className="form-group">
                <span>Schedule</span>
                <input type="text" name="schedule" placeholder="Mon/Wed, 6:00pm - 8:00pm" required />
              </label>
              <label className="form-group">
                <span>Salary</span>
                <input type="text" name="rate" placeholder="BDT 6,000 / month" required />
              </label>
              <button className="btn btn-primary" type="submit">
                Post Job
              </button>
            </form>
          </div>
          <button className="auth-backdrop" type="button" onClick={() => setIsPostOpen(false)} />
        </div>
      )}
    </div>
  );
}

export default JobBoard;
