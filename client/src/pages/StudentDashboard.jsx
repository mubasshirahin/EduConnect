import React, { useEffect, useState } from "react";
import ReviewSubmissionCard from "../components/ReviewSubmissionCard";

function StudentDashboard({ user, onLogout }) {
  const [notice, setNotice] = useState(null);

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
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Student Dashboard</h1>
      </header>
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
      <section className="dashboard-card">
        <h2>Welcome</h2>
        <p>Here you will manage tutor requests and chat with admins.</p>
      </section>

      <ReviewSubmissionCard
        authorName={user?.name}
        role="student"
        title="Share your learning experience"
        description="Tell others how EduConnect helped you find a tutor or manage your learning needs."
      />
    </div>
  );
}

export default StudentDashboard;
//ratri
