import React, { useEffect, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const NOTICE_KEY = "educonnect-notice";
const NOTICE_HISTORY_KEY = "educonnect-notice-history";

function AdminSettings({ authUser, onLogout }) {
  const { t } = useLanguage();
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
    setStatusMessage(t("settings.status.adminSaved"));
  };

  const clearAllNotices = () => {
    localStorage.removeItem(NOTICE_KEY);
    localStorage.removeItem(NOTICE_HISTORY_KEY);
    window.dispatchEvent(new Event("notice-updated"));
    setStatusMessage(t("settings.status.noticesCleared"));
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
          <p className="tile-label">Admin Panel</p>
          <h2>{t("settings.title")}</h2>
          <p>{t("settings.subtitle")}</p>
        </div>
        <a className="btn btn-primary" href="#notices">
          {t("settings.buttons.manageNotices")}
        </a>
      </div>

      <div className="settings-grid">
        <section className="settings-card">
          <h3>{t("settings.sections.account")}</h3>
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
            <div className="settings-row">
              <div>
                <strong>{t("settings.labels.role")}</strong>
                <p>{authUser?.role || "admin"}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="settings-card">
          <h3>{t("settings.sections.preferences")}</h3>
          <div className="settings-list">
            <label className="settings-toggle">
              <div>
                <strong>{t("settings.labels.maintenanceMode")}</strong>
                <p>{t("settings.labels.maintenanceModeDesc")}</p>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(event) => updateSetting("maintenanceMode", event.target.checked)}
              />
            </label>

            <label className="settings-toggle">
              <div>
                <strong>{t("settings.labels.allowRegistrations")}</strong>
                <p>{t("settings.labels.allowRegistrationsDesc")}</p>
              </div>
              <input
                type="checkbox"
                checked={settings.allowNewRegistrations}
                onChange={(event) => updateSetting("allowNewRegistrations", event.target.checked)}
              />
            </label>

            <label className="settings-toggle">
              <div>
                <strong>{t("settings.labels.adminEmailAlerts")}</strong>
                <p>{t("settings.labels.adminEmailAlertsDesc")}</p>
              </div>
              <input
                type="checkbox"
                checked={settings.adminEmailAlerts}
                onChange={(event) => updateSetting("adminEmailAlerts", event.target.checked)}
              />
            </label>

            <div className="settings-field">
              <label htmlFor="admin-dashboard-audience">
                <strong>{t("settings.labels.noticeAudience")}</strong>
              </label>
              <p>{t("settings.labels.noticeAudienceDesc")}</p>
              <select
                id="admin-dashboard-audience"
                value={settings.dashboardAudience}
                onChange={(event) => updateSetting("dashboardAudience", event.target.value)}
              >
                <option value="all">{t("settings.options.all")}</option>
                <option value="teachers">{t("settings.options.teachersOnly")}</option>
                <option value="students">{t("settings.options.studentsOnly")}</option>
              </select>
            </div>
          </div>
        </section>

        <section className="settings-card">
          <h3>{t("settings.sections.actions")}</h3>
          <div className="settings-actions">
            <a className="btn btn-ghost" href="#notices">
              {t("settings.buttons.manageNotices")}
            </a>
            <a className="btn btn-ghost" href="#admin-users">
              {t("settings.buttons.manageUsers")}
            </a>
            <button className="btn btn-ghost" type="button" onClick={clearAllNotices}>
              {t("settings.buttons.clearNoticeBoard")}
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

export default AdminSettings;

