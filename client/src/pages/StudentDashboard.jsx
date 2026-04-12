import React, { useEffect, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

function StudentDashboard({ user }) {
  const { language, t } = useLanguage();
  const [notice, setNotice] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [requestStats, setRequestStats] = useState({
    totalRequests: 0,
    liveRequests: 0,
    pendingRequests: 0,
    latestRequest: null,
  });
  const [messageStats, setMessageStats] = useState({
    totalThreads: 0,
    teacherProfilesShared: 0,
    appointedTeachers: 0,
    confirmedMatches: 0,
  });
  const isBangla = language === "bn";
  const copy = {
    noticeBoard: isBangla ? "নোটিশ বোর্ড" : "Notice Board",
    noticeFallbackTitle: isBangla ? "নোটিশ" : "Notice",
    noNotices: isBangla ? "এখন কোনো নোটিশ নেই।" : "No notices available right now.",
    studentOverview: isBangla ? "স্টুডেন্ট ওভারভিউ" : "Student Overview",
    studentWelcome: isBangla ? "আপনার টিউশন অনুরোধ, মেসেজ এবং ম্যাচিং অগ্রগতি এক জায়গায়।" : "Keep your tuition requests, messages, and tutor matching progress in one place.",
    totalRequests: isBangla ? "মোট অনুরোধ" : "Total Requests",
    livePosts: isBangla ? "লাইভ পোস্ট" : "Live Posts",
    pendingReview: isBangla ? "রিভিউ চলছে" : "Pending Review",
    sharedProfiles: isBangla ? "শেয়ারকৃত প্রোফাইল" : "Shared Profiles",
    appointedTeachers: isBangla ? "নির্বাচিত শিক্ষক" : "Appointed Teachers",
    confirmedMatches: isBangla ? "নিশ্চিত ম্যাচ" : "Confirmed Matches",
    nextStep: isBangla ? "পরবর্তী করণীয়" : "Next Step",
    nextStepReadyTitle: isBangla ? "এখন শিক্ষক প্রোফাইল দেখুন" : "Review teacher profiles now",
    nextStepReadyBody: isBangla ? "অ্যাডমিন কিছু শিক্ষক সাজেস্ট করেছে। প্রোফাইল দেখে দ্রুত সিদ্ধান্ত নিন।" : "Admins have already shared teacher options. Compare profiles and move quickly.",
    nextStepPostTitle: isBangla ? "আরও টিউশন অনুরোধ পাঠাতে পারেন" : "You can post more tuition requests",
    nextStepPostBody: isBangla ? "বিষয়, ক্লাস, এলাকা আর বাজেট উল্লেখ করে নতুন অনুরোধ পাঠালে ম্যাচ দ্রুত আসে।" : "Sending another well-detailed request can help you find the right tutor faster.",
    nextStepPendingTitle: isBangla ? "আপনার অনুরোধ রিভিউতে আছে" : "Your request is under review",
    nextStepPendingBody: isBangla ? "অ্যাডমিন অনুমোদন দিলেই এটি জব বোর্ডে যাবে। এর মধ্যে প্রোফাইল সম্পূর্ণ রাখুন।" : "Once approved by admin, it will appear on the job board. Meanwhile, keep your profile complete.",
    requestActivity: isBangla ? "রিকোয়েস্ট অ্যাক্টিভিটি" : "Request Activity",
    noRequestsTitle: isBangla ? "এখনও কোনো টিউশন অনুরোধ নেই" : "No tuition request yet",
    noRequestsBody: isBangla ? "মেসেজেস থেকে আপনার প্রথম টিউশন রিকোয়েস্ট পাঠান।" : "Open Messages and send your first tuition request.",
    latestRequest: isBangla ? "সর্বশেষ অনুরোধ" : "Latest Request",
    latestRequestFallback: isBangla ? "সাম্প্রতিক অনুরোধ পাওয়া যায়নি।" : "No recent request found yet.",
    matchingProgress: isBangla ? "ম্যাচিং অগ্রগতি" : "Matching Progress",
    matchingBody: isBangla ? "আপনার ইনবক্সে অ্যাডমিন এবং শিক্ষক যোগাযোগের অগ্রগতি এখানে দেখা যাবে।" : "Your inbox activity with admins and teachers is summarized here.",
    conversations: isBangla ? "কথোপকথন" : "Conversations",
    profileCompleted: isBangla ? "প্রোফাইল সম্পন্ন" : "Profile Completed",
    profileCompletedDesc: isBangla ? "পূর্ণ প্রোফাইল থাকলে দ্রুত রেসপন্স এবং ভালো ম্যাচ পাওয়া সহজ হয়।" : "A complete profile helps admins and teachers respond with better matches.",
    openMessages: isBangla ? "মেসেজ খুলুন" : "Open Messages",
    openStatus: isBangla ? "স্ট্যাটাস দেখুন" : "View Status",
    browseJobs: isBangla ? "জব বোর্ড" : "Browse Jobs",
    editProfile: isBangla ? "প্রোফাইল আপডেট" : "Update Profile",
    classLevel: isBangla ? "শ্রেণি" : "Class",
    location: isBangla ? "লোকেশন" : "Location",
    schedule: isBangla ? "সময়" : "Schedule",
    budget: isBangla ? "বাজেট" : "Budget",
    posted: isBangla ? "পোস্টেড" : "Posted",
    pending: isBangla ? "পেন্ডিং" : "Pending",
  };

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

  useEffect(() => {
    const completionKey = user?.email
      ? `profileCompletionPercent:${user.email}`
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
  }, [user?.email]);

  useEffect(() => {
    const loadRequestStats = async () => {
      if (!user?.email) {
        setRequestStats({
          totalRequests: 0,
          liveRequests: 0,
          pendingRequests: 0,
          latestRequest: null,
        });
        return;
      }

      try {
        const response = await fetch(
          `/api/messages/tuition-requests?studentEmail=${encodeURIComponent(user.email)}`
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message || "Unable to load tuition requests.");
        }

        const requests = Array.isArray(data) ? data : [];
        setRequestStats({
          totalRequests: requests.length,
          liveRequests: requests.filter((request) => request.status === "accepted").length,
          pendingRequests: requests.filter((request) => request.status !== "accepted").length,
          latestRequest: requests[0] || null,
        });
      } catch {
        setRequestStats({
          totalRequests: 0,
          liveRequests: 0,
          pendingRequests: 0,
          latestRequest: null,
        });
      }
    };

    loadRequestStats();
  }, [user?.email]);

  useEffect(() => {
    const loadMessageStats = async () => {
      if (!user?.email) {
        setMessageStats({
          totalThreads: 0,
          teacherProfilesShared: 0,
          appointedTeachers: 0,
          confirmedMatches: 0,
        });
        return;
      }

      try {
        const response = await fetch(`/api/messages?user=${encodeURIComponent(user.email)}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message || "Unable to load conversations.");
        }

        const threads = Array.isArray(data) ? data : [];
        const updates = threads.flatMap((thread) =>
          (thread.messages || [])
            .map((message) => message.jobApplicationUpdate)
            .filter(Boolean)
        );

        setMessageStats({
          totalThreads: threads.length,
          teacherProfilesShared: updates.filter((update) => update.type === "teacher_profile_shared").length,
          appointedTeachers: updates.filter((update) => update.type === "teacher_appointed").length,
          confirmedMatches: updates.filter((update) => update.type === "job_confirmed").length,
        });
      } catch {
        setMessageStats({
          totalThreads: 0,
          teacherProfilesShared: 0,
          appointedTeachers: 0,
          confirmedMatches: 0,
        });
      }
    };

    loadMessageStats();
  }, [user?.email]);

  const nextStep =
    messageStats.teacherProfilesShared > 0
      ? {
          title: copy.nextStepReadyTitle,
          body: copy.nextStepReadyBody,
          href: "#messages?view=teacher",
          label: copy.openMessages,
        }
      : requestStats.totalRequests === 0
        ? {
            title: copy.nextStepPostTitle,
            body: copy.nextStepPostBody,
            href: "#messages",
            label: copy.openMessages,
          }
        : requestStats.pendingRequests > 0
          ? {
              title: copy.nextStepPendingTitle,
              body: copy.nextStepPendingBody,
              href: "#status",
              label: copy.openStatus,
            }
          : {
              title: copy.nextStepPostTitle,
              body: copy.nextStepPostBody,
              href: "#jobs",
              label: copy.browseJobs,
            };

  const latestRequest = requestStats.latestRequest;

  const renderNoticeIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 6.5A2.5 2.5 0 0 1 7.5 4H18v13H7.5A2.5 2.5 0 0 0 5 19.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 4A2.5 2.5 0 0 0 5 6.5v13A2.5 2.5 0 0 1 7.5 17H19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 8h6M9 11h6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );

  const renderStatIcon = (type) => {
    switch (type) {
      case "requests":
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 3h10a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2V5a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 8h6M9 12h6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        );
      case "live":
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 7h18v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 11h18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 15l2 2 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case "pending":
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 8v4l2.5 1.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case "profiles":
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M5 20a7 7 0 0 1 14 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M9.5 12.2l1.7 1.7 3.7-4.1" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
    }
  };

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

      <section className="settings-hero student-dashboard-hero">
        <div>
          <p className="tile-label">{copy.studentOverview}</p>
          <h2>{t("dashboard.studentDashboard")}</h2>
          <p>{copy.studentWelcome}</p>
        </div>
        <div className="student-dashboard-hero-actions">
          <a className="btn btn-primary" href="#messages">
            {copy.openMessages}
          </a>
          <a className="btn btn-ghost" href="#jobs">
            {copy.browseJobs}
          </a>
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">{renderStatIcon("requests")}</span>
          <div>
            <h3>{requestStats.totalRequests}</h3>
            <p>{copy.totalRequests}</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">{renderStatIcon("live")}</span>
          <div>
            <h3>{requestStats.liveRequests}</h3>
            <p>{copy.livePosts}</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">{renderStatIcon("pending")}</span>
          <div>
            <h3>{requestStats.pendingRequests}</h3>
            <p>{copy.pendingReview}</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">{renderStatIcon("profiles")}</span>
          <div>
            <h3>{messageStats.teacherProfilesShared}</h3>
            <p>{copy.sharedProfiles}</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">{renderStatIcon("confirmed")}</span>
          <div>
            <h3>{messageStats.confirmedMatches}</h3>
            <p>{copy.confirmedMatches}</p>
          </div>
        </div>
      </section>

      <section className="teacher-cards">
        <article className="teacher-tile teacher-highlight">
          <div>
            <p className="tile-label">{copy.nextStep}</p>
            <h3>{nextStep.title}</h3>
            <p>{nextStep.body}</p>
          </div>
          <a className="btn btn-primary student-dashboard-tile-button" href={nextStep.href}>
            {nextStep.label}
          </a>
        </article>

        <article className="teacher-tile">
          <p className="tile-label">{copy.requestActivity}</p>
          {latestRequest ? (
            <>
              <h3>{latestRequest.fields?.subject ? `${latestRequest.fields.subject} Tutor Request` : copy.latestRequest}</h3>
              <div className="student-dashboard-request-meta">
                <span><strong>{copy.classLevel}:</strong> {latestRequest.fields?.classLevel || "-"}</span>
                <span><strong>{copy.location}:</strong> {latestRequest.fields?.location || "-"}</span>
                <span><strong>{copy.schedule}:</strong> {latestRequest.fields?.schedule || "-"}</span>
                <span><strong>{copy.budget}:</strong> {latestRequest.fields?.budget || "-"}</span>
              </div>
              <p>
                {latestRequest.status === "accepted" ? copy.posted : copy.pending}
              </p>
              <a className="btn btn-ghost student-dashboard-tile-button" href="#status">
                {copy.openStatus}
              </a>
            </>
          ) : (
            <>
              <h3>{copy.noRequestsTitle}</h3>
              <p>{copy.noRequestsBody}</p>
              <a className="btn btn-ghost student-dashboard-tile-button" href="#messages">
                {copy.openMessages}
              </a>
            </>
          )}
        </article>

        <article className="teacher-tile teacher-profile">
          <div className="progress-ring">{profileCompletion}%</div>
          <div className="student-dashboard-profile-copy">
            <p className="tile-label">{copy.matchingProgress}</p>
            <h3>{copy.profileCompleted}</h3>
            <p>{copy.profileCompletedDesc}</p>
            <div className="student-dashboard-inline-stats">
              <span>{copy.conversations}: {messageStats.totalThreads}</span>
              <span>{copy.sharedProfiles}: {messageStats.teacherProfilesShared}</span>
              <span>{copy.appointedTeachers}: {messageStats.appointedTeachers}</span>
            </div>
            <a className="btn btn-ghost student-dashboard-tile-button" href="#profile">
              {copy.editProfile}
            </a>
          </div>
        </article>
      </section>
    </div>
  );
}

export default StudentDashboard;
