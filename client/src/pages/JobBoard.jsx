import React, { useEffect, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const REQUIRED_TEACHER_PROFILE_FIELDS = [
  "name",
  "email",
  "phone",
  "address",
  "bscCurriculum",
  "preferredClasses",
  "hscInstitute",
  "city",
  "emergencyName",
  "emergencyNumber",
  "idCardImage",
];

function JobBoard({ authUser, onRequireLogin }) {
  const { t } = useLanguage();
  const getIsMobileView = () => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.innerWidth <= 768;
  };
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
  const [isMobileView, setIsMobileView] = useState(getIsMobileView);
  const [currentPage, setCurrentPage] = useState(1);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [isTeacherProfileReady, setIsTeacherProfileReady] = useState(false);
  const [blockedApplyJobId, setBlockedApplyJobId] = useState("");
  const [expandedJobId, setExpandedJobId] = useState("");
  const [adminActionState, setAdminActionState] = useState({});
  const [filters, setFilters] = useState({
    classLevel: "",
    subject: "",
    location: "",
    minSalary: "",
    maxSalary: "",
  });
  const PAGE_SIZE = isMobileView ? 10 : 30;

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

  const getApplicantStatusMeta = (status) => {
    switch (status) {
      case "shortlisted":
        return { label: "Shortlisted", className: "messages-request-status-accepted" };
      case "profile_shared":
        return { label: "Shared to Guardian", className: "messages-request-status-accepted" };
      case "appointed":
        return { label: "Appointed", className: "messages-request-status-accepted" };
      case "confirmed":
      case "hired":
        return { label: "Confirmed", className: "messages-request-status-confirmed" };
      case "rejected":
        return { label: "Rejected", className: "messages-request-status-rejected" };
      default:
        return { label: "Pending", className: "messages-request-status-pending" };
    }
  };

  const getConfirmedApplicant = (job) =>
    Array.isArray(job?.applicants)
      ? job.applicants.find((applicant) => ["confirmed", "hired"].includes(applicant.status))
      : null;

  const getApplicantActionKey = (jobId, applicantEmail) => `${jobId}:${String(applicantEmail || "").toLowerCase()}`;

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
    if (authUser.role === "teacher" && !isTeacherProfileReady) {
      setBlockedApplyJobId(job?._id || "");
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
          setFilteredJobs((prev) =>
            Array.isArray(prev)
              ? prev.map((item) => (item._id === updatedJob._id ? updatedJob : item))
              : prev
          );
          setApplyStatus({ type: "success", message: "Application submitted successfully." });
          setBlockedApplyJobId("");
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
          setFilteredJobs((prev) =>
            Array.isArray(prev)
              ? prev.map((item) => (item._id === updatedJob._id ? updatedJob : item))
              : prev
          );
      })
        .catch(() => {});
    }
  };

  const openApplyConfirmation = (job) => {
    if (!authUser) {
      onRequireLogin?.();
      return;
    }

    if (authUser.role === "teacher" && !isTeacherProfileReady) {
      setBlockedApplyJobId(job?._id || "");
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
  const isAdmin = authUser?.role === "admin";
  const displayedJobs = filteredJobs !== null ? filteredJobs : jobs;

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(getIsMobileView());
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (authUser?.role !== "teacher" || !authUser?.email) {
      setIsTeacherProfileReady(false);
      return;
    }

    const profileStorageKey = `educonnect-profile:${authUser.email}`;
    const syncTeacherProfileStatus = () => {
      const stored = localStorage.getItem(profileStorageKey);
      if (!stored) {
        setIsTeacherProfileReady(false);
        return;
      }

      try {
        const profile = JSON.parse(stored);
        const missingFields = REQUIRED_TEACHER_PROFILE_FIELDS.filter((field) => {
          const value = profile?.[field];
          return value === undefined || value === null || String(value).trim().length === 0;
        });
        setIsTeacherProfileReady(missingFields.length === 0);
      } catch {
        setIsTeacherProfileReady(false);
      }
    };

    syncTeacherProfileStatus();
    window.addEventListener("storage", syncTeacherProfileStatus);
    return () => window.removeEventListener("storage", syncTeacherProfileStatus);
  }, [authUser?.email, authUser?.role]);

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

    if (authUser) {
      const token = localStorage.getItem("educonnect-auth-token");
      fetch("/api/bookmarks", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSavedJobIds(data.map(job => String(job._id)));
        }
      })
      .catch(() => {});
    }
  }, [authUser]);

  const handleToggleBookmark = async (jobId) => {
    if (!authUser) {
      onRequireLogin?.();
      return;
    }
    const token = localStorage.getItem("educonnect-auth-token");
    if (!token) {
      setApplyStatus({ type: "error", message: "Please sign in again to save jobs." });
      return;
    }
    try {
      const res = await fetch(`/api/bookmarks/toggle/${jobId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSavedJobIds((data.savedJobs || []).map((id) => String(id)));
      } else {
        const data = await res.json();
        throw new Error(data?.message || "Unable to save this job.");
      }
    } catch (error) {
      setApplyStatus({ type: "error", message: error.message || "Unable to save this job." });
    }
  };
  const handlePostJob = async (event) => {
    event.preventDefault();
    if (!isAdmin) {
      setLoadError("Only admins can post jobs.");
      setIsPostOpen(false);
      return;
    }
    const form = event.currentTarget;
    const formData = new FormData(form);
    const token = localStorage.getItem("educonnect-auth-token");
    const payload = {
      title: formData.get("title"),
      classLevel: formData.get("classLevel"),
      subject: formData.get("subject"),
      location: formData.get("location"),
      schedule: formData.get("schedule"),
      rate: formData.get("rate"),
      postedBy: authUser?.name ? `Admin: ${authUser.name}` : "Admin",
      postedByEmail: authUser?.email || "",
    };
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to post job.");
      }
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

  const updateApplicantInJobs = (jobId, updatedApplicant, updatedJob = null) => {
    const syncCollection = (collection) =>
      collection.map((item) => {
        if (item._id !== jobId) {
          return item;
        }
        if (updatedJob) {
          return updatedJob;
        }
        return {
          ...item,
          applicants: (item.applicants || []).map((entry) =>
            entry.email === updatedApplicant.email ? updatedApplicant : entry
          ),
        };
      });

    setJobs((prev) => syncCollection(prev));
    setFilteredJobs((prev) => (Array.isArray(prev) ? syncCollection(prev) : prev));
  };

  const handleApplicantStatusUpdate = async (jobId, applicantEmail, payload, successMessage) => {
    const token = localStorage.getItem("educonnect-auth-token");
    const actionKey = getApplicantActionKey(jobId, applicantEmail);

    if (!token) {
      setAdminActionState((prev) => ({
        ...prev,
        [actionKey]: { type: "error", message: "Admin session not found. Please sign in again." },
      }));
      return;
    }

    setAdminActionState((prev) => ({
      ...prev,
      [actionKey]: { type: "loading", message: "Updating..." },
    }));

    try {
      const response = await fetch(
        `/api/jobs/${encodeURIComponent(jobId)}/applicants/${encodeURIComponent(applicantEmail)}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Unable to update applicant status.");
      }

      updateApplicantInJobs(jobId, data.applicant, data.job);
      setAdminActionState((prev) => ({
        ...prev,
        [actionKey]: { type: "success", message: successMessage || data?.message || "Updated." },
      }));
    } catch (error) {
      setAdminActionState((prev) => ({
        ...prev,
        [actionKey]: { type: "error", message: error.message || "Unable to update applicant status." },
      }));
    }
  };

  const handleShareTeacherProfile = async (jobId, applicantEmail) => {
    const token = localStorage.getItem("educonnect-auth-token");
    const actionKey = getApplicantActionKey(jobId, applicantEmail);
    let summary = "";
    const targetJob = jobs.find((item) => item._id === jobId);
    const targetApplicant = targetJob?.applicants?.find(
      (entry) => entry.email === String(applicantEmail || "").toLowerCase()
    );

    try {
      const rawProfile = localStorage.getItem(`educonnect-profile:${applicantEmail}`);
      if (rawProfile) {
        const profile = JSON.parse(rawProfile);
        summary = [
          profile?.phone ? `Phone: ${profile.phone}` : "",
          profile?.city ? `City: ${profile.city}` : "",
          profile?.location ? `Area: ${profile.location}` : "",
          profile?.preferredSubjects ? `Subjects: ${profile.preferredSubjects}` : "",
          profile?.preferredClasses ? `Classes: ${profile.preferredClasses}` : "",
          profile?.expectedSalary ? `Expected Salary: ${profile.expectedSalary}` : "",
        ]
          .filter(Boolean)
          .join(" | ");
      }
    } catch {
      summary = "";
    }

    if (!token) {
      setAdminActionState((prev) => ({
        ...prev,
        [actionKey]: { type: "error", message: "Admin session not found. Please sign in again." },
      }));
      return;
    }

    if (targetApplicant?.sharedWithGuardianAt) {
      setAdminActionState((prev) => ({
        ...prev,
        [actionKey]: { type: "success", message: "Teacher profile already shared with the guardian." },
      }));
      return;
    }

    setAdminActionState((prev) => ({
      ...prev,
      [actionKey]: { type: "loading", message: "Sharing profile..." },
    }));

    try {
      const response = await fetch(
        `/api/jobs/${encodeURIComponent(jobId)}/applicants/${encodeURIComponent(applicantEmail)}/share-profile`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ summary }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Unable to share the teacher profile.");
      }

      updateApplicantInJobs(jobId, data.applicant, data.job);
      setAdminActionState((prev) => ({
        ...prev,
        [actionKey]: { type: "success", message: data?.message || "Teacher profile shared." },
      }));
    } catch (error) {
      setAdminActionState((prev) => ({
        ...prev,
        [actionKey]: { type: "error", message: error.message || "Unable to share the teacher profile." },
      }));
    }
  };

  const handleIncrementDemoClass = (jobId, applicant) => {
    const actionKey = getApplicantActionKey(jobId, applicant.email);
    const demoCount = applicant.demoClassCount || 0;
    const allowedStatuses = ["appointed", "confirmed", "hired"];

    if (!allowedStatuses.includes(applicant.status)) {
      setAdminActionState((prev) => ({
        ...prev,
        [actionKey]: { type: "error", message: "Mark this teacher appointed before adding demo classes." },
      }));
      return;
    }

    if (demoCount >= 3) {
      setAdminActionState((prev) => ({
        ...prev,
        [actionKey]: { type: "success", message: "All 3 demo classes are already recorded." },
      }));
      return;
    }

    handleApplicantStatusUpdate(
      jobId,
      applicant.email,
      { action: "increment_demo" },
      "Demo class count updated."
    );
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
          <h1>{t("jobBoard.title")}</h1>
          <p className="job-board-subtitle">
            {t("jobBoard.subtitle")}
          </p>
        </div>
        <div className="job-board-actions">
          {isAdmin ? (
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
                ×
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
            {pageJobs.map((job, index) => {
              const confirmedApplicant = getConfirmedApplicant(job);

              return (
              <article key={job._id || job.id} className="job-card">
                <div className="job-index">{String(pageStart + index + 1).padStart(2, "0")}</div>
                <div className="job-body">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <h2>{job.title}</h2>
                  {authUser?.role === "teacher" ? (
                    <button
                      className={`btn-bookmark ${savedJobIds.includes(job._id) ? "active" : ""}`}
                      type="button"
                      onClick={() => handleToggleBookmark(job._id)}
                      title={savedJobIds.includes(job._id) ? "Remove from saved" : "Save for later"}
                    >
                      {savedJobIds.includes(job._id) ? "❤" : "♡"}
                    </button>
                  ) : null}
                </div>
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
                  {confirmedApplicant ? (
                    <p className="job-confirmed-note">
                      Teacher confirmed for this job: <strong>{confirmedApplicant.name || confirmedApplicant.email}</strong>
                    </p>
                  ) : null}
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
                        <button
                          className="btn btn-primary"
                          type="button"
                          onClick={() => openApplyConfirmation(job)}
                        >
                          {t("jobBoard.apply")}
                        </button>
                      )}
                    </div>
                  ) : null}
                  {isTeacher && !isTeacherProfileReady && blockedApplyJobId === job._id ? (
                    <p className="job-apply-warning">
                      Complete your profile to continue.
                      {" "}
                      <a href="#profile">Open Profile</a>
                    </p>
                  ) : null}
                  {isAdmin ? (
                    <section className="job-admin-panel">
                      <div className="job-admin-panel-head">
                        <div>
                          <h3>Applicants</h3>
                          <p>{job.applicants?.length || 0} teacher{job.applicants?.length === 1 ? "" : "s"} applied for this post.</p>
                        </div>
                        <button
                          className="btn btn-ghost"
                          type="button"
                          onClick={() => setExpandedJobId((prev) => (prev === job._id ? "" : job._id))}
                        >
                          {expandedJobId === job._id ? "Hide" : "Manage Applicants"}
                        </button>
                      </div>

                      {expandedJobId === job._id ? (
                        Array.isArray(job.applicants) && job.applicants.length > 0 ? (
                          <div className="job-admin-applicants">
                            {job.applicants.map((applicant) => {
                              const statusMeta = getApplicantStatusMeta(applicant.status);
                              const actionKey = getApplicantActionKey(job._id, applicant.email);
                              const actionState = adminActionState[actionKey];
                              const demoCount = applicant.demoClassCount || 0;
                              const isShortlisted = applicant.status === "shortlisted";
                              const isShared = applicant.status === "profile_shared";
                              const isAppointed = applicant.status === "appointed";
                              const isConfirmed = ["confirmed", "hired"].includes(applicant.status);

                              return (
                                <article key={applicant.email} className="job-applicant-card">
                                  <div className="job-applicant-head">
                                    <div>
                                      <h4>{applicant.name}</h4>
                                      <p>{applicant.email}</p>
                                    </div>
                                    <span className={`messages-request-status ${statusMeta.className}`}>
                                      {statusMeta.label}
                                    </span>
                                  </div>

                                  <div className="job-applicant-meta">
                                    <span>Applied: {applicant.appliedAt ? new Date(applicant.appliedAt).toLocaleDateString() : "N/A"}</span>
                                    <span>Demo Classes: {demoCount}/3</span>
                                  </div>

                                  <div className="job-actions">
                                    <a className="btn btn-ghost" href={`#applicant/${encodeURIComponent(applicant.email)}`}>
                                      View Profile
                                    </a>
                                    <button
                                      className={`btn ${isShortlisted ? "btn-primary" : "btn-ghost"}`}
                                      type="button"
                                      onClick={() =>
                                        handleApplicantStatusUpdate(
                                          job._id,
                                          applicant.email,
                                          { status: "shortlisted" },
                                          "Applicant shortlisted."
                                        )
                                      }
                                      disabled={actionState?.type === "loading"}
                                    >
                                      Shortlist
                                    </button>
                                    <button
                                      className={`btn ${isShared ? "btn-primary" : "btn-ghost"}`}
                                      type="button"
                                      onClick={() => handleShareTeacherProfile(job._id, applicant.email)}
                                      disabled={actionState?.type === "loading"}
                                    >
                                      Send to Guardian
                                    </button>
                                    <button
                                      className={`btn ${isAppointed ? "btn-primary" : "btn-ghost"}`}
                                      type="button"
                                      onClick={() =>
                                        handleApplicantStatusUpdate(
                                          job._id,
                                          applicant.email,
                                          { status: "appointed" },
                                          "Applicant marked as appointed."
                                        )
                                      }
                                      disabled={actionState?.type === "loading"}
                                    >
                                      Mark Appointed
                                    </button>
                                    <button
                                      className="btn btn-ghost"
                                      type="button"
                                      onClick={() => handleIncrementDemoClass(job._id, applicant)}
                                      disabled={actionState?.type === "loading"}
                                    >
                                      Add Demo Class
                                    </button>
                                    <button
                                      className={`btn ${isConfirmed ? "btn-primary" : "btn-ghost"}`}
                                      type="button"
                                      onClick={() =>
                                        handleApplicantStatusUpdate(
                                          job._id,
                                          applicant.email,
                                          { status: "confirmed" },
                                          "Job confirmed for this teacher."
                                        )
                                      }
                                      disabled={actionState?.type === "loading" || demoCount < 3}
                                    >
                                      Confirm Job
                                    </button>
                                  </div>

                                  {actionState?.message ? (
                                    <p className={`form-message ${actionState.type === "error" ? "form-error" : "form-success"}`}>
                                      {actionState.message}
                                    </p>
                                  ) : null}
                                </article>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="job-empty">
                            <h3>No applicants yet</h3>
                            <p>Teachers who apply to this post will appear here.</p>
                          </div>
                        )
                      ) : null}
                    </section>
                  ) : null}
              </div>
            </article>
              );
            })}
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

