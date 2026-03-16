import React, { useState } from "react";

function ProfileModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    location: user?.location || "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave?.(form);
  };

  return (
    <div className="auth-overlay" role="dialog" aria-modal="true" aria-label="Edit Profile">
      <div className="auth-modal">
        <div className="auth-modal-header">
          <div>
            <h3>Edit Profile</h3>
            <p>Update your profile details.</p>
          </div>
          <button className="auth-close" type="button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-group">
            <span>Full Name</span>
            <input type="text" name="name" value={form.name} onChange={handleChange} />
          </label>
          <label className="form-group">
            <span>Phone</span>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange} />
          </label>
          <label className="form-group">
            <span>Location</span>
            <input type="text" name="location" value={form.location} onChange={handleChange} />
          </label>
          <button className="btn btn-primary" type="submit">
            Save
          </button>
        </form>
      </div>
      <button className="auth-backdrop" type="button" onClick={onClose} aria-label="Close" />
    </div>
  );
}

export default ProfileModal;
