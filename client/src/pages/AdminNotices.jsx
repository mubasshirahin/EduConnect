import React, { useEffect, useState } from "react";

const STORAGE_KEY = "educonnect-notice";
const HISTORY_KEY = "educonnect-notice-history";

function AdminNotices() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [date, setDate] = useState("");
  const [history, setHistory] = useState([]);
  const [currentNotice, setCurrentNotice] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      const data = JSON.parse(stored);
      setDate(data.date || "");
      setCurrentNotice(data);
    } catch {
      // ignore invalid storage
    }
  }, []);

  useEffect(() => {
    const storedHistory = localStorage.getItem(HISTORY_KEY);
    if (!storedHistory) return;
    try {
      const parsed = JSON.parse(storedHistory);
      if (Array.isArray(parsed)) {
        setHistory(parsed);
      }
    } catch {
      // ignore invalid storage
    }
  }, []);

  const publishNotice = (event) => {
    event.preventDefault();
    const trimmedBody = body.trim();
    if (!trimmedBody) return;
    const payload = {
      id: `${Date.now()}`,
      title: title.trim() || "Notice",
      body: trimmedBody,
      date: new Date().toLocaleDateString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setDate(payload.date);
    setCurrentNotice(payload);
    const nextHistory = [payload, ...history];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
    setHistory(nextHistory);
    window.dispatchEvent(new Event("notice-updated"));
    setTitle("");
    setBody("");
  };

  const deleteHistoryItem = (id) => {
    const nextHistory = history.filter((item) => item.id !== id);
    setHistory(nextHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
    const currentRaw = localStorage.getItem(STORAGE_KEY);
    if (currentRaw) {
      try {
        const current = JSON.parse(currentRaw);
        if (current?.id === id) {
          localStorage.removeItem(STORAGE_KEY);
          setDate("");
          window.dispatchEvent(new Event("notice-updated"));
        }
      } catch {
        // ignore
      }
    }
  };

  return (
    <section className="profile-page">
      <div className="profile-hero">
        <div>
          <h2>Notice Board</h2>
          <p>Create a notice that will appear on teacher and student dashboards.</p>
        </div>
      </div>

      <section className="notice-board" style={{ marginTop: "1.5rem" }}>
        <div className="notice-header">
          <span className="notice-icon">NB</span>
          <h2>Preview</h2>
        </div>
        {currentNotice?.body ? (
          <>
            <p>{currentNotice.title || "Notice"}</p>
            <p>{currentNotice.body}</p>
            {currentNotice.date && <span className="notice-date">{currentNotice.date}</span>}
          </>
        ) : (
          <p>No notices available right now.</p>
        )}
      </section>

      <section className="profile-section">
        <h3>Create Notice</h3>
        <form className="auth-form" onSubmit={publishNotice}>
          <label className="form-group">
            <span>Title</span>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Notice title"
            />
          </label>
          <label className="form-group">
            <span>Message</span>
            <textarea
              className="notice-message-input"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Write your notice here..."
              rows={5}
            />
          </label>
          <div className="profile-actions">
            <button className="btn btn-primary" type="submit">
              Publish Notice
            </button>
          </div>
        </form>
      </section>

      <section className="profile-section" style={{ marginTop: "1.5rem" }}>
        <h3>Notice History</h3>
        {history.length === 0 ? (
          <p className="notice-preview-empty">No previous notices.</p>
        ) : (
          <div className="notice-history-list">
            {history.map((item) => (
              <div key={item.id} className="notice-history-item">
                <div>
                  <p className="notice-preview-title">{item.title || "Notice"}</p>
                  <p className="notice-preview-body">{item.body}</p>
                  {item.date && <span className="notice-date">{item.date}</span>}
                </div>
                <button
                  className="notice-history-delete"
                  type="button"
                  onClick={() => deleteHistoryItem(item.id)}
                  aria-label="Delete notice"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

export default AdminNotices;
