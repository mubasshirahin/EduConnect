import React, { useEffect, useState } from "react";

const NOTICE_KEY = "educonnect-notice";
const NOTICE_HISTORY_KEY = "educonnect-notice-history";

function AdminSettings({ authUser, onLogout }) {
  const settingsStorageKey = authUser?.email
    ? `educonnect-admin-settings:${authUser.email}`
    : "educonnect-admin-settings:guest";

  const [settings, setSettings] = useState({
    maintenanceMode: false,
    allowNewRegistrations: true,
    adminEmailAlerts: true,
    dashboardAudience: "all",
  });
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(settingsStorageKey);
    if (!stored) return;
    try {
      setSettings((prev) => ({ ...prev, ...JSON.parse(stored) }));
    } catch {
      // Ignore malformed settings and keep defaults.
    }
  }, [settingsStorageKey]);

  const updateSetting = (key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(settingsStorageKey, JSON.stringify(next));
      return next;
    });
    setStatusMessage("Admin settings saved.");
  };

  const clearAllNotices = () => {
    localStorage.removeItem(NOTICE_KEY);
    localStorage.removeItem(NOTICE_HISTORY_KEY);
    window.dispatchEvent(new Event("notice-updated"));
    setStatusMessage("All published notices were cleared.");
  };

  return (
    <section className="settings-page">
      <div className="settings-hero">
        <div>
          <p className="tile-label">Admin Panel</p>
          <h2>Settings</h2>
          <p>Control platform behavior, notice visibility, and quick admin actions from one place.</p>
        </div>
        <a className="btn btn-primary" href="#notices">
          Manage Notices
        </a>
      </div>

      <div className="settings-grid">
        <section className="settings-card">
          <h3>Account</h3>
          <div className="settings-list">
            <div className="settings-row">
              <div>
                <strong>Name</strong>
                <p>{authUser?.name || "Admin"}</p>
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
                <strong>Role</strong>
                <p>{authUser?.role || "admin"}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="settings-card">
          <h3>Platform Controls</h3>
          <div className="settings-list">
            <label className="settings-toggle">
              <div>
                <strong>Maintenance mode</strong>
                <p>Use this saved flag to mark when the admin team is doing platform updates.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(event) => updateSetting("maintenanceMode", event.target.checked)}
              />
            </label>

            <label className="settings-toggle">
              <div>
                <strong>Allow new registrations</strong>
                <p>Keep signup availability tracked from the admin panel.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.allowNewRegistrations}
                onChange={(event) => updateSetting("allowNewRegistrations", event.target.checked)}
              />
            </label>

            <label className="settings-toggle">
              <div>
                <strong>Admin email alerts</strong>
                <p>Save whether new platform activity should trigger admin follow-up alerts.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.adminEmailAlerts}
                onChange={(event) => updateSetting("adminEmailAlerts", event.target.checked)}
              />
            </label>

            <div className="settings-field">
              <label htmlFor="admin-dashboard-audience">
                <strong>Notice audience</strong>
              </label>
              <p>Track who your next dashboard notice is intended for.</p>
              <select
                id="admin-dashboard-audience"
                value={settings.dashboardAudience}
                onChange={(event) => updateSetting("dashboardAudience", event.target.value)}
              >
                <option value="all">Students and teachers</option>
                <option value="teachers">Teachers only</option>
                <option value="students">Students only</option>
              </select>
            </div>
          </div>
        </section>

        <section className="settings-card">
          <h3>Quick actions</h3>
          <div className="settings-actions">
            <a className="btn btn-ghost" href="#notices">
              Open Notices
            </a>
            <a className="btn btn-ghost" href="#admin-users">
              Manage Users
            </a>
            <button className="btn btn-ghost" type="button" onClick={clearAllNotices}>
              Clear Notice Board
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

export default AdminSettings;
