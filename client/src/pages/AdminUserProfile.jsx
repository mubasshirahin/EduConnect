import React, { useEffect, useState } from "react";

function AdminUserProfile({ email }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionState, setActionState] = useState({ loading: false, error: "", success: "" });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/users/${encodeURIComponent(email)}`);
        const data = await response.json();
        setUser(data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [email]);

  const handleToggleBlock = async () => {
    if (!user?.email) return;
    const nextBlocked = !user.isBlocked;
    setActionState({ loading: true, error: "", success: "" });
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(user.email)}/block`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked: nextBlocked }),
      });
      const data = await response.json();
      if (!response.ok) {
        setActionState({ loading: false, error: data?.message || "Unable to update user.", success: "" });
        return;
      }
      setUser((prev) => ({ ...prev, ...data.user }));
      setActionState({
        loading: false,
        error: "",
        success: nextBlocked ? "User blocked successfully." : "User unblocked successfully.",
      });
    } catch {
      setActionState({ loading: false, error: "Unable to update user.", success: "" });
    }
  };

  const renderField = (label, value) => (
    <div className="profile-field">
      <span>{label}</span>
      <p>{value || "Not provided"}</p>
    </div>
  );

  if (loading) {
    return (
      <section className="profile-page">
        <div className="job-empty">
          <h3>Loading user...</h3>
          <p>Please wait a moment.</p>
        </div>
      </section>
    );
  }

  if (!user?.email) {
    return (
      <section className="profile-page">
        <div className="job-empty">
          <h3>User not found</h3>
          <p>Try selecting another account.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="profile-page">
      <div className="profile-hero">
        <div className="profile-avatar">US</div>
        <div>
          <h2>{user.name || "User"}</h2>
          <p>{user.email}</p>
          <div className="profile-meta">
            <span>Role: {user.role}</span>
            {user.isBlocked ? <span className="status-pill status-pill-danger">Blocked</span> : null}
          </div>
        </div>
        <div className="profile-actions">
          <button
            className={`btn ${user.isBlocked ? "btn-ghost" : "btn-primary"}`}
            type="button"
            onClick={handleToggleBlock}
            disabled={actionState.loading}
          >
            {actionState.loading ? "Updating..." : user.isBlocked ? "Unblock User" : "Block User"}
          </button>
          <a className="btn btn-ghost" href="#admin-users">
            Back to Users
          </a>
        </div>
      </div>
      {actionState.error ? <p className="auth-status auth-status-error">{actionState.error}</p> : null}
      {actionState.success ? <p className="auth-status auth-status-success">{actionState.success}</p> : null}
      <div className="profile-grid">
        <section className="profile-section">
          <h3>Basic Information</h3>
          <div className="profile-fields">
            {renderField("Full Name", user.name)}
            {renderField("Email", user.email)}
            {renderField("Role", user.role)}
            {renderField("Joined", user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "")}
          </div>
        </section>
        <section className="profile-section">
          <h3>Tuition Information</h3>
          <div className="profile-fields">
            {renderField("City", user.city)}
            {renderField("Location", user.location)}
            {renderField("Expected Salary", user.expectedSalary)}
            {renderField("Preferred Classes", user.preferredClasses)}
            {renderField("Preferred Subjects", user.preferredSubjects)}
          </div>
        </section>
        <section className="profile-section">
          <h3>Personal Information</h3>
          <div className="profile-fields">
            {renderField("Gender", user.gender)}
            {renderField("Date of Birth", user.dob)}
            {renderField("Nationality", user.nationality)}
            {renderField("Facebook Profile", user.facebook)}
            {renderField("LinkedIn Profile", user.linkedin)}
          </div>
        </section>
        <section className="profile-section">
          <h3>Emergency Information</h3>
          <div className="profile-fields">
            {renderField("Name", user.emergencyName)}
            {renderField("Relation", user.emergencyRelation)}
            {renderField("Number", user.emergencyNumber)}
            {renderField("Address", user.emergencyAddress)}
          </div>
        </section>
      </div>
    </section>
  );
}

export default AdminUserProfile;
