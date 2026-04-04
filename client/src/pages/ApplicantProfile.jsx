import React, { useEffect, useState } from "react";

function ApplicantProfile({ email, authUser }) {
  const [profile, setProfile] = useState({
    name: "Applicant Name",
    email,
    phone: "Not provided",
    address: "Not provided",
    city: "Not provided",
    location: "Not provided",
    expectedSalary: "Not provided",
    preferredClasses: "Not provided",
    preferredSubjects: "Not provided",
    gender: "Not provided",
    dob: "Not provided",
    nationality: "Not provided",
    facebook: "Not provided",
    linkedin: "Not provided",
    emergencyName: "Not provided",
    emergencyRelation: "Not provided",
    emergencyNumber: "Not provided",
    emergencyAddress: "Not provided",
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
      <p>{value || "Not provided"}</p>
    </div>
  );

  return (
    <section className="profile-page">
      <div className="profile-hero">
        <div className="profile-avatar">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.name} className="avatar-img" />
          ) : (
            profile.name?.charAt(0).toUpperCase() || "AP"
          )}
        </div>
        <div>
          <h2>{profile.name}</h2>
          <p>{profile.email}</p>
          <div className="profile-meta">
            <span>Applicant Profile</span>
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
            Message
          </button>
          <a className="btn btn-ghost" href="#status">
            Back to Status
          </a>
        </div>
      </div>
      <div className="profile-grid">
        <section className="profile-section">
          <h3>Basic Information</h3>
          <div className="profile-fields">
            {renderField("Full Name", profile.name)}
            {renderField("Email", profile.email)}
            {renderField("Phone Number", profile.phone)}
            {renderField("Address", profile.address)}
          </div>
        </section>
        <section className="profile-section">
          <h3>Tuition Information</h3>
          <div className="profile-fields">
            {renderField("City", profile.city)}
            {renderField("Location", profile.location)}
            {renderField("Expected Salary", profile.expectedSalary)}
            {renderField("Preferred Classes", profile.preferredClasses)}
            {renderField("Preferred Subjects", profile.preferredSubjects)}
          </div>
        </section>
        <section className="profile-section">
          <h3>Personal Information</h3>
          <div className="profile-fields">
            {renderField("Gender", profile.gender)}
            {renderField("Date of Birth", profile.dob)}
            {renderField("Nationality", profile.nationality)}
            {renderField("Facebook Profile", profile.facebook)}
            {renderField("LinkedIn Profile", profile.linkedin)}
          </div>
        </section>
        <section className="profile-section">
          <h3>Emergency Information</h3>
          <div className="profile-fields">
            {renderField("Name", profile.emergencyName)}
            {renderField("Relation", profile.emergencyRelation)}
            {renderField("Number", profile.emergencyNumber)}
            {renderField("Address", profile.emergencyAddress)}
          </div>
        </section>
      </div>
    </section>
  );
}

export default ApplicantProfile;
