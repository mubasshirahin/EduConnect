import React, { useEffect, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

function JobBoard({ authUser, onRequireLogin }) {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [applyStatus, setApplyStatus] = useState({ type: "", message: "" });
  const [pendingApplyJob, setPendingApplyJob] = useState(null);
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isClassPickerOpen, setIsClassPickerOpen] = useState(false);
  const [isSubjectPickerOpen, setIsSubjectPickerOpen] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
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

  const subjectOptions = [
    "Bangla",
    "English",
    "Physics",
    "Chemistry",
    "Higher Math",
    "General Math",
    "Religion",
    "Bangladesh and Global Science",
    "Science",
    "Math",
    "Biology",
  ];

  const locationOptions = [
    "Adabor", "Aftabnagar", "Agargaon", "Airport Area", "Azimpur", "Badda", "Bakshi Bazar", "Banani", "Banglamotor", "Banasree", "Baridhara", "Basabo", "Bashundhara", "Bhatara", "Cantonment", "Chad Uddan", "Chak Bazar", "Dakshinkhan", "Darus Salam", "Demra", "Dhanmondi", "Dohar", "Elephant Road", "Farmgate", "Gabtoli", "Gandaria", "Gulistan", "Gulshan", "Hazaribagh", "Jatrabari", "Jigatola", "Jurain", "Kakrail", "Kalabagan", "Kamrangirchar", "Kanchpur", "Karwan Bazar", "Kawran Bazar", "Keraniganj", "Khilgaon", "Khilkhet", "Lalbagh", "Malibagh", "Mirpur", "Mohammadpur", "Motijheel", "Mugdapara", "Nawabganj", "New Market", "Niketon", "Nikunja", "Old Dhaka", "Paltan", "Panthapath", "Ramna", "Rampura", "Sabujbagh", "Savar", "Shahbagh", "Shahjadpur", "Shantinagar", "Shewrapara", "Shyamoli", "Sutrapur", "Tejgaon", "Tejgaon Industrial Area", "Tongi", "Turag", "Uttara", "Wari"
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
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data?.message || "Failed to apply for this job.");
          }
          return data;
        })
        .then((updatedJob) => {
          setJobs((prev) => prev.map((item) => (item._id === updatedJob._id ? updatedJob : item)));
          setApplyStatus({ type: "success", message: "Application submitted successfully." });
        })
        .catch((error) => {
          setApplyStatus({ type: "error", message: error.message || "Failed to apply for this job." });
        });
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

  const openApplyConfirmation = (job) => {
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

    setPendingApplyJob(job);
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
      setSelectedSubject("");
      setSelectedLocation("");
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

  useEffect(() => {
    if (!applyStatus.message) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setApplyStatus({ type: "", message: "" });
    }, 2500);

    return () => window.clearTimeout(timeoutId);
  }, [applyStatus]);

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
              <button className="auth-close" type="button" onClick={() => { setIsPostOpen(false); setSelectedClass(""); setSelectedSubject(""); setSelectedLocation(""); }}>
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
                <input
                  id="subject"
                  name="subject"
                  value={selectedSubject}
                  readOnly
                  onClick={() => setIsSubjectPickerOpen(true)}
                  placeholder="Select Subject"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="location">{t("jobBoard.fieldLocation")}</label>
                <input
                  id="location"
                  name="location"
                  value={selectedLocation}
                  readOnly
                  onClick={() => setIsLocationPickerOpen(true)}
                  placeholder="Select Location"
                  required
                />
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
                <button className="btn btn-ghost" type="button" onClick={() => { setIsPostOpen(false); setSelectedClass(""); setSelectedSubject(""); setSelectedLocation(""); }}>
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
                  className={`class-option-btn ${(isPostOpen ? selectedClass : filters.classLevel) === c ? "selected" : ""}`}
                  onClick={() => {
                    if (isPostOpen) setSelectedClass(c);
                    if (isFilterOpen) setFilters(prev => ({ ...prev, classLevel: c }));
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

      {isSubjectPickerOpen && (
        <div className="auth-overlay" style={{ zIndex: 1100 }}>
          <div className="auth-backdrop" onClick={() => setIsSubjectPickerOpen(false)} />
          <div className="auth-modal" style={{ maxWidth: "420px" }}>
            <div className="auth-modal-header">
              <div>
                <h3>Select Subject</h3>
                <p>Choose the subject for this tuition</p>
              </div>
              <button className="auth-close" type="button" onClick={() => setIsSubjectPickerOpen(false)}>
                ×
              </button>
            </div>
            <div className="class-grid">
              {subjectOptions.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`class-option-btn ${(isPostOpen ? selectedSubject : filters.subject) === s ? "selected" : ""}`}
                  onClick={() => {
                    if (isPostOpen) setSelectedSubject(s);
                    if (isFilterOpen) setFilters(prev => ({ ...prev, subject: s }));
                    setIsSubjectPickerOpen(false);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isLocationPickerOpen && (
        <div className="auth-overlay" style={{ zIndex: 1100 }}>
          <div className="auth-backdrop" onClick={() => setIsLocationPickerOpen(false)} />
          <div className="auth-modal" style={{ maxWidth: "600px" }}>
            <div className="auth-modal-header">
              <div>
                <h3>Select Location</h3>
                <p>Choose your area in Dhaka</p>
              </div>
              <button className="auth-close" type="button" onClick={() => setIsLocationPickerOpen(false)}>
                ×
              </button>
            </div>
            <div className="class-grid" style={{ maxHeight: "60vh", overflowY: "auto", paddingRight: "10px" }}>
              {locationOptions.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  className={`class-option-btn ${(isPostOpen ? selectedLocation : filters.location) === loc ? "selected" : ""}`}
                  onClick={() => {
                    if (isPostOpen) setSelectedLocation(loc);
                    if (isFilterOpen) setFilters(prev => ({ ...prev, location: loc }));
                    setIsLocationPickerOpen(false);
                  }}
                >
                  {loc}
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
                  readOnly
                  onClick={() => setIsClassPickerOpen(true)}
                  placeholder="Select Class"
                />
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  id="subject"
                  name="subject"
                  value={filters.subject}
                  readOnly
                  onClick={() => setIsSubjectPickerOpen(true)}
                  placeholder="Select Subject"
                />
              </div>
              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  name="location"
                  value={filters.location}
                  readOnly
                  onClick={() => setIsLocationPickerOpen(true)}
                  placeholder="Select Location"
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

      {pendingApplyJob && (
        <div className="auth-overlay" role="dialog" aria-modal="true">
          <div className="auth-modal" style={{ maxWidth: "440px" }}>
            <div className="auth-modal-header">
              <div>
                <h3>Apply Confirmation</h3>
                <p>Are you sure to apply this job?</p>
              </div>
              <button className="auth-close" type="button" onClick={() => setPendingApplyJob(null)}>
                Ã—
              </button>
            </div>
            <div className="auth-form">
              <div className="form-group">
                <label>Job Title</label>
                <input value={pendingApplyJob.title || ""} readOnly />
              </div>
              <div className="job-board-actions" style={{ marginTop: "1rem" }}>
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => {
                    handleApply(pendingApplyJob);
                    setPendingApplyJob(null);
                  }}
                >
                  Yes, Apply
                </button>
                <button className="btn btn-ghost" type="button" onClick={() => setPendingApplyJob(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {sortedJobs.length > 0 ? (
        <div className="job-board-count">
          Showing {pageStart + 1}–{Math.min(pageStart + pageJobs.length, sortedJobs.length)} of {sortedJobs.length} jobs
        </div>
      ) : null}

      {applyStatus.message ? (
        <p className={`form-message ${applyStatus.type === "error" ? "form-error" : "form-success"}`}>
          {applyStatus.message}
        </p>
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
                        <button className="btn btn-primary" type="button" onClick={() => openApplyConfirmation(job)}>
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
