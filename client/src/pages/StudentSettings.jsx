import React, { useEffect, useState } from "react";

function StudentSettings({ authUser, onLogout }) {
  const settingsStorageKey = authUser?.email
    ? `educonnect-student-settings:${authUser.email}`
    : "educonnect-student-settings:guest";
  const profileStorageKey = authUser?.email
    ? `educonnect-profile:${authUser.email}`
    : "educonnect-profile:guest";
  const completionStorageKey = authUser?.email
    ? `profileCompletionPercent:${authUser.email}`
    : "profileCompletionPercent:guest";

  const [settings, setSettings] = useState({
    messageNotifications: true,
    tutorMatchAlerts: true,
    weeklyDigest: false,
    supportPreference: "chat",
  });
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(settingsStorageKey);
    if (!stored) return;
    try {
      setSettings((prev) => ({ ...prev, ...JSON.parse(stored) }));
    } catch {
      // Ignore malformed local state and fall back to defaults.
    }
  }, [settingsStorageKey]);

  const updateSetting = (key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(settingsStorageKey, JSON.stringify(next));
      return next;
    });
    setStatusMessage("Settings saved.");
  };

  const handleResetProfile = () => {
    localStorage.removeItem(profileStorageKey);
    localStorage.removeItem(completionStorageKey);
    setStatusMessage("Saved profile data cleared. Reload the profile page to start fresh.");
  };

  return (
    <section className="settings-page">
      <div className="settings-hero">
        <div>
          <p className="tile-label">Student Dashboard</p>
          <h2>Settings</h2>
          <p>Keep only the essentials you need for your account and support requests.</p>
        </div>
        <a className="btn btn-primary" href="#profile">
          Edit Profile
        </a>
      </div>

      <div className="settings-grid">
        <section className="settings-card">
          <h3>Profile</h3>
          <div className="settings-list">
            <div className="settings-row">
              <div>
                <strong>Name</strong>
                <p>{authUser?.name || "Student"}</p>
              </div>
            </div>
            <div className="settings-row">
              <div>
                <strong>Email</strong>
                <p>{authUser?.email || "-"}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="settings-card">
          <h3>Preferences</h3>
          <div className="settings-list">
            <label className="settings-toggle">
              <div>
                <strong>Message notifications</strong>
                <p>Stay updated when teachers or admins reply to your messages.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.messageNotifications}
                onChange={(event) => updateSetting("messageNotifications", event.target.checked)}
              />
            </label>

            <div className="settings-field">
              <label htmlFor="student-support-preference">
                <strong>Support preference</strong>
              </label>
              <p>Choose how admin should follow up about your tutor request.</p>
              <select
                id="student-support-preference"
                value={settings.supportPreference}
                onChange={(event) => updateSetting("supportPreference", event.target.value)}
              >
                <option value="chat">In-app chat</option>
                <option value="email">Email</option>
                <option value="phone">Phone call</option>
              </select>
            </div>
          </div>
        </section>

        <section className="settings-card">
          <h3>Quick actions</h3>
          <div className="settings-actions">
            <a className="btn btn-ghost" href="#messages">
              Open Messages
            </a>
            <button className="btn btn-ghost" type="button" onClick={handleResetProfile}>
              Reset Saved Profile
            </button>
            <button className="btn btn-primary" type="button" onClick={onLogout}>
              Logout
            </button>
          </div>
          {statusMessage ? <p className="settings-status">{statusMessage}</p> : null}
        </section>
      </div>
    </section>
  );
}

export default StudentSettings;
