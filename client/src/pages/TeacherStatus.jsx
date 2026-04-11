import React, { useEffect, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const STATUS_COPY = {
  pending: { label: "Applied", className: "messages-request-status-pending" },
  shortlisted: { label: "Shortlisted", className: "messages-request-status-accepted" },
  profile_shared: { label: "Shared to Guardian", className: "messages-request-status-accepted" },
  appointed: { label: "Appointed", className: "messages-request-status-appointed" },
  confirmed: { label: "Confirmed", className: "messages-request-status-confirmed" },
  hired: { label: "Confirmed", className: "messages-request-status-confirmed" },
  rejected: { label: "Rejected", className: "messages-request-status-rejected" },
};

function TeacherStatus({ authUser }) {
  const { t } = useLanguage();
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
      .then((jobs) => setAppliedJobs(Array.isArray(jobs) ? jobs : []))
      .catch(() => setAppliedJobs([]))
      .finally(() => setLoading(false));
  }, [authUser?.email]);

  return (
    <section className="status-page">
      <div className="status-header">
        <h2>{t("dashboard.appliedJobs")}</h2>
        <p>{t("dashboard.appliedJobsDesc")}</p>
      </div>
      {loading ? (
        <div className="job-empty">
          <h3>{t("dashboard.loadingJobs")}</h3>
          <p>{t("jobBoard.loadingBody")}</p>
        </div>
      ) : appliedJobs.length === 0 ? (
        <div className="job-empty">
          <h3>{t("dashboard.noAppliedJobs")}</h3>
          <p>{t("dashboard.applyToSee")}</p>
        </div>
      ) : (
        <div className="status-list">
          {appliedJobs.map((job) => {
            const applicant = job.applicants?.find(
              (entry) => entry.email === authUser?.email?.toLowerCase()
            );
            const statusMeta = STATUS_COPY[applicant?.status] || STATUS_COPY.pending;

            return (
              <article key={job._id} className="status-card">
                <div className="status-card-head">
                  <h3>{job.title}</h3>
                  <span className={`messages-request-status ${statusMeta.className}`}>
                    {statusMeta.label}
                  </span>
                </div>
                <div className="job-details">
                  <span>
                    <strong>{t("jobBoard.location")}:</strong> {job.location}
                  </span>
                  <span>
                    <strong>{t("jobBoard.schedule")}:</strong> {job.schedule}
                  </span>
                  <span>
                    <strong>{t("jobBoard.salary")}:</strong> {job.rate}
                  </span>
                  <span>
                    <strong>Demo Classes:</strong> {applicant?.demoClassCount || 0}/3
                  </span>
                </div>
                <p className="job-meta">
                  {t("dashboard.appliedOn")}{" "}
                  {applicant?.appliedAt
                    ? new Date(applicant.appliedAt).toLocaleDateString()
                    : "N/A"}
                </p>
                {applicant?.status === "profile_shared" ? (
                  <p className="status-inline-note">
                    Your profile has been sent to the guardian. Admin is waiting for the final selection.
                  </p>
                ) : null}
                {applicant?.status === "appointed" ? (
                  <p className="status-inline-note">
                    You were appointed for this tuition. Demo progress: {applicant?.demoClassCount || 0}/3 classes completed.
                  </p>
                ) : null}
                {(applicant?.status === "confirmed" || applicant?.status === "hired") ? (
                  <p className="status-inline-note">
                    This tuition is now confirmed for you.
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default TeacherStatus;
