import React, { useEffect, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const SHORTLISTED_STATUSES = ["shortlisted", "profile_shared"];
const APPOINTED_STATUSES = ["appointed"];
const CONFIRMED_STATUSES = ["confirmed", "hired"];

function TeacherDashboard({ authUser }) {
  const { language, t } = useLanguage();
  const [stats, setStats] = useState({
    appliedCount: 0,
    shortlistedCount: 0,
    appointedCount: 0,
    confirmedCount: 0,
  });
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [notice, setNotice] = useState(null);
  const isBangla = language === "bn";
  const copy = {
    noticeBoard: isBangla ? "নোটিশ বোর্ড" : "Notice Board",
    noticeFallbackTitle: isBangla ? "নোটিশ" : "Notice",
    noNotices: isBangla ? "এখন কোনো নোটিশ নেই।" : "No notices available right now.",
    shortlistedJobs: isBangla ? "শর্টলিস্টেড জব" : "Shortlisted Jobs",
    appointedJobs: isBangla ? "নিয়োগপ্রাপ্ত জব" : "Appointed Jobs",
    confirmedJobs: isBangla ? "নিশ্চিত জব" : "Confirmed Jobs",
    cancelledJobs: isBangla ? "বাতিল জব" : "Cancelled Jobs",
    tutorOfMonth: isBangla ? "মাসের সেরা টিউটর" : "Tutor of the Month",
    noTutorSelected: isBangla ? "এখনও কোনো টিউটর নির্বাচিত হয়নি" : "No tutor selected",
    electionPending: isBangla ? "নির্বাচন অপেক্ষমাণ" : "Election pending",
    nearbyJobs: isBangla ? "কাছাকাছি জব" : "Nearby Jobs",
    noJobs: isBangla ? "কোনো জব নেই" : "No Jobs",
    noNearbyJobs: isBangla ? "এখন কাছাকাছি কোনো টিউশন রিকোয়েস্ট নেই।" : "No nearby tuition requests right now.",
    profileCompleted: isBangla ? "প্রোফাইল সম্পন্ন" : "Profile Completed",
    profileCompletedDesc: isBangla ? "দ্রুত ম্যাচিংয়ের জন্য প্রোফাইল আপডেট রাখুন।" : "Keep your profile updated for faster matching.",
  };

  const renderStatIcon = (type) => {
    switch (type) {
      case "applied":
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 3h7l5 5v13H7z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 3v5h5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 13l1.8 1.8L15.5 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case "shortlisted":
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3l2.7 5.6 6.2.9-4.5 4.3 1.1 6.2L12 17.2 6.5 20l1.1-6.2-4.5-4.3 6.2-.9z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case "appointed":
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M5 20a7 7 0 0 1 14 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M17 7l1.4 1.4L21 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case "confirmed":
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M9.5 12.2l1.7 1.7 3.7-4.1" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M9 9l6 6M15 9l-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        );
    }
  };

  const renderNoticeIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 6.5A2.5 2.5 0 0 1 7.5 4H18v13H7.5A2.5 2.5 0 0 0 5 19.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 4A2.5 2.5 0 0 0 5 6.5v13A2.5 2.5 0 0 1 7.5 17H19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 8h6M9 11h6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );

  useEffect(() => {
    if (!authUser?.email) {
      setStats({
        appliedCount: 0,
        shortlistedCount: 0,
        appointedCount: 0,
        confirmedCount: 0,
      });
      return;
    }

    fetch(`/api/jobs?applicantEmail=${encodeURIComponent(authUser.email)}`)
      .then((res) => res.json())
      .then((jobs) => {
        const normalizedJobs = Array.isArray(jobs) ? jobs : [];
        const nextStats = normalizedJobs.reduce(
          (accumulator, job) => {
            const applicant = job.applicants?.find(
              (entry) => entry.email === authUser.email.toLowerCase()
            );

            if (!applicant) {
              return accumulator;
            }

            accumulator.appliedCount += 1;
            if (SHORTLISTED_STATUSES.includes(applicant.status)) {
              accumulator.shortlistedCount += 1;
            }
            if (APPOINTED_STATUSES.includes(applicant.status)) {
              accumulator.appointedCount += 1;
            }
            if (CONFIRMED_STATUSES.includes(applicant.status)) {
              accumulator.confirmedCount += 1;
            }
            return accumulator;
          },
          {
            appliedCount: 0,
            shortlistedCount: 0,
            appointedCount: 0,
            confirmedCount: 0,
          }
        );
        setStats(nextStats);
      })
      .catch(() =>
        setStats({
          appliedCount: 0,
          shortlistedCount: 0,
          appointedCount: 0,
          confirmedCount: 0,
        })
      );
  }, [authUser?.email]);

  useEffect(() => {
    const completionKey = authUser?.email
      ? `profileCompletionPercent:${authUser.email}`
      : "profileCompletionPercent:guest";
    const readCompletion = () => {
      const raw = localStorage.getItem(completionKey);
      const parsed = Number.parseInt(raw || "0", 10);
      const safe = Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : 0;
      setProfileCompletion(safe);
    };
    readCompletion();
    window.addEventListener("storage", readCompletion);
    return () => window.removeEventListener("storage", readCompletion);
  }, [authUser?.email]);

  useEffect(() => {
    const readNotice = () => {
      const stored = localStorage.getItem("educonnect-notice");
      if (!stored) {
        setNotice(null);
        return;
      }
      try {
        setNotice(JSON.parse(stored));
      } catch {
        setNotice(null);
      }
    };
    readNotice();
    window.addEventListener("storage", readNotice);
    window.addEventListener("notice-updated", readNotice);
    return () => {
      window.removeEventListener("storage", readNotice);
      window.removeEventListener("notice-updated", readNotice);
    };
  }, []);

  return (
    <div>
      <section className="notice-board">
        <div className="notice-header">
          <span className="notice-icon">{renderNoticeIcon()}</span>
          <h2>{copy.noticeBoard}</h2>
        </div>
        {notice?.body ? (
          <>
            <p>{notice.title || copy.noticeFallbackTitle}</p>
            <p>{notice.body}</p>
            {notice.date && <span className="notice-date">{notice.date}</span>}
          </>
        ) : (
          <p>{copy.noNotices}</p>
        )}
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">{renderStatIcon("applied")}</span>
          <div>
            <h3>{stats.appliedCount}</h3>
            <p>{t("dashboard.appliedJobs")}</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">{renderStatIcon("shortlisted")}</span>
          <div>
            <h3>{stats.shortlistedCount}</h3>
            <p>{copy.shortlistedJobs}</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">{renderStatIcon("appointed")}</span>
          <div>
            <h3>{stats.appointedCount}</h3>
            <p>{copy.appointedJobs}</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">{renderStatIcon("confirmed")}</span>
          <div>
            <h3>{stats.confirmedCount}</h3>
            <p>{copy.confirmedJobs}</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">{renderStatIcon("cancelled")}</span>
          <div>
            <h3>0</h3>
            <p>{copy.cancelledJobs}</p>
          </div>
        </div>
      </section>

      <section className="teacher-cards">
        <article className="teacher-tile teacher-highlight">
          <div>
            <p className="tile-label">{copy.tutorOfMonth}</p>
            <h3>{copy.noTutorSelected}</h3>
            <p>{copy.electionPending}</p>
          </div>
          <div className="tile-badge">-</div>
        </article>
        <article className="teacher-tile">
          <p className="tile-label">{copy.nearbyJobs}</p>
          <h3>{copy.noJobs}</h3>
          <p>{copy.noNearbyJobs}</p>
        </article>
        <article className="teacher-tile teacher-profile">
          <div className="progress-ring">{profileCompletion}%</div>
          <div>
            <h3>{copy.profileCompleted}</h3>
            <p>{copy.profileCompletedDesc}</p>
          </div>
        </article>
      </section>
    </div>
  );
}

export default TeacherDashboard;
