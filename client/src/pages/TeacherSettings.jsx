import React, { useEffect, useState } from "react";

function TeacherSettings({ authUser, onLogout }) {
  const settingsStorageKey = authUser?.email
    ? `educonnect-teacher-settings:${authUser.email}`
    : "educonnect-teacher-settings:guest";
  const profileStorageKey = authUser?.email
    ? `educonnect-profile:${authUser.email}`
    : "educonnect-profile:guest";
  const completionStorageKey = authUser?.email
    ? `profileCompletionPercent:${authUser.email}`
    : "profileCompletionPercent:guest";

  const [settings, setSettings] = useState({
    profileVisible: true,
    messageNotifications: true,
    jobAlerts: true,
    availability: "available",
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
          <p className="tile-label">Teacher Dashboard</p>
          <h2>Settings</h2>
          <p>Manage your visibility, notifications, and account actions from one place.</p>
        </div>
        <a className="btn btn-primary" href="#profile">
          Edit Profile
        </a>
      </div>

      <div className="settings-grid">
        <section className="settings-card">
          <h3>Account</h3>
          <div className="settings-list">
            <div className="settings-row">
              <div>
                <strong>Name</strong>
                <p>{authUser?.name || "Teacher"}</p>
              </div>
            </div>
            <div className="settings-row">
              <div>
                <strong>Email</strong>
                <p>{authUser?.email || "-"}</p>
              </div>
            </div>
            <div className="settings-row">
              <div>
                <strong>Tutor ID</strong>
                <p>{authUser?.tutorId || "-"}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="settings-card">
          <h3>Preferences</h3>
          <div className="settings-list">
            <label className="settings-toggle">
              <div>
                <strong>Public profile</strong>
                <p>Allow students to discover your tutoring profile more easily.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.profileVisible}
                onChange={(event) => updateSetting("profileVisible", event.target.checked)}
              />
            </label>

            <label className="settings-toggle">
              <div>
                <strong>Message notifications</strong>
                <p>Keep alerts on when students or admins send new messages.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.messageNotifications}
                onChange={(event) => updateSetting("messageNotifications", event.target.checked)}
              />
            </label>

            <label className="settings-toggle">
              <div>
                <strong>Job alerts</strong>
                <p>Get notified when matching tuition jobs appear.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.jobAlerts}
                onChange={(event) => updateSetting("jobAlerts", event.target.checked)}
              />
            </label>

            <div className="settings-field">
              <label htmlFor="teacher-availability">
                <strong>Availability</strong>
              </label>
              <p>Let the dashboard reflect whether you are ready to take new students.</p>
              <select
                id="teacher-availability"
                value={settings.availability}
                onChange={(event) => updateSetting("availability", event.target.value)}
              >
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="offline">Offline</option>
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

export default TeacherSettings;
