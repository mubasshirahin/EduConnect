import React, { useEffect, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

function StudentStatus({ authUser }) {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalApplicants, setTotalApplicants] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isApplicantsOpen, setIsApplicantsOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  useEffect(() => {
    const loadStatus = async () => {
      if (!authUser?.email) {
        setJobs([]);
        setTotalPosts(0);
        setTotalApplicants(0);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await fetch(`/api/jobs?postedByEmail=${encodeURIComponent(authUser.email)}`);
        if (!response.ok) {
          throw new Error("Failed to load status.");
        }
        const jobs = await response.json();
        setJobs(jobs);
        setTotalPosts(jobs.length);
        const applicants = jobs.reduce((sum, job) => sum + (job.applicants?.length || 0), 0);
        setTotalApplicants(applicants);
      } catch {
        setJobs([]);
        setTotalPosts(0);
        setTotalApplicants(0);
      } finally {
        setLoading(false);
      }
    };
    loadStatus();
  }, [authUser]);

  return (
    <section className="status-page">
      <div className="status-header">
        <h2>{t("dashboard.status")}</h2>
        <p>{t("dashboard.statusSubtitle")}</p>
      </div>
      <div className="status-stats">
        <div className="status-card">
          <h3>{loading ? "..." : totalPosts}</h3>
          <p>{t("dashboard.jobsPosted")}</p>
        </div>
        <div className="status-card">
          <h3>{loading ? "..." : totalApplicants}</h3>
          <p>{t("dashboard.totalApplicants")}</p>
        </div>
      </div>
      <div className="status-list">
        {loading ? (
          <div className="job-empty">
            <h3>{t("dashboard.loadingJobs")}</h3>
            <p>{t("jobBoard.loadingBody")}</p>
          </div>
        ) : totalPosts === 0 ? (
          <div className="job-empty">
            <h3>{t("jobBoard.emptyTitle")}</h3>
            <p>{t("jobBoard.emptyBody")}</p>
          </div>
        ) : (
          jobs.map((job, index) => (
            <article key={job._id} className="job-card">
              <div className="job-index">{String(index + 1).padStart(2, "0")}</div>
              <div className="job-body">
                <h2>{job.title}</h2>
                <p className="job-meta">{t("dashboard.applicants")}: {job.applicants?.length || 0}</p>
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
                </div>
                <div className="job-actions">
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={() => {
                      setSelectedJob(job);
                      setSelectedApplicant(null);
                      setIsApplicantsOpen(true);
                    }}
                  >
                    {t("dashboard.applicants")}
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
      {isApplicantsOpen && (
        <div className="auth-overlay" role="dialog" aria-modal="true" aria-label={t("dashboard.applicants")}>
          <div className="auth-modal applicant-modal">
            <div className="auth-modal-header">
              <div>
                <h3>{t("dashboard.applicants")}</h3>
                <p>{selectedJob?.title}</p>
              </div>
              <button className="auth-close" type="button" onClick={() => setIsApplicantsOpen(false)}>
                ✕
              </button>
            </div>
            {selectedJob?.applicants?.length ? (
              <div className="applicants-grid">
                <div className="applicants-list">
                  {selectedJob.applicants.map((app) => (
                    <a
                      key={app.email}
                      className="applicant-item"
                      href={`#applicant/${encodeURIComponent(app.email)}`}
                      onClick={() => setSelectedApplicant(app)}
                    >
                      {app.name}
                    </a>
                  ))}
                </div>
                <div className="applicant-detail">
                  {selectedApplicant ? (
                    <>
                      <h4>{selectedApplicant.name}</h4>
                      <p>{t("profile.labels.email")}: {selectedApplicant.email}</p>
                      <p>
                        {t("dashboard.appliedDate")}
                        {selectedApplicant.appliedAt
                          ? new Date(selectedApplicant.appliedAt).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </>
                  ) : (
                    <p>{t("dashboard.selectToView")}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="job-empty">
                <h3>{t("dashboard.noApplicants")}</h3>
                <p>{t("dashboard.teachersWillAppear")}</p>
              </div>
            )}
          </div>
          <button className="auth-backdrop" type="button" onClick={() => setIsApplicantsOpen(false)} />
        </div>
      )}
    </section>
  );
}

export default StudentStatus;

