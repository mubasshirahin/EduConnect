import React, { useEffect, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

function StudentSettings({ authUser, onLogout }) {
  const { t } = useLanguage();
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
          <p className="tile-label">{t("dashboard.studentDashboard")}</p>
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
                <strong>{t("settings.labels.messageNotifications")}</strong>
                <p>{t("settings.labels.studentMessageNotificationsDesc")}</p>
              </div>
              <input
                type="checkbox"
                checked={settings.messageNotifications}
                onChange={(event) => updateSetting("messageNotifications", event.target.checked)}
              />
            </label>

            <div className="settings-field">
              <label htmlFor="student-support-preference">
                <strong>{t("settings.labels.supportPreference")}</strong>
              </label>
              <p>{t("settings.labels.supportPreferenceDesc")}</p>
              <select
                id="student-support-preference"
                value={settings.supportPreference}
                onChange={(event) => updateSetting("supportPreference", event.target.value)}
              >
                <option value="chat">{t("settings.options.chat")}</option>
                <option value="email">{t("settings.options.email")}</option>
                <option value="phone">{t("settings.options.phone")}</option>
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

export default StudentSettings;

