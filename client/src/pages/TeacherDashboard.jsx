import React, { useEffect, useState } from "react";
import ReviewSubmissionCard from "../components/ReviewSubmissionCard";

function TeacherDashboard({ authUser }) {
  const [appliedCount, setAppliedCount] = useState(0);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (!authUser?.email) {
      setAppliedCount(0);
      return;
    }
    fetch(`/api/jobs?applicantEmail=${encodeURIComponent(authUser.email)}`)
      .then((res) => res.json())
      .then((jobs) => setAppliedCount(jobs.length))
      .catch(() => setAppliedCount(0));
  }, [authUser]);

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
          <span className="notice-icon">NB</span>
          <h2>Notice Board</h2>
        </div>
        {notice?.body ? (
          <>
            <p>{notice.title || "Notice"}</p>
            <p>{notice.body}</p>
            {notice.date && <span className="notice-date">{notice.date}</span>}
          </>
        ) : (
          <p>No notices available right now.</p>
        )}
      </section>

        <section className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon">AP</span>
            <div>
              <h3>{appliedCount}</h3>
              <p>Applied Jobs</p>
            </div>
          </div>
        <div className="stat-card">
          <span className="stat-icon">SJ</span>
          <div>
            <h3>0</h3>
            <p>Shortlisted Jobs</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">AJ</span>
          <div>
            <h3>0</h3>
            <p>Appointed Jobs</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">CJ</span>
          <div>
            <h3>0</h3>
            <p>Confirmed Jobs</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">XJ</span>
          <div>
            <h3>0</h3>
            <p>Cancelled Jobs</p>
          </div>
        </div>
      </section>

      <section className="teacher-cards">
        <article className="teacher-tile teacher-highlight">
          <div>
            <p className="tile-label">Tutor of the Month</p>
            <h3>No tutor selected</h3>
            <p>Election pending</p>
          </div>
          <div className="tile-badge">—</div>
        </article>
        <article className="teacher-tile">
          <p className="tile-label">Nearby Jobs</p>
          <h3>No Jobs</h3>
          <p>No nearby tuition requests right now.</p>
        </article>
        <article className="teacher-tile teacher-profile">
          <div className="progress-ring">{profileCompletion}%</div>
          <div>
            <h3>Profile Completed</h3>
            <p>Keep your profile updated for faster matching.</p>
          </div>
        </article>
      </section>

      <ReviewSubmissionCard
        authorName={authUser?.name}
        role="teacher"
        title="Share your teaching experience"
        description="Leave a short review about how EduConnect is working for you as a teacher."
      />
    </div>
  );
}

export default TeacherDashboard;
