import React, { useEffect, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

function TeacherSettings({ authUser, onLogout }) {
  const { t } = useLanguage();
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
    setStatusMessage(t("settings.status.saved"));
  };

  const handleResetProfile = () => {
    localStorage.removeItem(profileStorageKey);
    localStorage.removeItem(completionStorageKey);
    setStatusMessage(t("settings.status.resetSuccess"));
  };

  const handleLogoutClick = () => {
    if (window.confirm(t("settings.logoutConfirm"))) {
      onLogout();
    }
  };

  return (
    <section className="settings-page">
      <div className="settings-hero">
        <div>
          <p className="tile-label">{t("dashboard.teacherDashboard")}</p>
          <h2>{t("settings.title")}</h2>
          <p>{t("settings.subtitle")}</p>
        </div>
        <a className="btn btn-primary" href="#profile">
          {t("settings.buttons.editProfile")}
        </a>
      </div>

      <div className="settings-grid">
        <section className="settings-card">
          <h3>{t("settings.sections.profile")}</h3>
          <div className="settings-list">
            <div className="settings-row">
              <div>
                <strong>{t("settings.labels.name")}</strong>
                <p>{authUser?.name || t("common.userFallback")}</p>
              </div>
            </div>
            <div className="settings-row">
              <div>
                <strong>{t("settings.labels.email")}</strong>
                <p>{authUser?.email || "-"}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="settings-card">
          <h3>{t("settings.sections.preferences")}</h3>
          <div className="settings-list">
            <label className="settings-toggle">
              <div>
                <strong>{t("settings.labels.publicProfile")}</strong>
                <p>{t("settings.labels.publicProfileDesc")}</p>
              </div>
              <input
                type="checkbox"
                checked={settings.profileVisible}
                onChange={(event) => updateSetting("profileVisible", event.target.checked)}
              />
            </label>

            <label className="settings-toggle">
              <div>
                <strong>{t("settings.labels.messageNotifications")}</strong>
                <p>{t("settings.labels.messageNotificationsDesc")}</p>
              </div>
              <input
                type="checkbox"
                checked={settings.messageNotifications}
                onChange={(event) => updateSetting("messageNotifications", event.target.checked)}
              />
            </label>

            <div className="settings-field">
              <label htmlFor="teacher-availability">
                <strong>{t("settings.labels.availability")}</strong>
              </label>
              <p>{t("settings.labels.availabilityDesc")}</p>
              <select
                id="teacher-availability"
                value={settings.availability}
                onChange={(event) => updateSetting("availability", event.target.value)}
              >
                <option value="available">{t("settings.options.available")}</option>
                <option value="busy">{t("settings.options.busy")}</option>
                <option value="offline">{t("settings.options.offline")}</option>
              </select>
            </div>
          </div>
        </section>

        <section className="settings-card">
          <h3>{t("settings.sections.actions")}</h3>
          <div className="settings-actions">
            <a className="btn btn-ghost" href="#messages">
              {t("settings.buttons.openMessages")}
            </a>
            <button className="btn btn-ghost" type="button" onClick={handleResetProfile}>
              {t("settings.buttons.resetProfile")}
            </button>
            <button className="btn btn-primary" type="button" onClick={handleLogoutClick}>
              {t("settings.logout")}
            </button>
          </div>
          {statusMessage ? <p className="settings-status">{statusMessage}</p> : null}
        </section>
      </div>
    </section>
  );
}

export default TeacherSettings;

