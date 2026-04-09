import React, { useEffect, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

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
      .then((jobs) => setAppliedJobs(jobs))
      .catch(() => setAppliedJobs([]))
      .finally(() => setLoading(false));
  }, [authUser]);

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
          {appliedJobs.map((job) => (
            <article key={job._id} className="status-card">
              <h3>{job.title}</h3>
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
              <p className="job-meta">
                {t("dashboard.appliedOn")}{" "}
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

