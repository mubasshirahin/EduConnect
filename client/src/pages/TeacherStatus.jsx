import React, { useEffect, useState } from "react";

function TeacherStatus({ authUser }) {
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

  return (
    <section className="status-page">
      <div className="status-header">
        <h2>Applied Jobs</h2>
        <p>All the posts you have applied to.</p>
      </div>
      {appliedJobs.length === 0 ? (
        <div className="job-empty">
          <h3>No applied jobs yet</h3>
          <p>Apply to a job from the Job Board to see it here.</p>
        </div>
      ) : (
        <div className="status-list">
          {appliedJobs.map((job) => (
            <article key={job.id} className="status-card">
              <h3>{job.title}</h3>
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
              <p className="job-meta">Applied on {job.appliedAt}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default TeacherStatus;
