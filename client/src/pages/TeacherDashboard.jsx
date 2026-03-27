import React, { useEffect, useState } from "react";

function TeacherDashboard({ authUser }) {
  const [appliedCount, setAppliedCount] = useState(0);

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

  return (
    <div>
      <section className="notice-board">
        <div className="notice-header">
          <span className="notice-icon">NB</span>
          <h2>Notice Board</h2>
        </div>
        <p>
          Our &quot;Tutor of the Month, March 2026&quot; is Shahria Rahman Rafi (Tutor
          ID: 385346) and our &quot;Guardian of the Month, March 2026&quot; is Md.
          Mubarak Hossain (Guardian ID: 429325). Heartiest congratulations to
          both of them; we&apos;re glad to work with them.
        </p>
        <span className="notice-date">Mar 04, 2026</span>
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
            <h3>Shahria Rahman</h3>
            <p>ID: 385346</p>
          </div>
          <div className="tile-badge">★★★★★</div>
        </article>
        <article className="teacher-tile">
          <p className="tile-label">Nearby Jobs</p>
          <h3>3 new posts</h3>
          <p>Check the latest tuition requests around you.</p>
        </article>
        <article className="teacher-tile teacher-profile">
          <div className="progress-ring">100%</div>
          <div>
            <h3>Profile Completed</h3>
            <p>Keep your profile updated for faster matching.</p>
          </div>
        </article>
      </section>
    </div>
  );
}

export default TeacherDashboard;