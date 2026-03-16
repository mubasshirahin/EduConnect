import React, { useEffect, useState } from "react";

function TeacherStatus({ authUser }) {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authUser?.email) {
      setAppliedJobs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/jobs?applicantEmail=${encodeURIComponent(authUser.email)}`)
      .then((res) => res.json())
      .then((jobs) => setAppliedJobs(jobs))
      .catch(() => setAppliedJobs([]))
      .finally(() => setLoading(false));
  }, [authUser]);

  return (
    <section className="status-page">
      <div className="status-header">
        <h2>Applied Jobs</h2>
        <p>All the posts you have applied to.</p>
      </div>
      {loading ? (
        <div className="job-empty">
          <h3>Loading applied jobs...</h3>
          <p>Please wait a moment.</p>
        </div>
      ) : appliedJobs.length === 0 ? (
        <div className="job-empty">
          <h3>No applied jobs yet</h3>
          <p>Apply to a job from the Job Board to see it here.</p>
        </div>
      ) : (
        <div className="status-list">
          {appliedJobs.map((job) => (
            <article key={job._id} className="status-card">
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
              <p className="job-meta">
                Applied on{" "}
                {job.applicants
                  ?.find((app) => app.email === authUser?.email?.toLowerCase())
                  ?.appliedAt
                  ? new Date(
                      job.applicants.find((app) => app.email === authUser?.email?.toLowerCase())
                        .appliedAt
                    ).toLocaleDateString()
                  : "N/A"}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default TeacherStatus;
