import React, { useEffect, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

function JobBoard({ authUser, onRequireLogin }) {
  const { t } = useLanguage();
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const handleApply = (job) => {
    if (!authUser) {
      onRequireLogin?.();
      return;
    }
    if (!authUser.email) {
      return;
    }
    const alreadyApplied = job.applicants?.some((app) => app.email === authUser.email.toLowerCase());
    if (alreadyApplied) {
      return;
    }
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
  };

  const handleWithdraw = (job) => {
    if (!authUser?.email) {
      return;
    }
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
          <p className="eyebrow">{t("jobBoard.eyebrow")}</p>
          <h1>{t("jobBoard.title")}</h1>
          <p className="job-board-subtitle">
            {t("jobBoard.subtitle")}
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
            <h3>{t("jobBoard.loadingTitle")}</h3>
            <p>{t("jobBoard.loadingBody")}</p>
          </div>
        ) : loadError ? (
          <div className="job-empty">
            <h3>{loadError}</h3>
            <p>{t("jobBoard.errorBody")}</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="job-empty">
            <h3>{t("jobBoard.emptyTitle")}</h3>
            <p>{t("jobBoard.emptyBody")}</p>
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
                    <strong>{t("jobBoard.location")}:</strong> {job.location}
                  </span>
                  <span>
                    <strong>{t("jobBoard.schedule")}:</strong> {job.schedule}
                  </span>
                  <span>
                    <strong>{t("jobBoard.salary")}:</strong> {job.rate}
                  </span>
                </div>
                  {isTeacher || !authUser ? (
                    <div className="job-actions">
                      {job.applicants?.some((app) => app.email === authUser?.email?.toLowerCase()) ? (
                        <>
                          <button className="btn btn-primary" type="button" disabled>
                            {t("jobBoard.applied")}
                          </button>
                          <button className="btn btn-ghost" type="button" onClick={() => handleWithdraw(job)}>
                            {t("jobBoard.withdraw")}
                          </button>
                        </>
                      ) : (
                        <button className="btn btn-primary" type="button" onClick={() => handleApply(job)}>
                          {t("jobBoard.apply")}
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
        <div className="auth-overlay" role="dialog" aria-modal="true" aria-label={t("jobBoard.createTitle")}>
          <div className="auth-modal">
            <div className="auth-modal-header">
              <div>
                <h3>{t("jobBoard.createTitle")}</h3>
                <p>{t("jobBoard.createSubtitle")}</p>
              </div>
              <button className="auth-close" type="button" onClick={() => setIsPostOpen(false)}>
                ?
              </button>
            </div>
            <form className="auth-form" onSubmit={handlePostJob}>
              <label className="form-group">
                <span>{t("jobBoard.fieldTitle")}</span>
                <input type="text" name="title" placeholder={t("jobBoard.titlePlaceholder")} required />
              </label>
              <label className="form-group">
                <span>{t("jobBoard.fieldLocation")}</span>
                <input type="text" name="location" placeholder={t("jobBoard.locationPlaceholder")} required />
              </label>
              <label className="form-group">
                <span>{t("jobBoard.fieldSchedule")}</span>
                <input type="text" name="schedule" placeholder={t("jobBoard.schedulePlaceholder")} required />
              </label>
              <label className="form-group">
                <span>{t("jobBoard.fieldSalary")}</span>
                <input type="text" name="rate" placeholder={t("jobBoard.salaryPlaceholder")} required />
              </label>
              <button className="btn btn-primary" type="submit">
                {t("jobBoard.postJob")}
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
