import React, { useEffect, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

function JobBoard({ authUser, onRequireLogin }) {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isClassPickerOpen, setIsClassPickerOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    classLevel: "",
    subject: "",
    location: "",
    minSalary: "",
    maxSalary: "",
  });
  const PAGE_SIZE = 30;

  const classOptions = [
    "Play",
    "Nursery",
    "Kinder Garden",
    "Class-1",
    "Class-2",
    "Class-3",
    "Class-4",
    "Class-5",
    "Class-6",
    "Class-7",
    "Class-8",
    "Class-9",
    "Class-10",
    "Class-11",
    "Class-12",
  ];

  const parseSalary = (rate) => {
    const parsed = Number(String(rate).replace(/[^0-9.]/g, ""));
    return Number.isFinite(parsed) ? parsed : NaN;
  };

  const applyFilters = (event) => {
    if (event) event.preventDefault();
    const normalized = {
      classLevel: filters.classLevel.trim().toLowerCase(),
      subject: filters.subject.trim().toLowerCase(),
      location: filters.location.trim().toLowerCase(),
      minSalary: Number(filters.minSalary) || 0,
      maxSalary: Number(filters.maxSalary) || Infinity,
    };

    const newFiltered = jobs.filter((job) => {
      if (normalized.classLevel && !String(job.classLevel || "").toLowerCase().includes(normalized.classLevel)) return false;
      if (normalized.subject && !String(job.subject || "").toLowerCase().includes(normalized.subject)) return false;
      if (normalized.location && !String(job.location || "").toLowerCase().includes(normalized.location)) return false;

      const rate = parseSalary(job.rate);
      if (!Number.isNaN(rate)) {
        if (!Number.isNaN(normalized.minSalary) && rate < normalized.minSalary) return false;
        if (!Number.isNaN(normalized.maxSalary) && rate > normalized.maxSalary) return false;
      }

      return true;
    });

    setFilteredJobs(newFiltered);
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  const clearFilters = () => {
    setFilters({ classLevel: "", subject: "", location: "", minSalary: "", maxSalary: "" });
    setFilteredJobs(null);
    setCurrentPage(1);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

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

  const isTeacher = authUser?.role === "teacher";
  const isStudent = authUser?.role === "student";
  const displayedJobs = filteredJobs !== null ? filteredJobs : jobs;

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
        setCurrentPage(1);
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
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      title: formData.get("title"),
      classLevel: formData.get("classLevel"),
      subject: formData.get("subject"),
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
      setCurrentPage(1);
      form.reset();
      setSelectedClass("");
      setIsPostOpen(false);
    } catch (error) {
      setLoadError(error.message || "Failed to post job.");
    }
  };

  const sortedJobs = [...displayedJobs].sort((a, b) => {
    const getTime = (job) => {
      const stamp = job?.createdAt || job?.updatedAt || 0;
      const time = new Date(stamp).getTime();
      return Number.isFinite(time) ? time : 0;
    };
    return getTime(b) - getTime(a);
  });
  const totalPages = Math.ceil(sortedJobs.length / PAGE_SIZE);
  const safeTotalPages = Math.max(totalPages, 1);
  const safePage = Math.min(currentPage, safeTotalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageJobs = sortedJobs.slice(pageStart, pageStart + PAGE_SIZE);

  useEffect(() => {
    if (currentPage !== safePage) {
      setCurrentPage(safePage);
    }
  }, [currentPage, safePage]);

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
          {isStudent ? (
            <button className="btn btn-primary" type="button" onClick={() => setIsPostOpen(true)}>
              Create
            </button>
          ) : (
            <>
              <button className="btn btn-primary" type="button" onClick={() => setIsFilterOpen(true)}>
                Search
              </button>
              <button className="btn btn-primary" type="button" onClick={clearFilters}>
                Clear
              </button>
            </>
          )}
        </div>
      </header>

      {isPostOpen && (
        <div className="auth-overlay" role="dialog" aria-modal="true">
          <div className="auth-modal">
            <div className="auth-modal-header">
              <div>
                <h3>{t("jobBoard.createTitle")}</h3>
                <p>{t("jobBoard.createSubtitle")}</p>
              </div>
              <button className="auth-close" type="button" onClick={() => { setIsPostOpen(false); setSelectedClass(""); }}>
                ×
              </button>
            </div>
            <form className="auth-form" onSubmit={handlePostJob}>
              <div className="form-group">
                <label htmlFor="title">{t("jobBoard.fieldTitle")}</label>
                <input id="title" name="title" placeholder={t("jobBoard.titlePlaceholder")} required />
              </div>
              <div className="form-group">
                <label htmlFor="classLevel">Class</label>
                <input
                  id="classLevel"
                  name="classLevel"
                  value={selectedClass}
                  readOnly
                  onClick={() => setIsClassPickerOpen(true)}
                  placeholder="Select Class"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input id="subject" name="subject" placeholder="e.g. Physics" />
              </div>
              <div className="form-group">
                <label htmlFor="location">{t("jobBoard.fieldLocation")}</label>
                <input id="location" name="location" placeholder={t("jobBoard.location")} required />
              </div>
              <div className="form-group">
                <label htmlFor="schedule">{t("jobBoard.fieldSchedule")}</label>
                <input id="schedule" name="schedule" placeholder={t("jobBoard.schedule")} required />
              </div>
              <div className="form-group">
                <label htmlFor="rate">{t("jobBoard.fieldSalary")}</label>
                <input id="rate" name="rate" placeholder={t("jobBoard.salary")} required />
              </div>
              <div className="job-board-actions" style={{ marginTop: "1rem" }}>
                <button className="btn btn-primary" type="submit">
                  {t("jobBoard.postJob")}
                </button>
                <button className="btn btn-ghost" type="button" onClick={() => { setIsPostOpen(false); setSelectedClass(""); }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isClassPickerOpen && (
        <div className="auth-overlay" style={{ zIndex: 1100 }}>
          <div className="auth-backdrop" onClick={() => setIsClassPickerOpen(false)} />
          <div className="auth-modal" style={{ maxWidth: "420px" }}>
            <div className="auth-modal-header">
              <div>
                <h3>Select Class</h3>
                <p>Choose the class for this tuition</p>
              </div>
              <button className="auth-close" type="button" onClick={() => setIsClassPickerOpen(false)}>
                ×
              </button>
            </div>
            <div className="class-grid">
              {classOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`class-option-btn ${selectedClass === c ? "selected" : ""}`}
                  onClick={() => {
                    setSelectedClass(c);
                    setIsClassPickerOpen(false);
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isFilterOpen && (
        <div className="auth-overlay" role="dialog" aria-modal="true">
          <div className="auth-modal">
            <div className="auth-modal-header">
              <div>
                <h3>Search By Filters</h3>
                <p>Filter jobs by class, subject, location, salary</p>
              </div>
              <button className="auth-close" type="button" onClick={() => setIsFilterOpen(false)}>
                ×
              </button>
            </div>
            <form className="auth-form" onSubmit={applyFilters}>
              <div className="form-group">
                <label htmlFor="classLevel">Class</label>
                <input
                  id="classLevel"
                  name="classLevel"
                  value={filters.classLevel}
                  onChange={handleFilterChange}
                  placeholder="e.g. 10th, A-Level"
                />
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  id="subject"
                  name="subject"
                  value={filters.subject}
                  onChange={handleFilterChange}
                  placeholder="e.g. Math, Physics"
                />
              </div>
              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="e.g. London"
                />
              </div>
              <div className="form-group">
                <label htmlFor="minSalary">Min Salary</label>
                <input
                  id="minSalary"
                  name="minSalary"
                  type="number"
                  value={filters.minSalary}
                  onChange={handleFilterChange}
                  placeholder="e.g. 200"
                />
              </div>
              <div className="form-group">
                <label htmlFor="maxSalary">Max Salary</label>
                <input
                  id="maxSalary"
                  name="maxSalary"
                  type="number"
                  value={filters.maxSalary}
                  onChange={handleFilterChange}
                  placeholder="e.g. 1000"
                />
              </div>
              <div className="job-board-actions" style={{ marginTop: "1rem" }}>
                <button className="btn btn-primary" type="submit">
                  Search
                </button>
                <button className="btn btn-ghost" type="button" onClick={clearFilters}>
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {sortedJobs.length > 0 ? (
        <div className="job-board-count">
          Showing {pageStart + 1}–{Math.min(pageStart + pageJobs.length, sortedJobs.length)} of {sortedJobs.length} jobs
        </div>
      ) : null}

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
        ) : sortedJobs.length === 0 ? (
          <div className="job-empty">
            <h3>{t("jobBoard.emptyTitle")}</h3>
            <p>{t("jobBoard.emptyBody")}</p>
          </div>
        ) : (
          <>
            {pageJobs.map((job, index) => (
              <article key={job._id || job.id} className="job-card">
                <div className="job-index">{String(pageStart + index + 1).padStart(2, "0")}</div>
                <div className="job-body">
                <h2>{job.title}</h2>
                <p className="job-meta">{job.postedBy}</p>
                <div className="job-details">
                  <span>
                    <strong>Class:</strong> {job.classLevel || "—"}
                  </span>
                  <span>
                    <strong>Subject:</strong> {job.subject || "—"}
                  </span>
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
            ))}
          </>
        )}
      </div>

      {sortedJobs.length > 0 ? (
        <div className="job-pagination" role="navigation" aria-label="Job board pages">
          <button
            className="job-page-button"
            type="button"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={safePage === 1}
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, index) => {
            const page = index + 1;
            const isActive = page === safePage;
            return (
              <button
                key={page}
                className={`job-page-button ${isActive ? "job-page-button-active" : ""}`}
                type="button"
                onClick={() => setCurrentPage(page)}
                aria-current={isActive ? "page" : undefined}
              >
                {page}
              </button>
            );
          })}
          <button
            className="job-page-button"
            type="button"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={safePage === totalPages}
          >
            Next
          </button>
        </div>
      ) : null}

      {sortedJobs.length > 0 ? (
        <div className="job-page-indicator">
          Page {safePage} of {totalPages}
        </div>
      ) : null}
    </div>
  );
}

export default JobBoard;
