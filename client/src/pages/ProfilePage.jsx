import React, { useState } from "react";

function ProfilePage({ authUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: authUser?.name || "Mubasshir Ahin",
    email: authUser?.email || "mubasshirahinpa@gmail.com",
    tutorId: "325860",
    since: "Apr 15, 2024",
    phone: "01601601569",
    address: "Mohanogor Project, Hatirjhil",
    city: "Dhaka",
    location: "Hatirjheel",
    expectedSalary: "6000",
    preferredClasses: "HSC - 1st Year",
    preferredSubjects: "Physics, Chemistry, ICT, Higher Maths",
    gender: "Male",
    dob: "2004-10-30",
    nationality: "Bangladesh",
    facebook: "www.facebook.com/MubasshirAhin",
    linkedin: "www.linkedin.com/MubasshirAhin",
    emergencyName: "Mehdi Hasan",
    emergencyRelation: "Father",
    emergencyNumber: "01630588015",
    emergencyAddress: "Chattogram",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (event) => {
    event.preventDefault();
    setIsEditing(false);
  };

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

  return (
    <section className="profile-page">
      <div className="profile-hero">
        <div className="profile-avatar">PI</div>
        <div>
          <h2>{profile.name}</h2>
          <p>{profile.email}</p>
          <div className="profile-meta">
            <span>Tutor ID: {profile.tutorId}</span>
            <span>Since {profile.since}</span>
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
            {renderField("Address", "address")}
          </div>
        </section>

        <section className="profile-section">
          <h3>Tuition Information</h3>
          <div className="profile-fields">
            {renderField("City", "city")}
            {renderField("Location", "location")}
            {renderField("Expected Salary", "expectedSalary")}
            {renderField("Preferred Classes", "preferredClasses")}
            {renderField("Preferred Subjects", "preferredSubjects")}
          </div>
        </section>

        <section className="profile-section">
          <h3>Personal Information</h3>
          <div className="profile-fields">
            {renderField("Gender", "gender")}
            {renderField("Date of Birth", "dob", "date")}
            {renderField("Nationality", "nationality")}
            {renderField("Facebook Profile", "facebook")}
            {renderField("LinkedIn Profile", "linkedin")}
          </div>
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
