import React, { useEffect, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

function ApplicantProfile({ email, authUser }) {
  const { t } = useLanguage();
  const [profile, setProfile] = useState({
    name: "Applicant Name",
    email,
    phone: t("profile.notProvided"),
    address: t("profile.notProvided"),
    city: t("profile.notProvided"),
    location: t("profile.notProvided"),
    expectedSalary: t("profile.notProvided"),
    preferredClasses: t("profile.notProvided"),
    preferredSubjects: t("profile.notProvided"),
    gender: t("profile.notProvided"),
    dob: t("profile.notProvided"),
    nationality: t("profile.notProvided"),
    facebook: t("profile.notProvided"),
    linkedin: t("profile.notProvided"),
    emergencyName: t("profile.notProvided"),
    emergencyRelation: t("profile.notProvided"),
    emergencyNumber: t("profile.notProvided"),
    emergencyAddress: t("profile.notProvided"),
    avatarUrl: "",
  });

  useEffect(() => {
    const profileKey = `educonnect-profile:${email}`;
    const stored = localStorage.getItem(profileKey);
    if (stored) {
      try {
        setProfile((prev) => ({ ...prev, ...JSON.parse(stored) }));
      } catch {
        // use defaults
      }
    }
  }, [email]);

  const renderField = (label, value) => (
    <div className="profile-field">
      <span>{label}</span>
      <p>{value || t("profile.notProvided")}</p>
    </div>
  );

  return (
    <section className="profile-page">
      <div className="profile-hero">
        <div className="profile-avatar">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.name} className="avatar-img" />
          ) : (
            <span className="avatar-initials">{profile.name?.charAt(0).toUpperCase() || "AP"}</span>
          )}
        </div>
        <div>
          <h2>{profile.name}</h2>
          <p>{profile.email}</p>
          <div className="profile-meta">
            <span>{t("profile.applicantProfile")}</span>
          </div>
        </div>
        <div className="profile-actions">
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => {
              if (!authUser?.email) {
                return;
              }
              const params = new URLSearchParams({ to: email, name: profile.name });
              window.location.hash = `#messages?${params.toString()}`;
            }}
          >
            {t("profile.message")}
          </button>
          <a className="btn btn-ghost" href="#status">
            {t("profile.backToStatus")}
          </a>
        </div>
      </div>
      <div className="profile-grid">
        <section className="profile-section">
          <h3>{t("profile.sections.basic")}</h3>
          <div className="profile-fields">
            {renderField(t("profile.labels.name"), profile.name)}
            {renderField(t("profile.labels.email"), profile.email)}
            {renderField(t("profile.labels.phone"), profile.phone)}
            {renderField(t("profile.labels.address"), profile.address)}
          </div>
        </section>
        <section className="profile-section">
          <h3>{t("profile.sections.tuition")}</h3>
          <div className="profile-fields">
            {renderField(t("profile.labels.city"), profile.city)}
            {renderField(t("profile.labels.location"), profile.location)}
            {renderField(t("profile.labels.salary"), profile.expectedSalary)}
            {renderField(t("profile.labels.classes"), profile.preferredClasses)}
            {renderField(t("profile.labels.subjects"), profile.preferredSubjects)}
          </div>
        </section>
        <section className="profile-section">
          <h3>{t("profile.sections.personal")}</h3>
          <div className="profile-fields">
            {renderField(t("profile.labels.gender"), profile.gender)}
            {renderField(t("profile.labels.dob"), profile.dob)}
            {renderField(t("profile.labels.nationality"), profile.nationality)}
            {renderField(t("profile.labels.facebook"), profile.facebook)}
            {renderField(t("profile.labels.linkedin"), profile.linkedin)}
          </div>
        </section>
        <section className="profile-section">
          <h3>{t("profile.sections.emergency")}</h3>
          <div className="profile-fields">
            {renderField(t("profile.labels.name"), profile.emergencyName)}
            {renderField(t("profile.labels.relation"), profile.emergencyRelation)}
            {renderField(t("profile.labels.phone"), profile.emergencyNumber)}
            {renderField(t("profile.labels.address"), profile.emergencyAddress)}
          </div>
        </section>
      </div>
    </section>
  );
}

export default ApplicantProfile;

