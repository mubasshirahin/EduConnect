import React from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

function StudentStatus() {
  const { t } = useLanguage();

  return (
    <section className="status-page">
      <div className="status-header">
        <h2>{t("dashboard.status")}</h2>
        <p>Students cannot publish job posts directly. Share your tutor requirements in Messages and admin will review them.</p>
      </div>

      <div className="status-stats">
        <div className="status-card">
          <h3>Admin Review</h3>
          <p>Your tuition request is collected through chat before any post goes live.</p>
        </div>
        <div className="status-card">
          <h3>Admin Posting</h3>
          <p>Only admins can publish verified job posts to the job board.</p>
        </div>
      </div>

      <div className="job-empty">
        <h3>No student posting tools here</h3>
        <p>Open Messages to send subject, class, area, schedule, and budget details to the admin team.</p>
        <button className="btn btn-primary" type="button" onClick={() => { window.location.hash = "#messages"; }}>
          Go to Messages
        </button>
      </div>
    </section>
  );
}

export default StudentStatus;
