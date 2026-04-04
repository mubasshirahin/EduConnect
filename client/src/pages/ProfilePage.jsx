import React, { useEffect, useState } from "react";

function ProfilePage({ authUser }) {
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

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    setProfile((prev) => ({ ...prev, credentialsFiles: files.map((file) => file.name) }));
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

  const completionFields = [
    "name",
    "email",
    "tutorId",
    "since",
    "phone",
    "additionalNumber",
    "address",
    "city",
    "location",
    "expectedSalary",
    "preferredCategories",
    "preferredClasses",
    "preferredSubjects",
    "tutoringMethod",
    "availableDays",
    "availableTime",
    "preferredLocations",
    "placeOfTutoring",
    "tutoringStyles",
    "totalExperience",
    "experienceDetails",
    "gender",
    "dob",
    "religion",
    "nationality",
    "nationalId",
    "facebook",
    "linkedin",
    "fatherName",
    "fatherNumber",
    "motherName",
    "motherNumber",
    "overview",
    "emergencyName",
    "emergencyRelation",
    "emergencyNumber",
    "emergencyAddress",
    "bscInstitute",
    "bscExamTitle",
    "bscMajor",
    "bscIdCard",
    "bscResult",
    "bscCurriculum",
    "bscFromDate",
    "bscToDate",
    "bscPassingYear",
    "bscCurrent",
    "hscInstitute",
    "hscExamTitle",
    "hscMajor",
    "hscIdCard",
    "hscResult",
    "hscCurriculum",
    "hscFromDate",
    "hscToDate",
    "hscPassingYear",
    "hscCurrent",
    "sscInstitute",
    "sscExamTitle",
    "sscMajor",
    "sscIdCard",
    "sscResult",
    "sscCurriculum",
    "sscFromDate",
    "sscToDate",
    "sscPassingYear",
    "sscCurrent",
  ];

  const filledCount = completionFields.filter((key) => {
    const value = profile[key];
    return value !== undefined && value !== null && String(value).trim().length > 0;
  }).length;

  const totalCount = completionFields.length + 1; // +1 for credentials files
  const completionPercent = Math.round(((filledCount + (profile.credentialsFiles?.length > 0 ? 1 : 0)) / totalCount) * 100);
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
      <span>{label}</span>
      {isEditing ? (
        <input type={type} name={name} value={profile[name] || ""} onChange={handleChange} />
      ) : (
        <p>{profile[name] || "-"}</p>
      )}
    </div>
  );

  const renderTextArea = (label, name) => (
    <div className="profile-field">
      <span>{label}</span>
      {isEditing ? (
        <textarea name={name} value={profile[name] || ""} onChange={handleChange} rows={4} />
      ) : (
        <p>{profile[name] || "-"}</p>
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
            <span>Tutor ID: {profile.tutorId}</span>
            <span>Since {profile.since}</span>
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
          <h3>Basic Information</h3>
          <div className="profile-fields">
            {renderField("Full Name", "name")}
            {renderField("Email", "email", "email")}
            {renderField("Phone Number", "phone", "tel")}
            {renderField("Additional Number", "additionalNumber", "tel")}
            {renderField("Address", "address")}
          </div>
        </section>

        <section className="profile-section">
          <h3>Tuition Information</h3>
          <div className="profile-fields">
            {renderField("City", "city")}
            {renderField("Location", "location")}
            {renderField("Preferred Locations", "preferredLocations")}
            {renderField("Expected Salary", "expectedSalary")}
            {renderField("Preferred Categories", "preferredCategories")}
            {renderField("Preferred Classes", "preferredClasses")}
            {renderField("Preferred Subjects", "preferredSubjects")}
            {renderField("Tutoring Method", "tutoringMethod")}
            {renderField("Available Days", "availableDays")}
            {renderField("Time", "availableTime")}
            {renderField("Place of Tutoring", "placeOfTutoring")}
            {renderField("Tutoring Styles", "tutoringStyles")}
            {renderField("Total Experience (Years)", "totalExperience")}
            {renderTextArea("Experience Details", "experienceDetails")}
          </div>
        </section>

        <section className="profile-section">
          <h3>Personal Information</h3>
          <div className="profile-fields">
            {renderField("Gender", "gender")}
            {renderField("Date of Birth", "dob", "date")}
            {renderField("Religion", "religion")}
            {renderField("Nationality", "nationality")}
            {renderField("National ID", "nationalId")}
            {renderField("Facebook Profile", "facebook")}
            {renderField("LinkedIn Profile", "linkedin")}
          </div>
        </section>

        <section className="profile-section">
          <h3>Family Information</h3>
          <div className="profile-fields">
            {renderField("Father's Name", "fatherName")}
            {renderField("Father's Number", "fatherNumber", "tel")}
            {renderField("Mother's Name", "motherName")}
            {renderField("Mother's Number", "motherNumber", "tel")}
          </div>
        </section>

        <section className="profile-section">
          <h3>Overview</h3>
          <div className="profile-fields">{renderTextArea("Overview", "overview")}</div>
        </section>

        <section className="profile-section">
          <h3>Emergency Information</h3>
          <div className="profile-fields">
            {renderField("Name", "emergencyName")}
            {renderField("Relation", "emergencyRelation")}
            {renderField("Number", "emergencyNumber")}
            {renderField("Address", "emergencyAddress")}
          </div>
        </section>

        <section className="profile-section">
          <h3>Education: Bachelor / Honors</h3>
          <div className="profile-fields">
            {renderField("Institute", "bscInstitute")}
            {renderField("Exam / Degree Title", "bscExamTitle")}
            {renderField("Major / Group", "bscMajor")}
            {renderField("ID Card No", "bscIdCard")}
            {renderField("Result", "bscResult")}
            {renderField("Curriculum", "bscCurriculum")}
            {renderField("From Date", "bscFromDate", "date")}
            {renderField("To Date", "bscToDate", "date")}
            {renderField("Year of Passing", "bscPassingYear")}
            {renderField("Current Institute", "bscCurrent")}
          </div>
        </section>

        <section className="profile-section">
          <h3>Education: Higher Secondary</h3>
          <div className="profile-fields">
            {renderField("Institute", "hscInstitute")}
            {renderField("Exam / Degree Title", "hscExamTitle")}
            {renderField("Major / Group", "hscMajor")}
            {renderField("ID Card No", "hscIdCard")}
            {renderField("Result", "hscResult")}
            {renderField("Curriculum", "hscCurriculum")}
            {renderField("From Date", "hscFromDate", "date")}
            {renderField("To Date", "hscToDate", "date")}
            {renderField("Year of Passing", "hscPassingYear")}
            {renderField("Current Institute", "hscCurrent")}
          </div>
        </section>

        <section className="profile-section">
          <h3>Education: Secondary</h3>
          <div className="profile-fields">
            {renderField("Institute", "sscInstitute")}
            {renderField("Exam / Degree Title", "sscExamTitle")}
            {renderField("Major / Group", "sscMajor")}
            {renderField("ID Card No", "sscIdCard")}
            {renderField("Result", "sscResult")}
            {renderField("Curriculum", "sscCurriculum")}
            {renderField("From Date", "sscFromDate", "date")}
            {renderField("To Date", "sscToDate", "date")}
            {renderField("Year of Passing", "sscPassingYear")}
            {renderField("Current Institute", "sscCurrent")}
          </div>
        </section>

        <section className="profile-section">
          <h3>Credential Information</h3>
          <div className="profile-fields">
            <div className="profile-field">
              <span>Credentials</span>
              {isEditing ? (
                <input type="file" name="credentialsFiles" accept="image/*" multiple onChange={handleFileChange} />
              ) : (
                <p>
                  {profile.credentialsFiles && profile.credentialsFiles.length > 0
                    ? `Uploaded ${profile.credentialsFiles.length} file(s)`
                    : "No files uploaded"}
                </p>
              )}
            </div>
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
