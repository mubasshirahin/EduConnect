import React, { useEffect, useState } from "react";

function ProfilePage({ authUser }) {
  const requiredFields = new Set([
    "name",
    "email",
    "phone",
    "address",
    "bscCurriculum",
    "preferredClasses",
    "hscInstitute",
    "city",
    "emergencyName",
    "emergencyNumber",
    "idCardImage",
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const buildEmptyProfile = (user) => ({
    name: user?.name || "",
    email: user?.email || "",
    tutorId: user?.tutorId || "",
    since: "",
    phone: "",
    additionalNumber: "",
    address: "",
    city: "",
    location: "",
    expectedSalary: "",
    preferredCategories: "",
    preferredClasses: "",
    preferredSubjects: "",
    tutoringMethod: "",
    availableDays: "",
    availableTime: "",
    preferredLocations: "",
    placeOfTutoring: "",
    tutoringStyles: "",
    totalExperience: "",
    experienceDetails: "",
    gender: "",
    dob: "",
    religion: "",
    nationality: "",
    nationalId: "",
    facebook: "",
    linkedin: "",
    fatherName: "",
    fatherNumber: "",
    motherName: "",
    motherNumber: "",
    overview: "",
    emergencyName: "",
    emergencyRelation: "",
    emergencyNumber: "",
    emergencyAddress: "",
    idCardImage: "",
    avatarUrl: "",
    bscInstitute: "",
    bscExamTitle: "",
    bscMajor: "",
    bscIdCard: "",
    bscResult: "",
    bscCurriculum: "",
    bscFromDate: "",
    bscToDate: "",
    bscPassingYear: "",
    bscCurrent: "",
    hscInstitute: "",
    hscExamTitle: "",
    hscMajor: "",
    hscIdCard: "",
    hscResult: "",
    hscCurriculum: "",
    hscFromDate: "",
    hscToDate: "",
    hscPassingYear: "",
    hscCurrent: "",
    sscInstitute: "",
    sscExamTitle: "",
    sscMajor: "",
    sscIdCard: "",
    sscResult: "",
    sscCurriculum: "",
    sscFromDate: "",
    sscToDate: "",
    sscPassingYear: "",
    sscCurrent: "",
    credentialsFiles: [],
  });

  const profileStorageKey = authUser?.email
    ? `educonnect-profile:${authUser.email}`
    : "educonnect-profile:guest";

  const [profile, setProfile] = useState(() => {
    const stored = localStorage.getItem(profileStorageKey);
    if (stored) {
      try {
        return { ...buildEmptyProfile(authUser), ...JSON.parse(stored) };
      } catch {
        return buildEmptyProfile(authUser);
      }
    }
    return buildEmptyProfile(authUser);
  });

  useEffect(() => {
    const stored = localStorage.getItem(profileStorageKey);
    if (stored) {
      try {
        setProfile({ ...buildEmptyProfile(authUser), ...JSON.parse(stored) });
        return;
      } catch {
        // fall through to reset
      }
    }
    setProfile(buildEmptyProfile(authUser));
  }, [profileStorageKey]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (event) => {
    event.preventDefault();
    localStorage.setItem(profileStorageKey, JSON.stringify(profile));
    setIsEditing(false);
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile((prev) => ({ ...prev, avatarUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleIdCardChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile((prev) => ({ ...prev, idCardImage: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const completionFields = [
    "name",
    "email",
    "phone",
    "address",
    "city",
    "bscCurriculum",
    "preferredClasses",
    "hscInstitute",
    "emergencyName",
    "emergencyNumber",
    "idCardImage",
  ];

  const filledCount = completionFields.filter((key) => {
    const value = profile[key];
    return value !== undefined && value !== null && String(value).trim().length > 0;
  }).length;

  const totalCount = completionFields.length;
  const completionPercent = Math.round((filledCount / totalCount) * 100);
  const isComplete = completionPercent >= 80;

  useEffect(() => {
    const safePercent = Number.isFinite(completionPercent) ? Math.min(100, Math.max(0, completionPercent)) : 0;
    const completionKey = authUser?.email
      ? `profileCompletionPercent:${authUser.email}`
      : "profileCompletionPercent:guest";
    localStorage.setItem(completionKey, String(safePercent));
  }, [completionPercent, authUser?.email]);

  const renderField = (label, name, type = "text") => (
    <div className="profile-field">
      <span>
        {label}
        {requiredFields.has(name) ? <strong className="profile-required-mark">*</strong> : null}
      </span>
      {isEditing ? (
        <input
          type={type}
          name={name}
          value={profile[name] || ""}
          onChange={handleChange}
          required={requiredFields.has(name)}
        />
      ) : (
        <p>{profile[name] || "-"}</p>
      )}
    </div>
  );

  const renderTextArea = (label, name) => (
    <div className="profile-field profile-field-full">
      <span>
        {label}
        {requiredFields.has(name) ? <strong className="profile-required-mark">*</strong> : null}
      </span>
      {isEditing ? (
        <textarea
          name={name}
          value={profile[name] || ""}
          onChange={handleChange}
          rows={4}
          required={requiredFields.has(name)}
        />
      ) : (
        <p>{profile[name] || "-"}</p>
      )}
    </div>
  );

  const renderImageUpload = (label, name, onChange) => (
    <div className="profile-field profile-field-full">
      <span>
        {label}
        {requiredFields.has(name) ? <strong className="profile-required-mark">*</strong> : null}
      </span>
      {isEditing ? (
        <>
          <input type="file" accept="image/*" onChange={onChange} required={requiredFields.has(name) && !profile[name]} />
          {profile[name] ? <img src={profile[name]} alt={label} className="profile-upload-preview" /> : null}
        </>
      ) : profile[name] ? (
        <img src={profile[name]} alt={label} className="profile-upload-preview" />
      ) : (
        <p>No image uploaded</p>
      )}
    </div>
  );

  return (
    <section className="profile-page">
      <div className="profile-hero">
        <div 
          className={`profile-avatar ${isEditing ? "profile-avatar-editable" : ""}`}
          onClick={() => isEditing && document.getElementById("avatar-upload").click()}
        >
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.name} className="avatar-img" />
          ) : (
            profile.name?.charAt(0).toUpperCase() || "PI"
          )}
          {isEditing && (
            <div className="avatar-overlay">
              <span>Change</span>
            </div>
          )}
        </div>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleAvatarChange}
        />
        <div>
          <h2>{profile.name}</h2>
          <p>{profile.email}</p>
          <div className="profile-meta">
            <span>{authUser?.role === "teacher" ? "Teacher Profile" : "Student Profile"}</span>
          </div>
          <div className="profile-meta">
            <span>Profile Completion: {completionPercent}%</span>
            <span>{isComplete ? "Complete (80%+)" : ""}</span>
          </div>
          <div style={{ marginTop: "8px" }}>
            <div
              style={{
                height: "10px",
                width: "100%",
                maxWidth: "320px",
                background: "#e7ecf2",
                borderRadius: "999px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${completionPercent}%`,
                  background: isComplete ? "#1fbf75" : "#f2b01e",
                  transition: "width 0.25s ease",
                }}
              />
            </div>
          </div>
        </div>
        <button className="btn btn-primary" type="button" onClick={() => setIsEditing((prev) => !prev)}>
          {isEditing ? "Cancel" : "Edit Information"}
        </button>
      </div>

      <form className="profile-grid" onSubmit={handleSave}>
        <section className="profile-section">
          <h3>Profile Information</h3>
          <div className="profile-fields">
            {renderField("Full Name", "name")}
            {renderField("Email", "email", "email")}
            {renderField("Phone Number", "phone", "tel")}
            {renderField("Date of Birth", "dob", "date")}
            {renderField("Gender", "gender")}
            {renderField("Religion", "religion")}
            {renderField("Medium", "bscCurriculum")}
            {renderField("Address", "address")}
            {renderField("Class / Level", "preferredClasses")}
            {renderField("School / College Name", "hscInstitute")}
            {renderField("City", "city")}
            {renderTextArea("Short Overview", "overview")}
            {renderImageUpload("ID Card Photo", "idCardImage", handleIdCardChange)}
          </div>
        </section>

        <section className="profile-section">
          <h3>Emergency Contact</h3>
          <div className="profile-fields">
            {renderField("Contact Name", "emergencyName")}
            {renderField("Relation With You", "emergencyRelation")}
            {renderField("Phone Number", "emergencyNumber", "tel")}
          </div>
        </section>

        {isEditing && (
          <div className="profile-actions">
            <button className="btn btn-primary" type="submit">
              Save Changes
            </button>
          </div>
        )}
      </form>
    </section>
  );
}

export default ProfilePage;
