import React, { useEffect, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

function StudentStatus({ authUser }) {
  const { t } = useLanguage();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRequests = async () => {
      if (!authUser?.email) {
        setRequests([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const response = await fetch(
          `/api/messages/tuition-requests?studentEmail=${encodeURIComponent(authUser.email)}`
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message || "Unable to load your tuition request status.");
        }
        setRequests(Array.isArray(data) ? data : []);
      } catch (loadError) {
        setRequests([]);
        setError(loadError.message || "Unable to load your tuition request status.");
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [authUser?.email]);

  const postedCount = requests.filter((request) => request.status === "accepted").length;
  const pendingCount = requests.filter((request) => request.status !== "accepted").length;

  return (
    <section className="status-page">
      <div className="status-header">
        <h2>{t("dashboard.status")}</h2>
        <p>Track which tuition requests are still under review and which ones have already been posted to the job board.</p>
      </div>

      <div className="status-stats">
        <div className="status-card">
          <h3>Job Posts Live</h3>
          <p>{postedCount} tuition request{postedCount === 1 ? "" : "s"} have already been accepted and published.</p>
        </div>
        <div className="status-card">
          <h3>Pending Review</h3>
          <p>{pendingCount} tuition request{pendingCount === 1 ? "" : "s"} are still waiting for admin approval.</p>
        </div>
      </div>

      {loading ? (
        <div className="job-empty">
          <h3>Loading your request status...</h3>
          <p>{t("jobBoard.loadingBody")}</p>
        </div>
      ) : error ? (
        <div className="job-empty">
          <h3>{error}</h3>
          <p>Please try again in a moment.</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="job-empty">
          <h3>No tuition request yet</h3>
          <p>Open Messages and send your subject, class, area, schedule, and budget details to the admin team.</p>
          <button className="btn btn-primary" type="button" onClick={() => { window.location.hash = "#messages"; }}>
            Go to Messages
          </button>
        </div>
      ) : (
        <div className="status-list">
          {requests.map((request) => (
            <article key={request.requestId || request.messageId} className="status-card">
              <div className="status-card-head">
                <h3>{request.fields?.subject ? `${request.fields.subject} Tutor Request` : "Tuition Request"}</h3>
                <span
                  className={`messages-request-status ${
                    request.status === "accepted"
                      ? "messages-request-status-accepted"
                      : "messages-request-status-pending"
                  }`}
                >
                  {request.status === "accepted" ? "Posted" : "Pending"}
                </span>
              </div>
              <div className="job-details">
                <span>
                  <strong>Class:</strong> {request.fields?.classLevel || "—"}
                </span>
                <span>
                  <strong>{t("jobBoard.location")}:</strong> {request.fields?.location || "—"}
                </span>
                <span>
                  <strong>{t("jobBoard.schedule")}:</strong> {request.fields?.schedule || "—"}
                </span>
                <span>
                  <strong>{t("jobBoard.salary")}:</strong> {request.fields?.budget || "—"}
                </span>
              </div>
              <p className="job-meta">
                Sent on {request.submittedAt ? new Date(request.submittedAt).toLocaleString() : "N/A"}
              </p>
              {request.status === "accepted" ? (
                <p className="status-inline-note">
                  This request was accepted{request.acceptedAt ? ` on ${new Date(request.acceptedAt).toLocaleString()}` : ""} and is now live on the job board.
                </p>
              ) : (
                <p className="status-inline-note">
                  Admin will review this request before it appears publicly on the job board.
                </p>
              )}
              <div className="status-card-actions">
                <a className="btn btn-ghost" href={request.status === "accepted" ? "#jobs" : "#messages"}>
                  {request.status === "accepted" ? "Open Job Board" : "Open Messages"}
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default StudentStatus;
